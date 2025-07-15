import express from 'express';
import { body } from 'express-validator';
import { 
  createTask, 
  getTasks, 
  getTaskById, 
  updateTask, 
  deleteTask, 
  getTaskStats,
  updateTaskStatus 
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Validation middleware for task creation and updates
const taskValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ max: 100 })
    .withMessage('Task title cannot exceed 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Task description is required')
    .isLength({ max: 500 })
    .withMessage('Task description cannot exceed 500 characters'),
  body('priority')
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Priority must be Low, Medium, or High'),
  body('dueDate')
    .isISO8601()
    .withMessage('Due date must be a valid date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Due date must be in the future');
      }
      return true;
    }),
  body('checklist')
    .optional()
    .isArray()
    .withMessage('Checklist must be an array'),
  body('checklist.*.text')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Checklist item text is required')
    .isLength({ max: 100 })
    .withMessage('Checklist item cannot exceed 100 characters')
];

// Routes (all routes are protected)
router.use(protect);

// GET /api/tasks/stats - Get task statistics
router.get('/stats', getTaskStats);

// GET /api/tasks - Get all tasks for the authenticated user
router.get('/', getTasks);

// POST /api/tasks - Create a new task
router.post('/', taskValidation, createTask);

// GET /api/tasks/:id - Get a specific task
router.get('/:id', getTaskById);

// PUT /api/tasks/:id - Update a specific task
router.put('/:id', taskValidation, updateTask);

// PATCH /api/tasks/:id/status - Update task status (for drag and drop)
router.patch('/:id/status', [
  body('status')
    .isIn(['pending', 'in-progress', 'completed', 'overdue'])
    .withMessage('Status must be pending, in-progress, completed, or overdue')
], updateTaskStatus);

// DELETE /api/tasks/:id - Delete a specific task
router.delete('/:id', deleteTask);

export default router;
