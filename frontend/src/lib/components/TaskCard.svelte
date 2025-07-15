<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { draggable } from '@neodrag/svelte';
  import type { Task } from '$lib/stores/task.svelte';

  export let task: Task;
  export let isDragging = false;
  export let compact = false;

  const dispatch = createEventDispatcher();

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'pending': return 'bg-coral/10 text-coral border-coral/20';
      case 'in-progress': return 'bg-electric/10 text-electric border-electric/20';
      case 'completed': return 'bg-neon/10 text-neon border-neon/20';
      case 'overdue': return 'bg-red-100 text-red-600 border-red-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'High': return 'bg-coral text-white';
      case 'Medium': return 'bg-orange-400 text-white';
      case 'Low': return 'bg-green-400 text-white';
      default: return 'bg-gray-400 text-white';
    }
  }

  function getCompletedTasks() {
    return task.checklist.filter(item => item.completed).length;
  }

  function getProgressPercentage() {
    if (task.checklist.length === 0) return 0;
    return (getCompletedTasks() / task.checklist.length) * 100;
  }

  function isOverdue() {
    return new Date(task.dueDate) < new Date() && task.status !== 'completed';
  }

  function onDragStart() {
    isDragging = true;
    dispatch('dragstart', { task });
  }

  function onDragEnd() {
    isDragging = false;
    dispatch('dragend', { task });
  }

  function handleClick() {
    dispatch('click', { task });
  }
</script>

<div
  use:draggable={{
    bounds: 'parent',
    handle: '.drag-handle',
    onDragStart,
    onDragEnd
  }}
  class="task-card glass-morphism rounded-xl transition-all duration-300 cursor-pointer
         {compact ? 'p-3' : 'p-4'}
         {isDragging ? 'scale-105 shadow-2xl z-50' : 'hover:transform hover:scale-[1.02]'}
         {isOverdue() ? 'border-red-300' : ''}"
  on:click={handleClick}
  on:keydown={(e) => e.key === 'Enter' && handleClick()}
  role="button"
  tabindex="0"
>
  <!-- Drag Handle -->
  <div class="drag-handle absolute top-2 right-2 p-1 opacity-50 hover:opacity-100 cursor-grab">
    <svg class="{compact ? 'w-3 h-3' : 'w-4 h-4'} text-muted" fill="currentColor" viewBox="0 0 20 20">
      <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
    </svg>
  </div>

  <!-- Status and Priority Badges -->
  <div class="flex items-center justify-between {compact ? 'mb-2' : 'mb-3'}">
    <div class="flex gap-1 flex-wrap">
      <span class="px-2 py-1 rounded-full text-xs font-medium border {getStatusColor(task.status)}">
        {task.status.replace('-', ' ')}
      </span>
      <span class="px-2 py-1 rounded-full text-xs font-medium {getPriorityColor(task.priority)}">
        {task.priority}
      </span>
      {#if isOverdue()}
        <span class="px-2 py-1 rounded-full text-xs font-medium bg-red-500 text-white">
          Overdue
        </span>
      {/if}
    </div>
  </div>

  <!-- Task Title -->
  <h3 class="{compact ? 'text-sm' : 'text-lg'} font-semibold text-primary mb-2 line-clamp-2">
    {task.title}
  </h3>

  <!-- Description Preview -->
  <p class="text-muted text-xs {compact ? 'mb-2' : 'mb-4'} line-clamp-2">
    {task.description}
  </p>

  <!-- Progress Indicator -->
  {#if task.checklist.length > 0}
    <div class="{compact ? 'mb-2' : 'mb-4'}">
      <div class="flex items-center justify-between text-xs mb-1">
        <span class="text-muted">{compact ? '' : 'Task Done: '}{getCompletedTasks()}/{task.checklist.length}</span>
        <span class="text-muted">{Math.round(getProgressPercentage())}%</span>
      </div>
      <div class="w-full bg-tertiary rounded-full {compact ? 'h-1' : 'h-2'}">
        <div 
          class="bg-electric {compact ? 'h-1' : 'h-2'} rounded-full transition-all duration-300"
          style="width: {getProgressPercentage()}%"
        ></div>
      </div>
    </div>
  {/if}

  <!-- Dates -->
  {#if !compact}
    <div class="flex items-center justify-between text-xs text-muted mb-3">
      <div class="flex items-center gap-1">
        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
        </svg>
        <span>Created: {formatDate(task.createdAt)}</span>
      </div>
      <div class="flex items-center gap-1 {isOverdue() ? 'text-red-500' : ''}">
        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
        </svg>
        <span>Due: {formatDate(task.dueDate)}</span>
      </div>
    </div>
  {:else}
    <div class="flex items-center justify-center text-xs text-muted mb-2">
      <div class="flex items-center gap-1 {isOverdue() ? 'text-red-500' : ''}">
        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
        </svg>
        <span>{formatDate(task.dueDate)}</span>
      </div>
    </div>
  {/if}

  <!-- Assigned User Avatar -->
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-2">
      <div class="{compact ? 'w-5 h-5' : 'w-6 h-6'} bg-electric rounded-full flex items-center justify-center text-xs font-medium text-charcoal">
        {task.createdBy.name.charAt(0).toUpperCase()}
      </div>
      {#if !compact}
        <span class="text-xs text-muted">{task.createdBy.name}</span>
      {/if}
    </div>
    
    <!-- Action menu dots -->
    <div class="opacity-50 hover:opacity-100 transition-opacity">
      <svg class="{compact ? 'w-3 h-3' : 'w-4 h-4'} text-muted" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
      </svg>
    </div>
  </div>
</div>

<style>
  .task-card {
    position: relative;
    min-height: 150px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .task-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }

  /* Compact mode adjustments */
  :global(.task-card.compact) {
    min-height: 120px;
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .drag-handle:active {
    cursor: grabbing;
  }
</style>
