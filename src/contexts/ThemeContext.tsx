import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { loadThemePreference, saveThemePreference } from '@/lib/preferences';
import type { ThemeMode } from '@/types/preferences';

export interface ThemeContextValue {
  theme: ThemeMode;
  error: string | null;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

const CACHE_KEY = 'luminotes-theme';

function readCachedTheme(): ThemeMode {
  return localStorage.getItem(CACHE_KEY) === 'dark' ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [theme, setTheme] = useState<ThemeMode>(readCachedTheme);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(CACHE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    loadThemePreference()
      .then((saved) => {
        if (!active || !saved) return;
        setTheme(saved);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Your theme could not be loaded.');
      });
    return () => {
      active = false;
    };
  }, [userId]);

  const toggleTheme = useCallback(() => {
    const next: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    setError(null);
    if (!userId) return;
    saveThemePreference(next).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : 'Your theme could not be saved.');
    });
  }, [theme, userId]);

  return (
    <ThemeContext.Provider value={{ theme, error, toggleTheme }}>{children}</ThemeContext.Provider>
  );
}
