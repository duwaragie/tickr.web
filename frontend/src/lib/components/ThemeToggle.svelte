<script lang="ts">
  import { themeStore } from '$lib/stores/theme.svelte';
  
  let currentTheme = $state(themeStore.currentTheme);
  let isSystemTheme = $state(themeStore.isSystemTheme);
  
  $effect(() => {
    currentTheme = themeStore.currentTheme;
    isSystemTheme = themeStore.isSystemTheme;
  });
  
  function toggleTheme() {
    themeStore.toggleTheme();
  }
  
  function useSystemTheme() {
    themeStore.useSystemTheme();
  }

  function getThemeIcon() {
    if (currentTheme === 'dark') {
      return `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>`;
    } else {
      return `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>`;
    }
  }

  function getSystemIcon() {
    return `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>`;
  }
</script>

<div class="theme-controls">
  <button 
    onclick={toggleTheme}
    class="theme-toggle"
    aria-label={`Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} mode`}
    title={`Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} mode`}
  >
    {@html getThemeIcon()}
  </button>
  
  {#if !isSystemTheme}
    <button 
      onclick={useSystemTheme}
      class="system-theme-btn"
      aria-label="Use system theme"
      title="Use system theme preference"
    >
      {@html getSystemIcon()}
    </button>
  {/if}
</div>

<style>
  .theme-controls {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
  
  .theme-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.25rem;
    border: none;
    background: var(--glass-bg);
    backdrop-filter: blur(10px);
    border: 1px solid var(--glass-border);
    border-radius: 0.75rem;
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .theme-toggle:hover {
    background: var(--glass-hover);
    border-color: var(--border-secondary);
    transform: scale(1.05);
    box-shadow: 0 4px 12px var(--shadow-secondary);
  }
  
  .system-theme-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    font-size: 1rem;
    border: none;
    background: var(--glass-bg);
    backdrop-filter: blur(10px);
    border: 1px solid var(--glass-border);
    border-radius: 0.5rem;
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.3s ease;
    opacity: 0.7;
  }
  
  .system-theme-btn:hover {
    background: var(--glass-hover);
    border-color: var(--border-secondary);
    opacity: 1;
    transform: scale(1.05);
  }
</style>
