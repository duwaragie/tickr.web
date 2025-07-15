<script lang="ts">
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth.svelte';
  import { themeStore } from '$lib/stores/theme.svelte';
  import { taskStore, type Task } from '$lib/stores/task.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import FloatingNavbar from '$lib/components/FloatingNavbar.svelte';
  import DragDropContainer from '$lib/components/DragDropContainer.svelte';
//   import TaskModal from '$lib/components/TaskModal.svelte';
import TaskEditModal from '$lib/components/TaskEditModal.svelte';
  import { onMount } from 'svelte';

  let user = $state(authStore.user);
  let isLoading = $state(authStore.isLoading);
  let currentTime = $state(new Date());
  let currentTheme = $state(themeStore.currentTheme);
  let searchQuery = $state('');
  let activeFilter = $state('all');

  // Modal state
  let isModalOpen = $state(false);
  let selectedTask: Task | null = $state(null);

  // Update time every minute
  onMount(() => {
    const timer = setInterval(() => {
      currentTime = new Date();
    }, 60000);

    return () => clearInterval(timer);
  });

  // Load tasks when user is authenticated
  $effect(() => {
    if (!isLoading && authStore.isAuthenticated) {
      taskStore.fetchTasks();
      taskStore.fetchStats();
    }
  });

  // Watch theme changes
  $effect(() => {
    currentTheme = themeStore.currentTheme;
  });

  // Update task store when search/filter changes
  $effect(() => {
    taskStore.setSearchQuery(searchQuery);
    taskStore.setActiveFilter(activeFilter as 'all' | 'pending' | 'in-progress' | 'completed' | 'overdue');
  });

  // Check if user is authenticated
  $effect(() => {
    if (!isLoading && !authStore.isAuthenticated) {
      goto('/login');
    }
  });

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: 'home', href: '/dashboard' },
    { id: 'manage-task', label: 'Manage Task', icon: 'document-text', href: '/dashboard/manage-task' },
    { id: 'create-task', label: 'Create Task', icon: 'plus-circle', href: '/dashboard/create-task' },
    { id: 'settings', label: 'Settings', icon: 'cog', href: '/dashboard/settings' }
  ];

  const filterTabs = [
    { id: 'all', label: 'All', count: taskStore.stats.total },
    { id: 'pending', label: 'Pending', count: taskStore.stats.pending },
    { id: 'in-progress', label: 'In Progress', count: taskStore.stats['in-progress'] },
    { id: 'completed', label: 'Completed', count: taskStore.stats.completed }
  ];

  function getIcon(iconName: string, size: string = 'w-5 h-5') {
    const icons: Record<string, string> = {
      'document-text': `<svg class="${size}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>`,
      'search': `<svg class="${size}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>`,
      'download': `<svg class="${size}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>`,
      'refresh': `<svg class="${size}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>`
    };
    return icons[iconName] || '';
  }

  async function downloadReport() {
    try {
      // Create CSV content
      const csvContent = generateCSVReport();
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tasks-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download report:', error);
    }
  }

  function generateCSVReport() {
    const headers = ['Title', 'Description', 'Status', 'Priority', 'Due Date', 'Created Date', 'Progress'];
    const rows = taskStore.tasks.map(task => [
      `"${task.title.replace(/"/g, '""')}"`,
      `"${task.description.replace(/"/g, '""')}"`,
      task.status,
      task.priority,
      new Date(task.dueDate).toLocaleDateString(),
      new Date(task.createdAt).toLocaleDateString(),
      task.checklist.length > 0 
        ? `${task.checklist.filter(item => item.completed).length}/${task.checklist.length}`
        : '0/0'
    ]);
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  function handleFilterChange(filterId: string) {
    activeFilter = filterId;
  }

  // Reactive getters
  let tasksByStatus = $derived(taskStore.tasksByStatus);
  let stats = $derived(taskStore.stats);
  let taskLoading = $derived(taskStore.isLoading);
  let taskError = $derived(taskStore.error);

  // Helper functions
  function getFilterCount(filter: string) {
    switch (filter) {
      case 'all': return stats.total;
      case 'pending': return stats.pending;
      case 'in-progress': return stats['in-progress'];
      case 'completed': return stats.completed;
      case 'overdue': return stats.overdue;
      default: return 0;
    }
  }

  async function handleTaskDrop(event: CustomEvent) {
    const { taskId, newStatus } = event.detail;
    try {
      await taskStore.updateTaskStatus(taskId, newStatus);
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  }

  function handleTaskClick(event: CustomEvent) {
    const task = event.detail.task;
    selectedTask = task;
    isModalOpen = true;
  }

  function handleAddTask(event: CustomEvent) {
    const status = event.detail.status;
    goto(`/dashboard/create-task?status=${status}`);
  }

  function handleTaskUpdated() {
    // Refresh task data
    taskStore.fetchTasks();
    taskStore.fetchStats();
  }

  function handleTaskDeleted() {
    // Refresh task data
    taskStore.fetchTasks();
    taskStore.fetchStats();
  }

  function closeModal() {
    isModalOpen = false;
    selectedTask = null;
  }
</script>

<svelte:head>
  <title>Manage Tasks - tickr.web</title>
  <meta name="theme-color" content={currentTheme === 'dark' ? '#212121' : '#FFFFFF'} />
</svelte:head>

{#if isLoading}
  <div class="min-h-screen auth-bg flex items-center justify-center">
    <div class="glass-morphism rounded-2xl p-8">
      <div class="flex items-center space-x-3">
        <svg class="animate-spin h-8 w-8 text-electric" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-primary text-lg">Loading...</span>
      </div>
    </div>
  </div>
{:else}
  <div class="min-h-screen auth-bg liquid-glass-container">
    <!-- Floating orbs for ambiance -->
    <div class="floating-orb w-40 h-40 top-10 right-20"></div>
    <div class="floating-orb w-32 h-32 bottom-20 left-10"></div>
    <div class="floating-orb w-28 h-28 top-1/2 right-1/3"></div>

    <!-- Sidebar Component -->
    <Sidebar activeSection="manage-task" {navigationItems} />

    <!-- Main content area -->
    <div class="ml-64">
      <!-- Floating Navbar Component -->
      <FloatingNavbar activeSection="manage-task" {navigationItems} {currentTime} pageTitle="Manage Tasks" />

      <!-- Main content -->
      <main class="pt-32 p-6">
        <!-- Page Header -->
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-3xl font-bold text-primary mb-2">My Tasks</h1>
            <p class="text-muted">Organize and track your tasks with drag & drop</p>
          </div>
          
          <!-- Download Report Button -->
          <button 
            class="btn-secondary flex items-center gap-2"
            onclick={downloadReport}
          >
            {@html getIcon('download', 'w-4 h-4')}
            Download Report
          </button>
        </div>

        <!-- Filter Tabs -->
        <div class="glass-morphism rounded-xl p-6 mb-6">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <!-- Filter Tabs -->
            <div class="flex flex-wrap gap-2">
              {#each [
                { id: 'all', label: 'All', count: getFilterCount('all') },
                { id: 'pending', label: 'Pending', count: getFilterCount('pending') },
                { id: 'in-progress', label: 'In Progress', count: getFilterCount('in-progress') },
                { id: 'completed', label: 'Completed', count: getFilterCount('completed') },
                { id: 'overdue', label: 'Overdue', count: getFilterCount('overdue') }
              ] as filter}
                <button 
                  class="px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2
                         {activeFilter === filter.id 
                           ? 'bg-electric text-charcoal' 
                           : 'text-muted hover:text-primary hover:bg-primary/10'}"
                  onclick={() => activeFilter = filter.id}
                >
                  {filter.label}
                  <span class="bg-primary/20 text-xs px-2 py-1 rounded-full">
                    {filter.count}
                  </span>
                </button>
              {/each}
            </div>

            <!-- Search Input -->
            <div class="relative">
              <div class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted">
                {@html getIcon('search', 'w-4 h-4')}
              </div>
              <input 
                type="text"
                placeholder="Search tasks..."
                class="pl-10 pr-4 py-2 bg-secondary border border-primary/20 rounded-lg
                       text-primary placeholder-muted focus:outline-none focus:border-electric
                       focus:ring-2 focus:ring-electric/20 transition-all duration-200"
                bind:value={searchQuery}
              />
            </div>
          </div>
        </div>

        <!-- Task Error Display -->
        {#if taskError}
          <div class="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p class="font-medium">Error loading tasks:</p>
            <p class="text-sm">{taskError}</p>
            <button 
              class="mt-2 text-sm underline" 
              onclick={() => taskStore.clearError()}
            >
              Dismiss
            </button>
          </div>
        {/if}

        <!-- Task Loading State -->
        {#if taskLoading}
          <div class="flex items-center justify-center py-12">
            <div class="glass-morphism rounded-xl p-8">
              <div class="flex items-center space-x-3">
                <svg class="animate-spin h-6 w-6 text-electric" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="text-primary">Loading tasks...</span>
              </div>
            </div>
          </div>
        {:else}
          <!-- Task Drag & Drop Container -->
          <DragDropContainer on:taskClick={handleTaskClick} />
        {/if}

        <!-- Task Statistics -->
          <div class="glass-morphism rounded-xl p-6">
            <h3 class="text-lg font-semibold text-primary mb-4">Task Statistics</h3>
            <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-primary">{stats.total}</div>
                <div class="text-sm text-muted">Total Tasks</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-coral">{stats.pending}</div>
                <div class="text-sm text-muted">Pending</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-electric">{stats['in-progress']}</div>
                <div class="text-sm text-muted">In Progress</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-neon">{stats.completed}</div>
                <div class="text-sm text-muted">Completed</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-red-500">{stats.overdue}</div>
                <div class="text-sm text-muted">Overdue</div>
              </div>
            </div>
          </div>
      </main>
    </div>
  </div>
{/if}

<!-- Task Modal -->
<TaskEditModal 
  bind:isOpen={isModalOpen}
  task={selectedTask}
  on:close={closeModal}
  on:taskUpdated={handleTaskUpdated}
  on:taskDeleted={handleTaskDeleted}
/>

<style>
  /* Manage tasks page specific styles */
</style>
