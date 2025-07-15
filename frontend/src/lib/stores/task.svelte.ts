interface Task {
  _id: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  dueDate: string;
  createdAt: string;
  checklist: Array<{ text: string; completed: boolean }>;
  createdBy: {
    name: string;
    email: string;
  };
}

interface TaskStats {
  total: number;
  pending: number;
  'in-progress': number;
  completed: number;
  overdue: number;
}

interface TaskStore {
  tasks: Task[];
  stats: TaskStats;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  activeFilter: 'all' | 'pending' | 'in-progress' | 'completed' | 'overdue';
}

class TaskStoreClass {
  private state = $state<TaskStore>({
    tasks: [],
    stats: {
      total: 0,
      pending: 0,
      'in-progress': 0,
      completed: 0,
      overdue: 0
    },
    isLoading: false,
    error: null,
    searchQuery: '',
    activeFilter: 'all'
  });

  get tasks() {
    return this.state.tasks;
  }

  get stats() {
    return this.state.stats;
  }

  get isLoading() {
    return this.state.isLoading;
  }

  get error() {
    return this.state.error;
  }

  get searchQuery() {
    return this.state.searchQuery;
  }

  get activeFilter() {
    return this.state.activeFilter;
  }

  get filteredTasks() {
    let filtered = this.state.tasks;

    // Apply status filter
    if (this.state.activeFilter !== 'all') {
      filtered = filtered.filter(task => task.status === this.state.activeFilter);
    }

    // Apply search filter
    if (this.state.searchQuery.trim()) {
      const query = this.state.searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  get tasksByStatus() {
    const groups = {
      pending: [] as Task[],
      'in-progress': [] as Task[],
      completed: [] as Task[],
      overdue: [] as Task[]
    };

    this.filteredTasks.forEach(task => {
      if (groups[task.status as keyof typeof groups]) {
        groups[task.status as keyof typeof groups].push(task);
      }
    });

    return groups;
  }

  setSearchQuery(query: string) {
    this.state.searchQuery = query;
  }

  setActiveFilter(filter: 'all' | 'pending' | 'in-progress' | 'completed' | 'overdue') {
    this.state.activeFilter = filter;
  }

  async fetchTasks() {
    this.state.isLoading = true;
    this.state.error = null;

    try {
      const response = await fetch('/api/tasks?limit=100&sortBy=createdAt&sortOrder=desc', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        this.state.tasks = data.tasks;
      } else {
        throw new Error(data.error || 'Failed to fetch tasks');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      this.state.error = this.handleApiError(error, 'Failed to fetch tasks');
    } finally {
      this.state.isLoading = false;
    }
  }

  async fetchStats() {
    try {
      const response = await fetch('/api/tasks/stats', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        this.state.stats = data.stats;
      }
    } catch (error) {
      console.error('Error fetching task stats:', error);
      this.state.error = this.handleApiError(error, 'Failed to fetch task statistics');
    }
  }

  async updateTaskStatus(taskId: string, newStatus: 'pending' | 'in-progress' | 'completed' | 'overdue') {
    try {
      const response = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Update the task in the local state
        const taskIndex = this.state.tasks.findIndex(task => task._id === taskId);
        if (taskIndex !== -1) {
          this.state.tasks[taskIndex] = data.task;
        }
        
        // Refresh stats
        await this.fetchStats();
        
        return data.task;
      } else {
        throw new Error(data.error || 'Failed to update task status');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      this.state.error = this.handleApiError(error, 'Failed to update task status');
      throw error;
    }
  }

  async deleteTask(taskId: string) {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Remove the task from local state
        this.state.tasks = this.state.tasks.filter(task => task._id !== taskId);
        
        // Refresh stats
        await this.fetchStats();
        
        return true;
      } else {
        throw new Error(data.error || 'Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      this.state.error = this.handleApiError(error, 'Failed to delete task');
      throw error;
    }
  }

  async updateTask(taskId: string, taskData: Partial<Omit<Task, '_id' | 'createdBy' | 'createdAt'>>) {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Update the task in the local state
        const taskIndex = this.state.tasks.findIndex(task => task._id === taskId);
        if (taskIndex !== -1) {
          this.state.tasks[taskIndex] = data.task;
        }
        
        // Refresh stats
        await this.fetchStats();
        
        return data.task;
      } else {
        throw new Error(data.error || 'Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      this.state.error = this.handleApiError(error, 'Failed to update task');
      throw error;
    }
  }

  clearError() {
    this.state.error = null;
  }

  private handleApiError(error: unknown, defaultMessage: string): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return defaultMessage;
  }

  async init() {
    await Promise.all([
      this.fetchTasks(),
      this.fetchStats()
    ]);
  }
}

export const taskStore = new TaskStoreClass();
export type { Task, TaskStats };
