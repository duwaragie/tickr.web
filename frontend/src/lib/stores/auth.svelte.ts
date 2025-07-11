import { browser } from '$app/environment';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

class AuthStore {
  private state = $state<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  constructor() {
    if (browser) {
      // Only check auth if not on login/signup pages
      this.conditionalCheckAuth();
    }
  }

  get user() {
    return this.state.user;
  }

  get isAuthenticated() {
    return this.state.isAuthenticated;
  }

  get isLoading() {
    return this.state.isLoading;
  }

  async signin(email: string, password: string) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Sign in failed');
      }

      const userData = await response.json();
      this.state.user = userData.user;
      this.state.isAuthenticated = true;
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Sign in failed' 
      };
    }
  }

  async signup(name: string, email: string, password: string) {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Sign up failed');
      }

      const userData = await response.json();
      this.state.user = userData.user;
      this.state.isAuthenticated = true;
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Sign up failed' 
      };
    }
  }

  async signout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      this.state.user = null;
      this.state.isAuthenticated = false;
    }
  }

  private conditionalCheckAuth() {
    // Check current path and avoid auth check on login/signup pages
    const currentPath = window.location.pathname;
    const publicPaths = ['/login', '/signup', '/'];
    
    if (publicPaths.includes(currentPath)) {
      // On public pages, just set loading to false without checking auth
      this.state.isLoading = false;
    } else {
      // On protected pages, check auth status
      this.checkAuth();
    }
  }

  // Public method to manually check auth (useful for navigation)
  async forceCheckAuth() {
    this.state.isLoading = true;
    await this.checkAuth();
  }

  private async checkAuth() {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      if (response.ok) {
        const userData = await response.json();
        this.state.user = userData.user;
        this.state.isAuthenticated = true;
      } else if (response.status === 401) {
        // User is not authenticated - this is expected, no need to log as error
        this.state.user = null;
        this.state.isAuthenticated = false;
      } else {
        // Other errors (500, network issues, etc.)
        console.error('Auth check failed with status:', response.status);
      }
    } catch (error) {
      // Only log network errors or other unexpected errors
      console.error('Auth check network error:', error);
    } finally {
      this.state.isLoading = false;
    }
  }
}

export const authStore = new AuthStore();