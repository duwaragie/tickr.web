<script lang="ts">
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth.svelte';
  import { themeStore } from '$lib/stores/theme.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import FloatingNavbar from '$lib/components/FloatingNavbar.svelte';
  import { onMount } from 'svelte';

  let user = $state(authStore.user);
  let isLoading = $state(authStore.isLoading);
  let currentTime = $state(new Date());
  let currentTheme = $state(themeStore.currentTheme);

  // Update time every minute
  onMount(() => {
    const timer = setInterval(() => {
      currentTime = new Date();
    }, 60000);

    return () => clearInterval(timer);
  });

  // Watch theme changes
  $effect(() => {
    currentTheme = themeStore.currentTheme;
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

  // Form state
  let formData = $state({
    title: '',
    description: '',
    priority: 'Medium',
    dueDate: '',
    checklist: ['']
  });

  let isSubmitting = $state(false);
  let submitMessage = $state({ type: '', text: '' });
  let formErrors = $state<Record<string, string>>({});

  // Add checklist item
  function addChecklistItem() {
    formData.checklist = [...formData.checklist, ''];
  }

  // Remove checklist item
  function removeChecklistItem(index: number) {
    if (formData.checklist.length > 1) {
      formData.checklist = formData.checklist.filter((_, i) => i !== index);
    }
  }

  // Form validation
  function validateForm() {
    const errors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Task title is required';
    } else if (formData.title.length > 100) {
      errors.title = 'Task title cannot exceed 100 characters';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Task description is required';
    } else if (formData.description.length > 500) {
      errors.description = 'Task description cannot exceed 500 characters';
    }
    
    if (!formData.dueDate) {
      errors.dueDate = 'Due date is required';
    } else if (new Date(formData.dueDate) <= new Date()) {
      errors.dueDate = 'Due date must be in the future';
    }
    
    // Validate checklist items
    const validChecklistItems = formData.checklist.filter(item => item.trim());
    if (validChecklistItems.length === 0) {
      errors.checklist = 'At least one checklist item is required';
    }
    
    formErrors = errors;
    return Object.keys(errors).length === 0;
  }

  // Submit form
  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    
    if (!validateForm()) {
      submitMessage = { type: 'error', text: 'Please correct the errors above' };
      return;
    }

    isSubmitting = true;
    submitMessage = { type: '', text: '' };

    try {
      // Filter out empty checklist items and format them properly
      const cleanedChecklist = formData.checklist
        .filter(item => item.trim())
        .map(text => ({ text: text.trim(), completed: false }));

      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          priority: formData.priority,
          dueDate: formData.dueDate,
          checklist: cleanedChecklist
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        submitMessage = { type: 'success', text: data.message || 'Task created successfully!' };
        // Reset form
        formData = {
          title: '',
          description: '',
          priority: 'Medium',
          dueDate: '',
          checklist: ['']
        };
        formErrors = {};
        
        // Redirect to manage tasks after a short delay
        setTimeout(() => {
          goto('/dashboard/manage-task');
        }, 2000);
      } else {
        // Handle validation errors from backend
        if (data.details && Array.isArray(data.details)) {
          const backendErrors: Record<string, string> = {};
          data.details.forEach((error: any) => {
            if (error.path) {
              backendErrors[error.path] = error.msg;
            }
          });
          formErrors = { ...formErrors, ...backendErrors };
        }
        submitMessage = { type: 'error', text: data.error || data.message || 'Failed to create task' };
      }
    } catch (error) {
      console.error('Network error:', error);
      submitMessage = { type: 'error', text: 'Network error. Please check your connection and try again.' };
    } finally {
      isSubmitting = false;
    }
  }

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  function getIcon(iconName: string, size: string = 'w-5 h-5') {
    const icons: Record<string, string> = {
      'plus-circle': `<svg class="${size}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>`,
      'plus': `<svg class="${size}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>`,
      'trash': `<svg class="${size}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>`,
      'check': `<svg class="${size}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>`,
      'brain': `<svg class="${size}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>`,
      'document-text': `<svg class="${size}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>`,
      'flag': `<svg class="${size}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 2h6.5a2 2 0 012 2v6a2 2 0 01-2 2H12l-1-2H5a2 2 0 00-2 2z" /></svg>`,
      'calendar': `<svg class="${size}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>`,
      'clipboard-list': `<svg class="${size}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>`
    };
    return icons[iconName] || '';
  }
</script>

<svelte:head>
  <title>Create Task - tickr.web</title>
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
    <Sidebar activeSection="create-task" {navigationItems} />

    <!-- Main content area -->
    <div class="ml-64">
      <!-- Floating Navbar Component -->
      <FloatingNavbar activeSection="create-task" {navigationItems} {currentTime} pageTitle="Create Task" />

      <!-- Main content -->
      <main class="pt-32 p-6">
        <div class="dashboard-card max-w-4xl mx-auto">
          <div class="flex items-center justify-between mb-8">
            <h3 class="text-2xl font-semibold text-primary">Create New Task</h3>
            <div class="text-electric">{@html getIcon('plus-circle', 'w-8 h-8')}</div>
          </div>
          
          <!-- Success/Error Messages -->
          {#if submitMessage.text}
            <div class="mb-6 p-4 rounded-xl glass-morphism border {submitMessage.type === 'success' ? 'border-green-500 text-green-700' : 'border-red-500 text-red-700'}">
              <div class="flex items-center space-x-2">
                <div class="flex-shrink-0">
                  {#if submitMessage.type === 'success'}
                    {@html getIcon('check', 'w-5 h-5')}
                  {:else}
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  {/if}
                </div>
                <p class="font-medium">{submitMessage.text}</p>
              </div>
            </div>
          {/if}

          <form onsubmit={handleSubmit} class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Task Title -->
              <div class="md:col-span-2">
                <label for="title" class="flex items-center space-x-2 text-sm font-medium text-primary mb-2">
                  <span class="text-electric">{@html getIcon('brain', 'w-5 h-5')}</span>
                  <span>Task Title</span>
                </label>
                <input
                  id="title"
                  type="text"
                  bind:value={formData.title}
                  placeholder="Create App UI"
                  class="w-full px-4 py-3 rounded-xl glass-morphism text-primary placeholder-muted focus:border-electric transition-all duration-200"
                  class:border-red-500={formErrors.title}
                  maxlength="100"
                />
                {#if formErrors.title}
                  <p class="mt-1 text-sm text-red-500">{formErrors.title}</p>
                {/if}
                <p class="mt-1 text-xs text-muted">{formData.title.length}/100 characters</p>
              </div>

              <!-- Priority -->
              <div>
                <label for="priority" class="flex items-center space-x-2 text-sm font-medium text-primary mb-2">
                  <span class="text-electric">{@html getIcon('flag', 'w-5 h-5')}</span>
                  <span>Priority</span>
                </label>
                <select
                  id="priority"
                  bind:value={formData.priority}
                  class="w-full px-4 py-3 rounded-xl glass-morphism text-primary focus:border-electric transition-all duration-200"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <!-- Due Date -->
              <div>
                <label for="dueDate" class="flex items-center space-x-2 text-sm font-medium text-primary mb-2">
                  <span class="text-electric">{@html getIcon('calendar', 'w-5 h-5')}</span>
                  <span>Due Date</span>
                </label>
                <input
                  id="dueDate"
                  type="date"
                  bind:value={formData.dueDate}
                  min={today}
                  class="w-full px-4 py-3 rounded-xl glass-morphism text-primary focus:border-electric transition-all duration-200"
                  class:border-red-500={formErrors.dueDate}
                />
                {#if formErrors.dueDate}
                  <p class="mt-1 text-sm text-red-500">{formErrors.dueDate}</p>
                {/if}
              </div>
            </div>

            <!-- Description -->
            <div>
              <label for="description" class="flex items-center space-x-2 text-sm font-medium text-primary mb-2">
                <span class="text-electric">{@html getIcon('document-text', 'w-5 h-5')}</span>
                <span>Description</span>
              </label>
              <textarea
                id="description"
                bind:value={formData.description}
                placeholder="Build a dynamic, mobile-responsive product catalog with filtering, sorting, and performance enhancements"
                rows="4"
                class="w-full px-4 py-3 rounded-xl glass-morphism text-primary placeholder-muted focus:border-electric transition-all duration-200 resize-none"
                class:border-red-500={formErrors.description}
                maxlength="500"
              ></textarea>
              {#if formErrors.description}
                <p class="mt-1 text-sm text-red-500">{formErrors.description}</p>
              {/if}
              <p class="mt-1 text-xs text-muted">{formData.description.length}/500 characters</p>
            </div>

            <!-- TODO Checklist -->
            <div>
              <div class="flex items-center space-x-2 text-sm font-medium text-primary mb-2">
                <span class="text-electric">{@html getIcon('clipboard-list', 'w-5 h-5')}</span>
                <span>TODO Checklist</span>
              </div>
              <div class="space-y-3">
                {#each formData.checklist as item, index}
                  <div class="flex items-center space-x-3">
                    <input
                      type="text"
                      bind:value={formData.checklist[index]}
                      placeholder="Enter Task"
                      class="flex-1 px-4 py-3 rounded-xl glass-morphism text-primary placeholder-muted focus:border-electric transition-all duration-200"
                      maxlength="100"
                    />
                    {#if formData.checklist.length > 1}
                      <button
                        type="button"
                        onclick={() => removeChecklistItem(index)}
                        class="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                        aria-label="Remove checklist item"
                      >
                        {@html getIcon('trash', 'w-5 h-5')}
                      </button>
                    {/if}
                  </div>
                {/each}
                
                <!-- Add Checklist Item Button -->
                <button
                  type="button"
                  onclick={addChecklistItem}
                  class="flex items-center space-x-2 px-4 py-2 text-electric hover:text-electric-hover border border-dashed border-electric hover:border-electric-hover rounded-xl transition-all duration-200"
                >
                  {@html getIcon('plus', 'w-4 h-4')}
                  <span class="text-sm font-medium">Add Another Item</span>
                </button>
                
                {#if formErrors.checklist}
                  <p class="text-sm text-red-500">{formErrors.checklist}</p>
                {/if}
              </div>
            </div>

            <!-- Submit Button -->
            <div class="pt-6" style="border-top: 1px solid var(--border-primary);">
              <div class="flex justify-end space-x-4">
                <button
                  type="button"
                  onclick={() => goto('/dashboard')}
                  class="px-6 py-3 text-muted hover:text-primary glass-morphism hover-glass rounded-xl transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  class="px-8 py-3 bg-gradient-to-r from-electric to-neon text-white font-medium rounded-xl hover:from-electric-hover hover:to-neon-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                >
                  {#if isSubmitting}
                    <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating...</span>
                  {:else}
                    {@html getIcon('plus-circle', 'w-4 h-4')}
                    <span>Create Task</span>
                  {/if}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  </div>
{/if}

<style>
  /* Dashboard-specific styles */
  .dashboard-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .dashboard-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
  
  @keyframes shimmer {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }
</style>
