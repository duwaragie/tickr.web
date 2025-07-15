import { browser } from '$app/environment';

export type Theme = 'light' | 'dark';

interface ThemeState {
  currentTheme: Theme;
  systemPreference: Theme;
  isSystemTheme: boolean;
}

class ThemeStore {
  private state = $state<ThemeState>({
    currentTheme: 'dark', // Default to dark
    systemPreference: 'dark',
    isSystemTheme: false
  });

  constructor() {
    if (browser) {
      this.initializeTheme();
      this.watchSystemTheme();
    }
  }

  get currentTheme() {
    return this.state.currentTheme;
  }

  get isSystemTheme() {
    return this.state.isSystemTheme;
  }

  get systemPreference() {
    return this.state.systemPreference;
  }

  private initializeTheme() {
    // Get saved theme preference
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const useSystemTheme = localStorage.getItem('useSystemTheme') === 'true';
    
    // Detect system preference
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    this.state.systemPreference = systemTheme;

    if (useSystemTheme) {
      this.state.isSystemTheme = true;
      this.state.currentTheme = systemTheme;
    } else if (savedTheme) {
      this.state.currentTheme = savedTheme;
    }

    this.applyTheme();
  }

  private watchSystemTheme() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', (e) => {
      this.state.systemPreference = e.matches ? 'dark' : 'light';
      
      if (this.state.isSystemTheme) {
        this.state.currentTheme = this.state.systemPreference;
        this.applyTheme();
      }
    });
  }

  private applyTheme() {
    if (!browser) return;
    
    const html = document.documentElement;
    html.className = this.state.currentTheme;
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', 
        this.state.currentTheme === 'dark' ? '#212121' : '#FFFFFF'
      );
    }
  }

  setTheme(theme: Theme) {
    this.state.currentTheme = theme;
    this.state.isSystemTheme = false;
    
    localStorage.setItem('theme', theme);
    localStorage.setItem('useSystemTheme', 'false');
    
    this.applyTheme();
  }

  useSystemTheme() {
    this.state.isSystemTheme = true;
    this.state.currentTheme = this.state.systemPreference;
    
    localStorage.setItem('useSystemTheme', 'true');
    localStorage.removeItem('theme');
    
    this.applyTheme();
  }

  toggleTheme() {
    const newTheme = this.state.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }
}

export const themeStore = new ThemeStore();
