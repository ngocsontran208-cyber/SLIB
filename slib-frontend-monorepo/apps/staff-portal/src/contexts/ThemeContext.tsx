import React, { createContext, useContext, useEffect, useState } from 'react';

type ColorTheme = 'blue' | 'emerald' | 'purple' | 'orange' | 'rose';
type ColorMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ColorMode;
  theme: ColorTheme;
  setMode: (mode: ColorMode) => void;
  setTheme: (theme: ColorTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ColorMode>(() => {
    return (localStorage.getItem('slib-color-mode') as ColorMode) || 'system';
  });

  const [theme, setThemeState] = useState<ColorTheme>(() => {
    return (localStorage.getItem('slib-color-theme') as ColorTheme) || 'blue';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute('data-theme', theme);
    localStorage.setItem('slib-color-theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (mode === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(mode);
    }
    
    localStorage.setItem('slib-color-mode', mode);
  }, [mode]);

  const setMode = (newMode: ColorMode) => {
    setModeState(newMode);
  };

  const setTheme = (newTheme: ColorTheme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ mode, theme, setMode, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
