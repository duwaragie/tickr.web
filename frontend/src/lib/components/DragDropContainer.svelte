<script lang="ts">
  import { taskStore, type Task } from '$lib/stores/task.svelte';
  import TaskCard from './TaskCard.svelte';
  import { onMount } from 'svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  let draggedTask: Task | null = null;
  let draggedOverColumn: string | null = null;

  const columns = [
    { id: 'pending', title: 'Pending', color: 'border-coral' },
    { id: 'in-progress', title: 'In Progress', color: 'border-electric' },
    { id: 'completed', title: 'Completed', color: 'border-neon' },
    { id: 'overdue', title: 'Overdue', color: 'border-red-500' }
  ];

  function handleDragStart(event: CustomEvent) {
    draggedTask = event.detail.task;
  }

  function handleDragEnd() {
    draggedTask = null;
    draggedOverColumn = null;
  }

  function handleDragOver(event: DragEvent, columnId: string) {
    event.preventDefault();
    draggedOverColumn = columnId;
  }

  function handleDragLeave() {
    draggedOverColumn = null;
  }

  async function handleDrop(event: DragEvent, newStatus: string) {
    event.preventDefault();
    draggedOverColumn = null;

    if (!draggedTask || draggedTask.status === newStatus) {
      return;
    }

    const validStatuses = ['pending', 'in-progress', 'completed', 'overdue'] as const;
    if (!validStatuses.includes(newStatus as any)) {
      return;
    }

    try {
      await taskStore.updateTaskStatus(draggedTask._id, newStatus as 'pending' | 'in-progress' | 'completed' | 'overdue');
    } catch (error) {
      console.error('Failed to update task status:', error);
    }

    draggedTask = null;
  }

  function getColumnTasks(status: string): Task[] {
    return taskStore.tasksByStatus[status as keyof typeof taskStore.tasksByStatus] || [];
  }

  function getColumnCount(status: string): number {
    return getColumnTasks(status).length;
  }
</script>

<div class="grid grid-cols-4 gap-3 h-full">
  {#each columns as column}
    <div 
      class="flex flex-col h-full min-h-[500px]"
      on:dragover={(e) => handleDragOver(e, column.id)}
      on:dragleave={handleDragLeave}
      on:drop={(e) => handleDrop(e, column.id)}
      role="listbox"
      tabindex="0"
      aria-label="{column.title} tasks"
    >
      <!-- Column Header -->
      <div class="glass-morphism rounded-lg p-3 mb-3 border-t-4 {column.color}">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold text-primary">{column.title}</h3>
          <span class="bg-secondary text-muted px-2 py-1 rounded-full text-xs font-medium">
            {getColumnCount(column.id)}
          </span>
        </div>
      </div>

      <!-- Drop Zone -->
      <div 
        class="flex-1 p-2 rounded-xl transition-all duration-200 {
          draggedOverColumn === column.id ? 'bg-electric/10 border-2 border-dashed border-electric' : 'border-2 border-transparent'
        }"
      >
        <!-- Task Cards -->
        <div class="space-y-3">
          {#each getColumnTasks(column.id) as task (task._id)}
            <TaskCard 
              {task}
              compact={true}
              on:dragstart={handleDragStart}
              on:dragend={handleDragEnd}
              on:click={(event) => dispatch('taskClick', event.detail)}
            />
          {:else}
            <div class="text-center py-6">
              <div class="text-muted text-xs">
                {#if column.id === 'pending'}
                  No pending tasks
                {:else if column.id === 'in-progress'}
                  No tasks in progress
                {:else if column.id === 'completed'}
                  No completed tasks
                {:else if column.id === 'overdue'}
                  No overdue tasks
                {/if}
              </div>
              <div class="text-muted text-xs mt-1 opacity-75">
                Drag tasks here
              </div>
            </div>
          {/each}
        </div>

        <!-- Drop indicator when dragging -->
        {#if draggedTask && draggedOverColumn === column.id && draggedTask.status !== column.id}
          <div class="mt-3 p-3 border-2 border-dashed border-electric bg-electric/5 rounded-lg text-center">
            <div class="text-electric text-xs font-medium">
              Drop to move to {column.title}
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/each}
</div>

<!-- Loading state -->
{#if taskStore.isLoading}
  <div class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
    <div class="glass-morphism rounded-2xl p-8">
      <div class="flex items-center space-x-3">
        <svg class="animate-spin h-8 w-8 text-electric" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-primary text-lg">Updating task...</span>
      </div>
    </div>
  </div>
{/if}

<!-- Error notification -->
{#if taskStore.error}
  <div class="fixed top-4 right-4 z-50 max-w-md">
    <div class="glass-morphism border border-coral/20 rounded-xl p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5 text-coral" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
          <span class="text-coral font-medium">Error</span>
        </div>
        <button 
          class="text-muted hover:text-primary"
          on:click={() => taskStore.clearError()}
          aria-label="Close error message"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
      <p class="text-muted text-sm mt-2">{taskStore.error}</p>
    </div>
  </div>
{/if}

<style>
  /* Add custom scrollbar for columns */
  .space-y-3 {
    max-height: calc(100vh - 300px);
    overflow-y: auto;
  }

  .space-y-3::-webkit-scrollbar {
    width: 3px;
  }

  .space-y-3::-webkit-scrollbar-track {
    background: var(--bg-tertiary);
    border-radius: 2px;
  }

  .space-y-3::-webkit-scrollbar-thumb {
    background: var(--border-primary);
    border-radius: 2px;
  }

  .space-y-3::-webkit-scrollbar-thumb:hover {
    background: var(--border-secondary);
  }
</style>
