<script lang="ts">
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth.svelte';

  interface NavigationItem {
    id: string;
    label: string;
    icon: string;
    href: string;
  }

  interface Props {
    activeSection: string;
    navigationItems: NavigationItem[];
    currentTime: Date;
    pageTitle: string;
  }

  let { activeSection, navigationItems, currentTime, pageTitle }: Props = $props();
  let user = $state(authStore.user);

  async function handleSignout() {
    await authStore.signout();
    goto('/login');
  }

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
</script>

<!-- Floating Navbar -->
<div class="fixed top-6 left-80 right-6 z-30">
  <nav class="glass-morphism rounded-2xl p-4 border border-primary shadow-2xl" style="border-color: var(--border-primary); backdrop-filter: blur(20px);">
    <div class="flex items-center justify-between">
      <!-- Left section - Navigation links -->
      <div class="flex items-center space-x-1">
        {#each navigationItems as item}
          <a
            href={item.href}
            class={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeSection === item.id 
                ? 'bg-electric bg-opacity-20 text-electric border border-electric border-opacity-30' 
                : 'text-primary hover:glass-hover'
            }`}
          >
            {item.label}
          </a>
        {/each}
        <button
          onclick={handleSignout}
          class="px-4 py-2 rounded-lg text-sm font-medium text-coral hover:glass-hover-coral transition-all duration-200"
        >
          Logout
        </button>
      </div>

      <!-- Right section - Title, greeting, and time -->
      <div class="text-right">
        <div class="flex items-center space-x-6">
          <div>
            <h2 class="text-lg font-bold text-primary capitalize">{pageTitle}</h2>
            <p class="text-secondary text-sm">{getGreeting()}, {user?.name}!</p>
          </div>
          <div class="border-l border-primary pl-6" style="border-color: var(--border-primary)">
            <p class="text-muted text-sm">{formatDate(currentTime)}</p>
            <p class="time-display font-bold text-muted text-xl">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
      </div>
    </div>
  </nav>
</div>

<style>
  /* Glass hover effects */
  .hover\:glass-hover:hover {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--electric);
  }

  .hover\:glass-hover-coral:hover {
    background: rgba(255, 102, 102, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 102, 102, 0.2);
  }

  /* Improved time display with better contrast */
  .time-display {
    color: var(--electric);
    text-shadow: 0 0 10px rgba(0, 235, 255, 0.3);
    font-weight: 700;
  }

  /* Responsive adjustments */
  @media (max-width: 1024px) {
    .floating-navbar {
      left: 1rem;
      right: 1rem;
    }
  }
</style>
