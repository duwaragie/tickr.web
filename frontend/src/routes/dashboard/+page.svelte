<script lang="ts">
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth.svelte';
  import { onMount, tick } from 'svelte';

  let user = $state(authStore.user);
  let isLoading = $state(authStore.isLoading);
  let currentTime = $state(new Date());
  let sidebarOpen = $state(false);
  let activeSection = $state('overview');

  // Update time every minute
  onMount(() => {
    const timer = setInterval(() => {
      currentTime = new Date();
    }, 60000);

    return () => clearInterval(timer);
  });

  // Check if user is authenticated
  $effect(() => {
    if (!isLoading && !authStore.isAuthenticated) {
      goto('/login');
    }
  });

  async function handleSignout() {
    await authStore.signout();
    goto('/login');
  }

  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }

  // Sample dashboard data
  const stats = [
    { 
      title: 'Total Tasks', 
      value: '124', 
      change: '+12%', 
      icon: '📋',
      color: 'electric'
    },
    { 
      title: 'Completed', 
      value: '89', 
      change: '+8%', 
      icon: '✅',
      color: 'neon'
    },
    { 
      title: 'In Progress', 
      value: '23', 
      change: '+5%', 
      icon: '⏳',
      color: 'coral'
    },
    { 
      title: 'Overdue', 
      value: '12', 
      change: '-3%', 
      icon: '⚠️',
      color: 'softYellow'
    }
  ];

  const recentTasks = [
    { id: 1, title: 'Design new landing page', status: 'completed', priority: 'high', dueDate: '2025-07-10' },
    { id: 2, title: 'Review user feedback', status: 'in-progress', priority: 'medium', dueDate: '2025-07-12' },
    { id: 3, title: 'Update API documentation', status: 'pending', priority: 'low', dueDate: '2025-07-15' },
    { id: 4, title: 'Team standup meeting', status: 'completed', priority: 'medium', dueDate: '2025-07-11' },
    { id: 5, title: 'Code review for PR #42', status: 'in-progress', priority: 'high', dueDate: '2025-07-13' }
  ];

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: '🏠' },
    { id: 'tasks', label: 'Tasks', icon: '📝' },
    { id: 'projects', label: 'Projects', icon: '📁' },
    { id: 'calendar', label: 'Calendar', icon: '📅' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  function getGreeting() {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  function formatDate(date: Date) {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'completed': return 'text-neon';
      case 'in-progress': return 'text-electric';
      case 'pending': return 'text-softYellow';
      default: return 'text-light';
    }
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'high': return 'text-coral';
      case 'medium': return 'text-electric';
      case 'low': return 'text-neon';
      default: return 'text-light';
    }
  }
</script>

<svelte:head>
  <title>Dashboard - tick.web</title>
</svelte:head>

{#if isLoading}
  <div class="min-h-screen auth-bg flex items-center justify-center">
    <div class="glass-morphism rounded-2xl p-8">
      <div class="flex items-center space-x-3">
        <svg class="animate-spin h-8 w-8 text-electric" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-light text-lg">Loading dashboard...</span>
      </div>
    </div>
  </div>
{:else}
  <div class="min-h-screen auth-bg liquid-glass-container">
    <!-- Floating orbs for ambiance -->
    <div class="floating-orb w-40 h-40 top-10 right-20"></div>
    <div class="floating-orb w-32 h-32 bottom-20 left-10"></div>
    <div class="floating-orb w-28 h-28 top-1/2 right-1/3"></div>

    <div class="flex">
      <!-- Sidebar -->
      <div class={`fixed inset-y-0 left-0 z-50 w-64 sidebar-glass transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}>
        <div class="flex flex-col h-full p-6">
          <!-- Logo -->
          <div class="flex items-center mb-8">
            <h1 class="text-2xl font-bold text-electric">tickr.web</h1>
          </div>

          <!-- Navigation -->
          <nav class="flex-1 space-y-2">
            {#each navigationItems as item}
              <button
                onclick={() => activeSection = item.id}
                class={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                  activeSection === item.id 
                    ? 'glass-electric text-charcoal font-semibold' 
                    : 'text-light hover:bg-white hover:bg-opacity-10'
                }`}
              >
                <span class="text-xl mr-3">{item.icon}</span>
                {item.label}
              </button>
            {/each}
          </nav>

          <!-- User section -->
          <div class="border-t border-white border-opacity-20 pt-6">
            <div class="flex items-center mb-4">
              <div class="w-10 h-10 rounded-full bg-electric bg-opacity-20 flex items-center justify-center mr-3">
                <span class="text-electric font-semibold">{user?.name?.charAt(0)}</span>
              </div>
              <div>
                <p class="text-light font-medium">{user?.name}</p>
                <p class="text-light text-sm opacity-70">{user?.email}</p>
              </div>
            </div>
            <button
              onclick={handleSignout}
              class="w-full px-4 py-2 text-left text-coral hover:bg-coral hover:bg-opacity-10 rounded-lg transition-all duration-200"
            >
              🚪 Sign out
            </button>
          </div>
        </div>
      </div>

      <!-- Main content -->
      <div class="flex-1 lg:ml-0">
        <!-- Header -->
        <header class="glass-morphism border-b border-white border-opacity-10 p-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <button
                onclick={toggleSidebar}
                aria-label="Toggle sidebar menu"
                class="lg:hidden mr-4 p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
              >
                <svg class="w-6 h-6 text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h2 class="text-2xl font-bold text-light capitalize">{activeSection}</h2>
                <p class="text-light opacity-70">{getGreeting()}, {user?.name}!</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-light text-sm opacity-70">{formatDate(currentTime)}</p>
              <p class="text-electric font-semibold">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        </header>

        <!-- Dashboard content -->
        <main class="p-6">
          {#if activeSection === 'overview'}
            <!-- Stats grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {#each stats as stat}
                <div class="dashboard-card group">
                  <div class="flex items-center justify-between mb-4">
                    <div class="text-3xl">{stat.icon}</div>
                    <div class={`text-2xl font-bold text-${stat.color}`}>{stat.value}</div>
                  </div>
                  <h3 class="text-light font-medium mb-2">{stat.title}</h3>
                  <div class="flex items-center">
                    <span class={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-neon' : 'text-coral'}`}>
                      {stat.change}
                    </span>
                    <span class="text-light text-sm opacity-70 ml-2">vs last month</span>
                  </div>
                </div>
              {/each}
            </div>

            <!-- Recent tasks -->
            <div class="dashboard-card">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-semibold text-light">Recent Tasks</h3>
                <button class="btn-primary text-sm">View All</button>
              </div>
              
              <div class="space-y-4">
                {#each recentTasks as task}
                  <div class="flex items-center justify-between p-4 rounded-xl glass-morphism hover:bg-white hover:bg-opacity-5 transition-all">
                    <div class="flex items-center flex-1">
                      <div class={`w-3 h-3 rounded-full mr-4 ${getStatusColor(task.status)}`}></div>
                      <div class="flex-1">
                        <p class="text-light font-medium">{task.title}</p>
                        <div class="flex items-center space-x-4 mt-1">
                          <span class={`text-sm capitalize ${getStatusColor(task.status)}`}>{task.status.replace('-', ' ')}</span>
                          <span class={`text-sm capitalize ${getPriorityColor(task.priority)}`}>{task.priority} priority</span>
                          <span class="text-light text-sm opacity-70">Due: {task.dueDate}</span>
                        </div>
                      </div>
                    </div>
                    <button aria-label="Task options" class="text-light opacity-50 hover:opacity-100 transition-opacity">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                {/each}
              </div>
            </div>

          {:else if activeSection === 'tasks'}
            <!-- Tasks section -->
            <div class="dashboard-card">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-semibold text-light">All Tasks</h3>
                <button class="btn-secondary">+ New Task</button>
              </div>
              
              <div class="text-center py-12">
                <div class="text-6xl mb-4">📝</div>
                <p class="text-light opacity-70">Task management features coming soon...</p>
              </div>
            </div>

          {:else if activeSection === 'projects'}
            <!-- Projects section -->
            <div class="dashboard-card">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-semibold text-light">Projects</h3>
                <button class="btn-secondary">+ New Project</button>
              </div>
              
              <div class="text-center py-12">
                <div class="text-6xl mb-4">📁</div>
                <p class="text-light opacity-70">Project management features coming soon...</p>
              </div>
            </div>

          {:else if activeSection === 'calendar'}
            <!-- Calendar section -->
            <div class="dashboard-card">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-semibold text-light">Calendar</h3>
                <button class="btn-secondary">+ New Event</button>
              </div>
              
              <div class="text-center py-12">
                <div class="text-6xl mb-4">📅</div>
                <p class="text-light opacity-70">Calendar features coming soon...</p>
              </div>
            </div>

          {:else if activeSection === 'analytics'}
            <!-- Analytics section -->
            <div class="dashboard-card">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-semibold text-light">Analytics</h3>
                <select class="glass-morphism rounded-lg px-3 py-2 text-light bg-transparent border border-white border-opacity-20">
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>
              
              <div class="text-center py-12">
                <div class="text-6xl mb-4">📊</div>
                <p class="text-light opacity-70">Analytics and reporting features coming soon...</p>
              </div>
            </div>

          {:else if activeSection === 'settings'}
            <!-- Settings section -->
            <div class="dashboard-card">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-semibold text-light">Settings</h3>
              </div>
              
              <div class="space-y-6">
                <div>
                  <h4 class="text-light font-medium mb-3">Profile</h4>
                  <div class="space-y-3">
                    <div>
                      <label for="profile-name" class="block text-sm text-light opacity-70 mb-1">Name</label>
                      <input id="profile-name" type="text" value={user?.name} class="input-glass" readonly />
                    </div>
                    <div>
                      <label for="profile-email" class="block text-sm text-light opacity-70 mb-1">Email</label>
                      <input id="profile-email" type="email" value={user?.email} class="input-glass" readonly />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 class="text-light font-medium mb-3">Preferences</h4>
                  <div class="space-y-3">
                    <label class="flex items-center">
                      <input type="checkbox" class="rounded border-gray-300 text-electric focus:ring-electric focus:ring-offset-0" />
                      <span class="ml-2 text-light">Email notifications</span>
                    </label>
                    <label class="flex items-center">
                      <input type="checkbox" class="rounded border-gray-300 text-electric focus:ring-electric focus:ring-offset-0" checked />
                      <span class="ml-2 text-light">Dark mode</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          {/if}
        </main>
      </div>
    </div>

    <!-- Mobile sidebar overlay -->
    {#if sidebarOpen}
      <button 
        onclick={toggleSidebar}
        onkeydown={(e) => e.key === 'Escape' && toggleSidebar()}
        aria-label="Close sidebar"
        class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden cursor-pointer"
      ></button>
    {/if}
  </div>
{/if}

<style>
  /* Additional dashboard-specific styles */
  .dashboard-card:hover {
    transform: translateY(-2px);
  }
  
  /* Smooth transitions for sidebar */
  .sidebar-glass {
    transition: transform 0.3s ease-in-out;
  }
</style>