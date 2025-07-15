<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import TaskCard from './TaskCard.svelte';
  import type { Task } from '$lib/stores/task.svelte';

  export let title: string;
  export let tasks: Task[];
  export let status: 'pending' | 'in-progress' | 'completed';
  export let count: number;

  const dispatch = createEventDispatcher();

  let isDragOver = false;
  let draggedTask: Task | null = null;

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    isDragOver = true;
  }

  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    isDragOver = false;
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    isDragOver = false;
    
    if (draggedTask && draggedTask.status !== status) {
      dispatch('taskDrop', {
        task: draggedTask,
        newStatus: status
      });
    }
    
    draggedTask = null;
  }

  function handleTaskDragStart(event: CustomEvent) {
    draggedTask = event.detail.task;
  }

  function handleTaskDragEnd() {
    draggedTask = null;
  }

  function handleTaskClick(event: CustomEvent) {
    dispatch('taskClick', event.detail);
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'pending': return 'border-coral/30 bg-coral/5';
      case 'in-progress': return 'border-electric/30 bg-electric/5';
      case 'completed': return 'border-neon/30 bg-neon/5';
      default: return 'border-gray-300 bg-gray-50';
    }
  }

  function getHeaderColor(status: string) {
    switch (status) {
      case 'pending': return 'text-coral';
      case 'in-progress': return 'text-electric';
      case 'completed': return 'text-neon';
      default: return 'text-gray-600';
    }
  }
</script>

<div 
  class="drop-zone glass-morphism rounded-xl p-4 min-h-[400px] transition-all duration-300
         {isDragOver ? 'border-2 border-dashed scale-105 ' + getStatusColor(status) : 'border border-primary/20'}"
  on:dragover={handleDragOver}
  on:dragleave={handleDragLeave}
  on:drop={handleDrop}
  role="region"
  aria-label="{title} tasks column"
>
  <!-- Column Header -->
  <div class="flex items-center justify-between mb-4 pb-3 border-b border-primary/10">
    <h3 class="text-lg font-semibold {getHeaderColor(status)}">
      {title}
    </h3>
    <span class="bg-secondary rounded-full px-3 py-1 text-sm font-medium text-muted">
      {count}
    </span>
  </div>

  <!-- Drop Zone Message -->
  {#if isDragOver}
    <div class="absolute inset-4 flex items-center justify-center bg-primary/5 border-2 border-dashed border-primary/30 rounded-lg">
      <div class="text-center">
        <div class="text-2xl mb-2">📋</div>
        <p class="text-primary font-medium">Drop task here</p>
      </div>
    </div>
  {/if}

  <!-- Task Cards -->
  <div class="space-y-3">
    {#each tasks as task (task._id)}
      <TaskCard 
        {task}
        on:dragstart={handleTaskDragStart}
        on:dragend={handleTaskDragEnd}
        on:click={handleTaskClick}
      />
    {/each}
    
    {#if tasks.length === 0 && !isDragOver}
      <div class="text-center py-8 text-muted">
        <div class="text-4xl mb-3 opacity-50">
          {#if status === 'pending'}📝
          {:else if status === 'in-progress'}⚡
          {:else if status === 'completed'}✅
          {/if}
        </div>
        <p class="text-sm">
          {#if status === 'pending'}No pending tasks
          {:else if status === 'in-progress'}No tasks in progress
          {:else if status === 'completed'}No completed tasks
          {/if}
        </p>
      </div>
    {/if}
  </div>

  <!-- Add Task Button for each column -->
  <button 
    class="w-full mt-4 p-3 border-2 border-dashed border-primary/20 rounded-lg
           text-muted hover:border-primary/40 hover:text-primary transition-all duration-200
           hover:bg-primary/5"
    on:click={() => dispatch('addTask', { status })}
  >
    + Add Task
  </button>
</div>

<style>
  .drop-zone {
    position: relative;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .drop-zone:hover {
    transform: translateY(-1px);
  }
</style>
