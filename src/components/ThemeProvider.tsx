'use client';

import React, { createContext, useState, useMemo, useContext, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import createAppTheme from '../styles/theme';

type ColorMode = 'light' | 'dark';

interface ThemeContextType {
  colorMode: ColorMode;
  toggleColorMode: () => void;
}

// Create context for theme mode
const ThemeContext = createContext<ThemeContextType>({
  colorMode: 'light',
  toggleColorMode: () => {},
});

// Custom hook to use theme context
export const useThemeContext = () => useContext(ThemeContext);

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Try to get color mode from localStorage on initial render
  const [colorMode, setColorMode] = useState<ColorMode>('light');

  // Effect to load saved theme preference
  useEffect(() => {
    const savedMode = localStorage.getItem('theme-mode') as ColorMode | null;
    if (savedMode) {
      setColorMode(savedMode);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // Default to user's system preference if available
      setColorMode('dark');
    }
  }, []);

  // Create a toggle function
  const toggleColorMode = () => {
    setColorMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme-mode', newMode);
      return newMode;
    });
  };

  // Memoize the theme to prevent unnecessary re-renders
  const theme = useMemo(() => createAppTheme(colorMode), [colorMode]);

  // Provide context value and theme
  return (
    <ThemeContext.Provider value={{ colorMode, toggleColorMode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
} 