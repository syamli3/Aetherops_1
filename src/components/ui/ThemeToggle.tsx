'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    const initTheme = async () => {
      const { getUserPreferences } = await import('@/actions/user');
      const prefs: any = await getUserPreferences();
      if (prefs && prefs.theme) {
        const html = document.documentElement;
        if (prefs.theme === 'dark') {
          html.classList.add('dark');
          html.style.colorScheme = 'dark';
          setIsDark(true);
        } else if (prefs.theme === 'light') {
          html.classList.remove('dark');
          html.style.colorScheme = 'light';
          setIsDark(false);
        }
      } else {
        const isDarkMode = document.documentElement.classList.contains('dark');
        setIsDark(isDarkMode);
      }
    };
    initTheme();
  }, []);

  const toggleTheme = async () => {
    const html = document.documentElement;
    const isCurrentlyDark = html.classList.contains('dark');
    const newDark = !isCurrentlyDark;
    
    // Optimistic UI update
    setIsDark(newDark);
    if (newDark) {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      html.style.colorScheme = 'dark';
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      html.style.colorScheme = 'light';
    }

    // Sync with Supabase
    const { updateUserPreferences } = await import('@/actions/user');
    await updateUserPreferences({ theme: newDark ? 'dark' : 'light' });
  };

  if (!mounted) {
    return <div className="p-2 mr-1 w-9 h-9" />; // Placeholder to prevent layout shift
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 mr-1 text-gray-500 hover:text-[#0176D3] hover:bg-gray-100 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-gray-800 rounded-full transition-all duration-300 relative overflow-hidden group"
      title="Toggle Theme"
    >
      <div className="relative w-5 h-5">
        <Sun 
          className={`absolute inset-0 transition-all duration-500 transform ${
            isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
          }`} 
          size={20} 
        />
        <Moon 
          className={`absolute inset-0 transition-all duration-500 transform ${
            isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
          }`} 
          size={20} 
        />
      </div>
    </button>
  );
}
