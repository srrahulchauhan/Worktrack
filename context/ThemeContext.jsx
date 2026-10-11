import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('worktrack_theme') || (document.documentElement.classList.contains('dark') ? 'dark' : 'dark');
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    try {
      localStorage.setItem('worktrack_theme', theme);
    } catch (e) {
      // ignore storage errors
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
    return {
      theme: isDark ? 'dark' : 'light',
      setTheme: () => {},
      toggleTheme: () => {
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark');
        }
      },
    };
  }
  return context;
}

export default ThemeContext;
