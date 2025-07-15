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
  let activeSection = $state('overview');
  let currentTheme = $state(themeStore.currentTheme);

  // Dashboard data from backend
  type Stat = {
    icon: string;
    color: string;
    value: number | string;
    title: string;
    change?: string;
  };
  let stats: Stat[] = $state([]);
  type Task = {
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate: string;
    // add other fields as needed
  };
  let recentTasks = $state<Task[]>([]);
  let dashboardLoading = $state(true);
  let dashboardError = $state('');

  // Update time every minute
  onMount(() => {
    const timer = setInterval(() => {
      currentTime = new Date();
    }, 60000);

    // Fetch dashboard data from backend
    fetchDashboardData();

    return () => clearInterval(timer);
  });

  async function fetchDashboardData() {
    dashboardLoading = true;
    dashboardError = '';
    try {
      // Fetch stats
      const statsRes = await fetch('/api/tasks/stats');
      if (!statsRes.ok) throw new Error('Failed to fetch stats');
      const statsData = await statsRes.json();
      console.log('Stats response:', statsData);
      // Map backend stats object to array for UI
      stats = [
        {
          title: 'Total Tasks',
          value: statsData.stats.total,
          change: '',
          icon: 'clipboard',
          color: 'electric'
        },
        {
          title: 'Completed',
          value: statsData.stats.completed,
          change: '',
          icon: 'check-circle',
          color: 'neon'
        },
        {
          title: 'In Progress',
          value: statsData.stats['in-progress'],
          change: '',
          icon: 'clock',
          color: 'coral'
        },
        {
          title: 'Overdue',
          value: statsData.stats.overdue,
          change: '',
          icon: 'exclamation-triangle',
          color: 'softYellow'
        }
      ];

      // Fetch recent tasks
      const tasksRes = await fetch('/api/tasks?limit=5&sort=desc');
      if (!tasksRes.ok) throw new Error('Failed to fetch recent tasks');
      const tasksData = await tasksRes.json();
      console.log('Recent tasks response:', tasksData);
      recentTasks = tasksData.tasks;
    } catch (err) {
      dashboardError = (err instanceof Error ? err.message : 'Failed to load dashboard data.');
    } finally {
      dashboardLoading = false;
    }
  }

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

  function getStatusColor(status: string) {
    switch (status) {
      case 'completed': return currentTheme === 'light' ? 'text-neon-accessible' : 'text-neon';
      case 'in-progress': return currentTheme === 'light' ? 'text-purple-600' : 'text-purple-400';
      case 'pending': return currentTheme === 'light' ? 'text-blue-600' : 'text-blue-400';
      case 'overdue': return currentTheme === 'light' ? 'text-coral-accessible' : 'text-coral';
      default: return 'text-primary';
    }
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'high': return currentTheme === 'light' ? 'text-coral-accessible' : 'text-coral';
      case 'medium': return currentTheme === 'light' ? 'text-amber-500' : 'text-amber-300';
      case 'low': return currentTheme === 'light' ? 'text-neon-accessible' : 'text-neon';
      default: return 'text-primary';
    }
  }

  function getIcon(iconName: string, size: string = 'w-5 h-5') {
    const icons: Record<string, string> = {
      'clipboard': `<svg class="${size}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>`,
      'check-circle': `<svg class="${size}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
      'clock': `<svg class="${size}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
      'exclamation-triangle': `<svg class="${size}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.232 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>`
    };
    return icons[iconName] || '';
  }
</script>

<svelte:head>
  <title>Dashboard - tickr.web</title>
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
        <span class="text-primary text-lg">Loading dashboard...</span>
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
    <Sidebar {activeSection} {navigationItems} />

    <!-- Main content area -->
    <div class="ml-64">
      <!-- Floating Navbar Component -->
      <FloatingNavbar {activeSection} {navigationItems} {currentTime} pageTitle="Overview" />

      <!-- Main content -->
      <main class="pt-32 p-6">
        {#if dashboardLoading}
          <div class="flex items-center justify-center py-12">
            <span class="text-primary text-lg">Loading dashboard data...</span>
          </div>
        {:else if dashboardError}
          <div class="flex items-center justify-center py-12">
            <span class="text-coral text-lg">{dashboardError}</span>
          </div>
        {:else}
          <!-- Stats grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {#each stats as stat}
              <div class="dashboard-card group">
                <div class="flex items-center justify-between mb-4">
                  <div class="text-electric">{@html getIcon(stat.icon, 'w-8 h-8')}</div>
                  <div class={`text-2xl font-bold text-${stat.color}`}>{stat.value}</div>
                </div>
                <h3 class="text-primary font-medium mb-2">{stat.title}</h3>
                <div class="flex items-center">
                  <span class={`text-sm font-medium ${stat.change && stat.change.startsWith('+') ? (currentTheme === 'light' ? 'text-neon-accessible' : 'text-neon') : (currentTheme === 'light' ? 'text-coral-accessible' : 'text-coral')}`}>
                    {stat.change}
                  </span>
                  <span class="text-muted text-sm ml-2">vs last month</span>
                </div>
              </div>
            {/each}
          </div>

          <!-- Recent tasks -->
          <div class="dashboard-card">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-xl font-semibold text-primary">Recent Tasks</h3>
              <button class="btn-primary text-sm">View All</button>
            </div>
            <div class="space-y-4">
              {#each recentTasks as task}
                <div class="flex items-center justify-between p-4 rounded-xl glass-morphism hover:bg-white hover:bg-opacity-5 transition-all">
                  <div class="flex items-center flex-1">
                    <div class={`w-3 h-3 rounded-full mr-4 ${getStatusColor(task.status)}`}></div>
                    <div class="flex-1">
                      <p class="text-primary font-medium">{task.title}</p>
                      <div class="flex items-center space-x-4 mt-1">
                        <span class={`text-sm capitalize ${getStatusColor(task.status)}`}>{task.status.replace('-', ' ')}</span>
                        <span class={`text-sm capitalize ${getPriorityColor(task.priority)}`}>{task.priority} priority</span>
                        <span class="text-muted text-sm">Due: {task.dueDate}</span>
                      </div>
                    </div>
                  </div>
                  <button aria-label="Task options" class="text-muted hover:text-primary transition-opacity">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              {/each}
            </div>
          </div>
        {/if}
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
</style>