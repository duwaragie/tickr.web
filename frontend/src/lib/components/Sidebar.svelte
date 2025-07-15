<script lang="ts">
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth.svelte';
  import ThemeToggle from './ThemeToggle.svelte';

  interface NavigationItem {
    id: string;
    label: string;
    icon: string;
    href: string;
  }

  interface Props {
    activeSection: string;
    navigationItems: NavigationItem[];
  }

  let { activeSection, navigationItems }: Props = $props();
  let user = $state(authStore.user);

  async function handleSignout() {
    await authStore.signout();
    goto('/login');
  }

  function getIcon(iconName: string, size: string = 'w-5 h-5') {
    const icons: Record<string, string> = {
      'home': `<svg class="${size}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>`,
      'document-text': `<svg class="${size}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>`,
      'plus-circle': `<svg class="${size}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>`,
      'cog': `<svg class="${size}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`,
      'logout': `<svg class="${size}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>`
    };
    return icons[iconName] || '';
  }
</script>

<!-- Fixed Sidebar -->
<div class="fixed inset-y-0 left-0 z-40 w-64 sidebar-glass">
  <div class="flex flex-col h-full p-6">
    <!-- Logo -->
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-bold text-electric">tickr.web</h1>
      <ThemeToggle />
    </div>

    <!-- Navigation -->
    <nav class="flex-1 space-y-3">
      {#each navigationItems as item}
        <a
          href={item.href}
          class={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
            activeSection === item.id 
              ? 'glass-electric text-charcoal font-semibold shadow-lg' 
              : 'text-primary hover:glass-hover'
          }`}
        >
          <span class="mr-3 transition-transform duration-200 group-hover:scale-110">{@html getIcon(item.icon)}</span>
          {item.label}
        </a>
      {/each}
    </nav>

    <!-- User section with logout -->
    <div class="border-t border-primary pt-6 space-y-4" style="border-color: var(--border-primary)">
      <div class="flex items-center">
        <div class="w-10 h-10 rounded-full bg-electric bg-opacity-20 flex items-center justify-center mr-3">
          <span class="text-electric font-semibold">{user?.name?.charAt(0)}</span>
        </div>
        <div>
          <p class="text-primary font-medium">{user?.name}</p>
          <p class="text-secondary text-sm">{user?.email}</p>
        </div>
      </div>
      <button
        onclick={handleSignout}
        class="w-full px-4 py-3 text-left text-coral hover:glass-hover-coral rounded-xl transition-all duration-200 flex items-center group"
      >
        <span class="mr-3 transition-transform duration-200 group-hover:scale-110">{@html getIcon('logout', 'w-4 h-4')}</span>
        Sign out
      </button>
    </div>
  </div>
</div>

<style>
  /* Enhanced sidebar styles */
  .sidebar-glass {
    backdrop-filter: blur(20px);
    border-right: 1px solid var(--border-primary);
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
  }

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
</style>
