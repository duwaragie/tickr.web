<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { taskStore, type Task } from '$lib/stores/task.svelte';

  export let isOpen: boolean;
  export let task: Task | null;

  const dispatch = createEventDispatcher();

  let form: {
    title: string;
    description: string;
    status: Task['status'];
    priority: 'High' | 'Medium' | 'Low' | undefined;
    dueDate: string;
    checklist: { text: string; completed: boolean }[];
  } = {
    title: '',
    description: '',
    status: 'pending',
    priority: 'Medium',
    dueDate: '',
    checklist: []
  };

  $: if (task) {
    form = {
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate.slice(0, 10),
      checklist: task.checklist.map(item => ({ ...item }))
    };
  }

  function close() {
    dispatch('close');
  }

  async function save() {
    if (!task) return;
    await taskStore.updateTask(task._id, {
      title: form.title,
      description: form.description,
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate,
      checklist: form.checklist
    });
    dispatch('taskUpdated');
    close();
  }

  async function remove() {
    if (!task) return;
    await taskStore.deleteTask(task._id);
    dispatch('taskDeleted');
    close();
  }

  function addChecklistItem() {
    form.checklist.push({ text: '', completed: false });
  }

  function removeChecklistItem(idx: number) {
    form.checklist.splice(idx, 1);
  }

  let showDeleteConfirm = false;
</script>

{#if isOpen && task}
  <button
    type="button"
    class="modal-backdrop"
    aria-label="Close modal"
    on:click={close}
    on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') close(); }}
    tabindex="0"
  ></button>
  <div class="modal landscape-modal glass-morphism bg-primary text-primary">
    <h2 class="text-2xl font-bold mb-6 text-primary">Edit Task</h2>
    <form on:submit|preventDefault={save} class="grid grid-cols-1 md:grid-cols-2 gap-8">
  <!-- Left Column -->
  <div class="space-y-6">
    <!-- Task Title -->
    <div>
      <label class="block text-sm font-medium text-primary mb-2" for="edit-task-title">
        Task Title
      </label>
      <input id="edit-task-title" class="w-full px-4 py-3 rounded-xl glass-morphism bg-secondary text-primary placeholder-muted focus:border-electric transition-all duration-200" bind:value={form.title} maxlength="100" required />
    </div>

    <!-- Description -->
    <div>
      <label class="block text-sm font-medium text-primary mb-2">
        Description
      </label>
      <textarea class="w-full min-h-[120px] px-4 py-3 rounded-xl glass-morphism bg-secondary text-primary placeholder-muted focus:border-electric transition-all duration-200 resize-none" bind:value={form.description} maxlength="500"></textarea>
    </div>

    <!-- TODO Checklist -->
    <div>
      <label class="block text-sm font-medium text-primary mb-2">
        TODO Checklist
      </label>
      <div class="space-y-3">
        {#each form.checklist as item, idx}
          <div class="flex items-center space-x-3">
            <input
              type="text"
              bind:value={form.checklist[idx].text}
              placeholder="Enter Task"
              class="flex-1 px-4 py-3 rounded-xl glass-morphism bg-secondary text-primary placeholder-muted focus:border-electric transition-all duration-200"
              maxlength="100"
            />
            <input type="checkbox" bind:checked={form.checklist[idx].completed} />
            {#if form.checklist.length > 1}
              <button
                type="button"
                on:click={() => removeChecklistItem(idx)}
                class="p-2 text-coral hover:text-coral hover:bg-coral/10 rounded-lg transition-all duration-200"
                aria-label="Remove checklist item"
              >
                &times;
              </button>
            {/if}
          </div>
        {/each}
        <button
          type="button"
          on:click={addChecklistItem}
          class="mt-2 flex items-center space-x-2 px-4 py-2 text-electric hover:text-electric-accessible border border-dashed border-electric hover:border-electric-accessible rounded-xl transition-all duration-200 w-full justify-center"
        >
          <span class="text-sm font-medium">Add Another Item</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Right Column -->
  <div class="space-y-6">
    <!-- Status -->
    <div>
      <label class="block text-sm font-medium text-primary mb-2">
        Status
      </label>
      <select class="w-full px-4 py-3 rounded-xl glass-morphism bg-secondary text-primary focus:border-electric transition-all duration-200" bind:value={form.status}>
        <option value="pending">Pending</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="overdue">Overdue</option>
      </select>
    </div>

    <!-- Priority -->
    <div>
      <label class="block text-sm font-medium text-primary mb-2">
        Priority
      </label>
      <select class="w-full px-4 py-3 rounded-xl glass-morphism bg-secondary text-primary focus:border-electric transition-all duration-200" bind:value={form.priority}>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>
    </div>

    <!-- Due Date -->
    <div>
      <label class="block text-sm font-medium text-primary mb-2">
        Due Date
      </label>
      <input class="w-full px-4 py-3 rounded-xl glass-morphism bg-secondary text-primary focus:border-electric transition-all duration-200" type="date" bind:value={form.dueDate} />
    </div>
  </div>

  <!-- Action Buttons (Full Width Under Both Columns) -->
  <div class="md:col-span-2 flex justify-end gap-4 pt-6">
    <button type="button" class="px-6 py-3 text-muted hover:text-primary glass-morphism hover-glass rounded-xl transition-all duration-200" on:click={close}>Cancel</button>
    <button type="button" class="px-6 py-3 bg-coral text-white font-medium rounded-xl hover:bg-coral transition-all duration-200" on:click={() => showDeleteConfirm = true}>Delete</button>
    <button type="submit" class="px-8 py-3 bg-gradient-to-r from-electric to-neon text-white font-medium rounded-xl hover:from-electric-accessible hover:to-neon-accessible transition-all duration-200">Save</button>
  </div>
</form>
    
    {#if showDeleteConfirm}
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div class="glass-morphism bg-primary p-8 rounded-2xl max-w-sm w-full border border-coral shadow-xl flex flex-col items-center">
          <h3 class="text-lg font-bold text-coral mb-2">Delete Task?</h3>
          <p class="text-muted mb-6 text-center">Are you sure you want to delete this task? This action cannot be undone.</p>
          <div class="flex gap-4 w-full justify-center">
            <button class="px-5 py-2 rounded-lg bg-secondary text-primary hover:bg-tertiary transition-all" on:click={() => showDeleteConfirm = false}>Cancel</button>
            <button class="px-5 py-2 rounded-lg bg-coral text-white font-semibold hover:bg-red-600 transition-all" on:click={remove}>Delete</button>
          </div>
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.3);
    z-index: 40;
    border: none;
    padding: 0;
    margin: 0;
    width: 100vw;
    height: 100vh;
    cursor: pointer;
  }
  .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border-radius: 1.5rem;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    padding: 2rem;
    max-width: 800px;
    width: 90vw;
    z-index: 50;
    /* glass-morphism */
    backdrop-filter: blur(16px) saturate(180%);
    background: rgba(255,255,255,0.85);
    border: 1px solid rgba(200,200,200,0.2);
  }
  .landscape-modal {
    max-width: 1000px;
    width: 90vw;
    min-height: auto;
    max-height: 90vh;
    overflow-y: auto;
  }
  @media (min-width: 1024px) {
    .landscape-modal {
      width: 80vw;
      max-width: 1200px;
    }
  }
  .glass-morphism {
    backdrop-filter: blur(16px) saturate(180%);
    background: rgba(255,255,255,0.85);
    border: 1px solid rgba(200,200,200,0.2);
  }
  .hover-glass:hover {
    background: rgba(255,255,255,0.95);
    box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  }
</style>