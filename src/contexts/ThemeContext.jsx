import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = {
  light: {
    name: 'light',
    background: '#f5f5f5',
    backgroundSecondary: '#ffffff',
    backgroundTertiary: '#f9f9f9',
    text: '#333333',
    textSecondary: '#666666',
    textMuted: '#888888',
    primary: '#2196F3',
    primaryHover: '#1976D2',
    success: '#4CAF50',
    successLight: '#e8f5e9',
    warning: '#FF9800',
    warningLight: '#fff3e0',
    danger: '#f44336',
    dangerLight: '#ffebee',
    purple: '#9C27B0',
    purpleLight: '#f3e5f5',
    deepPurple: '#673AB7',
    border: '#e0e0e0',
    borderLight: '#eeeeee',
    shadow: 'rgba(0, 0, 0, 0.1)',
    shadowHover: 'rgba(0, 0, 0, 0.15)',
    overlay: 'rgba(0, 0, 0, 0.5)',
    cardBg: '#ffffff',
    inputBg: '#ffffff',
    inputBorder: '#ddd',
    inputFocus: '#2196F3',
    skeleton: '#e0e0e0',
    skeletonShine: '#f5f5f5',
  },
  dark: {
    name: 'dark',
    background: '#121212',
    backgroundSecondary: '#1e1e1e',
    backgroundTertiary: '#2d2d2d',
    text: '#e0e0e0',
    textSecondary: '#b0b0b0',
    textMuted: '#888888',
    primary: '#64b5f6',
    primaryHover: '#42a5f5',
    success: '#81c784',
    successLight: '#1b3d1f',
    warning: '#ffb74d',
    warningLight: '#3d2e1b',
    danger: '#e57373',
    dangerLight: '#3d1b1b',
    purple: '#ce93d8',
    purpleLight: '#2d1b33',
    deepPurple: '#b39ddb',
    border: '#333333',
    borderLight: '#404040',
    shadow: 'rgba(0, 0, 0, 0.3)',
    shadowHover: 'rgba(0, 0, 0, 0.5)',
    overlay: 'rgba(0, 0, 0, 0.7)',
    cardBg: '#1e1e1e',
    inputBg: '#2d2d2d',
    inputBorder: '#404040',
    inputFocus: '#64b5f6',
    skeleton: '#333333',
    skeletonShine: '#404040',
  }
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('collab-planner-theme');
    return saved || 'light';
  });

  useEffect(() => {
    localStorage.setItem('collab-planner-theme', theme);
    document.body.style.backgroundColor = themes[theme].background;
    document.body.style.color = themes[theme].text;
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const colors = themes[theme];

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
