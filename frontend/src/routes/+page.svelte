<div class="bg-light dark:bg-charcoal text-charcoal dark:text-light min-h-screen p-8">
  <button
    class="px-6 py-3 bg-electric dark:bg-neon text-charcoal dark:text-charcoal font-bold rounded-lg border-2 border-charcoal dark:border-light hover:opacity-80 transition-opacity"
    on:click={() => document.documentElement.classList.toggle('dark')}
  >
    Toggle Theme
  </button>

  <p class="mt-4 text-coral dark:text-softYellow">Welcome to Tickr.web 🚀</p>
  
  <!-- Test elements to check if custom colors are working -->
  <div class="mt-8 space-y-4">
    <h2 class="text-xl font-bold">Custom Color Test:</h2>
    <div class="flex gap-4 flex-wrap">
      <!-- Test standard Tailwind colors first -->
      <div class="w-20 h-20 bg-blue-500 border-2 border-gray-800 rounded flex items-center justify-center text-xs font-bold text-white">blue-500</div>
      <div class="w-20 h-20 bg-red-500 border-2 border-gray-800 rounded flex items-center justify-center text-xs font-bold text-white">red-500</div>
      
      <!-- Test custom colors -->
      <div class="w-20 h-20 bg-electric border-2 border-charcoal rounded flex items-center justify-center text-xs font-bold text-charcoal">electric</div>
      <div class="w-20 h-20 bg-neon border-2 border-charcoal rounded flex items-center justify-center text-xs font-bold text-charcoal">neon</div>
      <div class="w-20 h-20 bg-coral border-2 border-charcoal rounded flex items-center justify-center text-xs font-bold text-white">coral</div>
      <div class="w-20 h-20 bg-softYellow border-2 border-charcoal rounded flex items-center justify-center text-xs font-bold text-charcoal">softYellow</div>
      <div class="w-20 h-20 bg-charcoal border-2 border-light rounded flex items-center justify-center text-xs font-bold text-light">charcoal</div>
      <div class="w-20 h-20 bg-light border-2 border-charcoal rounded flex items-center justify-center text-xs font-bold text-charcoal">light</div>
    </div>

    <div class="bg-[var(--bg-primary)] text-[var(--text-primary)]">Hello</div>
  </div>
</div>