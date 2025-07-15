<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { fade, scale } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  function localFadeScale(node: Element, { delay = 0, duration = 600, start = 0.7 } = {}) {
    return {
      delay,
      duration,
      css: (t: number) => {
        const eased = cubicOut(t);
        const scaleVal = start + (1 - start) * eased;
        return `
          opacity: ${eased};
          transform: scale(${scaleVal});
        `;
      }
    };
  }
  let show = false;
  onMount(() => {
    show = true;
    setTimeout(() => goto('/signup'), 1800);
  });
</script>

<div class="auth-bg liquid-glass-container flex items-center justify-center min-h-screen p-4">
  <!-- Floating orbs for ambiance -->
  <div class="floating-orb w-32 h-32 top-1/4 right-1/4"></div>
  <div class="floating-orb w-24 h-24 top-3/4 left-1/3"></div>
  <div class="floating-orb w-28 h-28 bottom-1/4 right-1/2"></div>

  {#if show}
    <div class="glass-electric rounded-2xl p-10 max-w-md w-full flex flex-col items-center text-center space-y-8 relative z-10"
      in:localFadeScale={{ duration: 600, start: 0.7 }} out:fade={{ duration: 400 }}>
      <div class="flex flex-col items-center gap-4 animate-pulse">
        <span class="w-20 h-20 rounded-full bg-electric dark:bg-neon flex items-center justify-center text-5xl font-extrabold text-charcoal dark:text-charcoal shadow-lg transition-all duration-700">T</span>
        <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight text-coral dark:text-softYellow animate-fadein">Tickr.web</h1>
      </div>
      <div class="w-24 h-2 rounded-full bg-gradient-to-r from-coral via-electric to-neon animate-gradient"></div>
    </div>
  {/if}
</div>

<style>
  @keyframes fadein {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadein {
    animation: fadein 1s cubic-bezier(.4,0,.2,1) both;
  }
  @keyframes gradient {
    0% { background-position: 0% 50%; }
    100% { background-position: 100% 50%; }
  }
  .animate-gradient {
    background-size: 200% 200%;
    animation: gradient 1.5s linear infinite alternate;
  }
</style>