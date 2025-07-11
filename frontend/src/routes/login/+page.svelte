<script lang="ts">
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth.svelte';
	import { tick } from 'svelte';

  let email = $state('');
  let password = $state('');
  let isLoading = $state(false);
  let error = $state('');
  let showPassword = $state(false);

  async function handleSignin(event: SubmitEvent) {
    event.preventDefault();
    
    if (!email || !password) {
      error = 'Please fill in all fields';
      return;
    }

    isLoading = true;
    error = '';

    const result = await authStore.signin(email, password);
    
    if (result.success) {
      await goto('/dashboard');
    } else {
      error = result.error || 'Sign in failed';
    }
    
    isLoading = false;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSignin(new Event('submit') as SubmitEvent);
    }
  }
</script>

<svelte:head>
  <title>Sign In - tick.web</title>
</svelte:head>

<div class="min-h-screen auth-bg flex items-center justify-center p-4 liquid-glass-container">
  <!-- Floating orbs for ambiance -->
  <div class="floating-orb w-32 h-32 top-1/4 left-1/4"></div>
  <div class="floating-orb w-24 h-24 top-3/4 right-1/3"></div>
  <div class="floating-orb w-28 h-28 bottom-1/4 left-1/2"></div>

  <!-- Sign in form -->
  <div class="w-full max-w-md">
    <!-- Logo/Brand -->
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-electric mb-2">tickr.web</h1>
      <p class="text-light opacity-80">Welcome back</p>
    </div>

    <!-- Main form container -->
    <div class="glass-electric rounded-2xl p-8 relative z-10">
      <div class="text-center mb-6">
        <h2 class="text-2xl font-semibold text-light mb-2">Sign In</h2>
        <p class="text-light opacity-70">Enter your credentials to continue</p>
      </div>

      {#if error}
        <div class="glass-coral rounded-lg p-3 mb-4">
          <p class="text-light text-sm font-medium">{error}</p>
        </div>
      {/if}

      <form onsubmit={handleSignin} class="space-y-4">
        <!-- Email field -->
        <div>
          <label for="email" class="block text-sm font-medium text-light mb-2">
            Email Address
          </label>
          <div class="relative">
            <input
              id="email"
              type="email"
              bind:value={email}
              onkeydown={handleKeydown}
              placeholder="Enter your email"
              class="input-glass"
              required
            />
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg class="w-5 h-5 text-electric opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Password field -->
        <div>
          <label for="password" class="block text-sm font-medium text-light mb-2">
            Password
          </label>
          <div class="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              bind:value={password}
              onkeydown={handleKeydown}
              placeholder="Enter your password"
              class="input-glass pr-12"
              required
            />
            <button
              type="button"
              onclick={() => showPassword = !showPassword}
              class="absolute inset-y-0 right-0 flex items-center pr-3 text-electric opacity-60 hover:opacity-100 transition-opacity"
            >
              {#if showPassword}
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              {:else}
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              {/if}
            </button>
          </div>
        </div>

        <!-- Remember me and forgot password -->
        <div class="flex items-center justify-between">
          <label class="flex items-center">
            <input type="checkbox" class="rounded border-gray-300 text-electric focus:ring-electric focus:ring-offset-0" />
            <span class="ml-2 text-sm text-light opacity-80">Remember me</span>
          </label>
          <a href="/forgot-password" class="text-sm text-electric hover:text-neon transition-colors">
            Forgot password?
          </a>
        </div>

        <!-- Sign in button -->
        <button
          type="submit"
          disabled={isLoading}
          class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {#if isLoading}
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-current inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing in...
          {:else}
            Sign In
          {/if}
        </button>
      </form>

<!-- Divider -->
<div class="my-6">
 <div class="flex items-center">
   <div class="flex-1 border-t border-white border-opacity-20"></div>
   <span class="px-4 text-sm text-light opacity-70">Or continue with</span>
   <div class="flex-1 border-t border-white border-opacity-20"></div>
 </div>
</div>

      <!-- Social login buttons -->
      <div class="grid grid-cols-2 gap-3">
        <button aria-label="Sign in with Google" class="glass-morphism rounded-lg px-4 py-3 text-light font-medium hover:bg-white hover:bg-opacity-10 transition-all">
          <svg class="w-5 h-5 mx-auto" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        </button>
        <button aria-label="Sign in with Twitter" class="glass-morphism rounded-lg px-4 py-3 text-light font-medium hover:bg-white hover:bg-opacity-10 transition-all">
          <svg class="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Sign up link -->
    <div class="text-center mt-6">
      <p class="text-light opacity-80">
        Don't have an account? 
        <a href="/signup" class="text-electric hover:text-neon font-medium transition-colors">
          Sign up here
        </a>
      </p>
    </div>
  </div>
</div>