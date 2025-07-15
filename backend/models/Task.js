import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please enter a task title'],
    trim: true,
    maxlength: [100, 'Task title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please enter a task description'],
    trim: true,
    maxlength: [500, 'Task description cannot exceed 500 characters']
  },
  priority: {
    type: String,
    required: [true, 'Please select a priority'],
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  dueDate: {
    type: Date,
    required: [true, 'Please select a due date'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Due date must be in the future'
    }
  },
  checklist: [{
    id: {
      type: String,
      required: true,
      default: function() {
        return new mongoose.Types.ObjectId().toString();
      }
    },
    text: {
      type: String,
      required: [true, 'Checklist item cannot be empty'],
      trim: true,
      maxlength: [100, 'Checklist item cannot exceed 100 characters']
    },
    completed: {
      type: Boolean,
      default: false
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'overdue'],
    default: 'pending'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { 
  timestamps: true 
});

// Index for faster queries
taskSchema.index({ createdBy: 1, createdAt: -1 });
taskSchema.index({ dueDate: 1 });

const Task = mongoose.model('Task', taskSchema);
export default Task;
