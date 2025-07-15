import Task from '../models/Task.js';
import { validationResult } from 'express-validator';

export const createTask = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { title, description, priority, dueDate, checklist } = req.body;

    // Create new task
    const task = await Task.create({
      title,
      description,
      priority,
      dueDate: new Date(dueDate),
      checklist: checklist || [],
      createdBy: req.user._id
    });

    // Populate the created task with user info
    await task.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ 
      error: 'Failed to create task',
      message: error.message 
    });
  }
};

export const getTasks = async (req, res) => {
  try {
    const { page = 1, limit = 10, priority, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Parse pagination parameters as integers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Build query filters
    const filter = { createdBy: req.user._id };
    if (priority) filter.priority = priority;
    if (status) filter.status = status;

    // Calculate skip value for pagination
    const skip = (pageNum - 1) * limitNum;

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get tasks with pagination
    const tasks = await Task.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .populate('createdBy', 'name email');

    // Get total count for pagination
    const totalTasks = await Task.countDocuments(filter);

    res.status(200).json({
      success: true,
      tasks,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalTasks / limitNum),
        totalTasks,
        hasNext: pageNum * limitNum < totalTasks,
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch tasks',
      message: error.message 
    });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id, 
      createdBy: req.user._id 
    }).populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ 
        error: 'Task not found' 
      });
    }

    res.status(200).json({
      success: true,
      task
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch task',
      message: error.message 
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { title, description, priority, dueDate, checklist, status } = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      {
        title,
        description,
        priority,
        dueDate: new Date(dueDate),
        checklist,
        status
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ 
        error: 'Task not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ 
      error: 'Failed to update task',
      message: error.message 
    });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ 
      _id: req.params.id, 
      createdBy: req.user._id 
    });

    if (!task) {
      return res.status(404).json({ 
        error: 'Task not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ 
      error: 'Failed to delete task',
      message: error.message 
    });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'in-progress', 'completed', 'overdue'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status',
        message: 'Status must be one of: pending, in-progress, completed, overdue'
      });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { status },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ 
        error: 'Task not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task status updated successfully',
      task
    });
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({ 
      error: 'Failed to update task status',
      message: error.message 
    });
  }
};

export const getTaskStats = async (req, res) => {
  try {
    const stats = await Task.aggregate([
      { $match: { createdBy: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Initialize all statuses with 0
    const result = {
      total: 0,
      pending: 0,
      'in-progress': 0,
      completed: 0,
      overdue: 0
    };

    // Calculate overdue tasks
    const overdueTasks = await Task.countDocuments({
      createdBy: req.user._id,
      dueDate: { $lt: new Date() },
      status: { $nin: ['completed'] }
    });

    result.overdue = overdueTasks;

    // Fill in actual counts
    stats.forEach(stat => {
      result[stat._id] = stat.count;
      result.total += stat.count;
    });

    res.status(200).json({
      success: true,
      stats: result
    });
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch task statistics',
      message: error.message 
    });
  }
};
