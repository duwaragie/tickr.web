<script lang="ts">
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth.svelte';
  import { themeStore } from '$lib/stores/theme.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import FloatingNavbar from '$lib/components/FloatingNavbar.svelte';
  import ThemeToggle from '$lib/components/ThemeToggle.svelte';
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
</script>

<svelte:head>
  <title>Settings - tickr.web</title>
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
    <Sidebar activeSection="settings" {navigationItems} />

    <!-- Main content area -->
    <div class="ml-64">
      <!-- Floating Navbar Component -->
      <FloatingNavbar activeSection="settings" {navigationItems} {currentTime} pageTitle="Settings" />

      <!-- Main content -->
      <main class="pt-32 p-6">
        <div class="dashboard-card">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-primary">Settings</h3>
          </div>
          
          <div class="space-y-6">
            <div>
              <h4 class="text-primary font-medium mb-3">Profile</h4>
              <div class="space-y-3">
                <div>
                  <label for="profile-name" class="block text-sm text-muted mb-1">Name</label>
                  <input id="profile-name" type="text" value={user?.name} class="input-glass" readonly />
                </div>
                <div>
                  <label for="profile-email" class="block text-sm text-muted mb-1">Email</label>
                  <input id="profile-email" type="email" value={user?.email} class="input-glass" readonly />
                </div>
              </div>
            </div>
            
            <div>
              <h4 class="text-primary font-medium mb-3">Preferences</h4>
              <div class="space-y-3">
                <label class="flex items-center">
                  <input type="checkbox" class="rounded border-gray-300 text-electric focus:ring-electric focus:ring-offset-0" />
                  <span class="ml-2 text-primary">Email notifications</span>
                </label>
                <label class="flex items-center">
                  <input type="checkbox" class="rounded border-gray-300 text-electric focus:ring-electric focus:ring-offset-0" checked={currentTheme === 'dark'} />
                  <span class="ml-2 text-primary">Dark mode</span>
                </label>
              </div>
            </div>

            <div>
              <h4 class="text-primary font-medium mb-3">Theme</h4>
              <div class="flex items-center justify-between p-4 glass-morphism rounded-xl">
                <div>
                  <p class="text-primary font-medium">Appearance</p>
                  <p class="text-muted text-sm">
                    Current theme: <span class="capitalize">{themeStore.isSystemTheme ? 'System' : currentTheme}</span>
                  </p>
                </div>
                <ThemeToggle />
              </div>
            </div>
          </div>
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
  
  /* Enhanced sidebar styles */
  .sidebar-glass {
    backdrop-filter: blur(20px);
    border-right: 1px solid var(--border-primary);
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
  }
  
  /* Time display animation */
  .time-display {
    background: linear-gradient(45deg, var(--electric), var(--neon));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 3s ease-in-out infinite;
  }
  
  @keyframes shimmer {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }
</style>
