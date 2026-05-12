'use client';

import React from 'react';
import Link from 'next/link';
import { Settings, Search, Bell, Grid } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import ProfileDropdown from './ProfileDropdown';
import AppLauncherClient from './AppLauncherClient';

export default function SetupHeader() {
  return (
    <header className="h-12 bg-white dark:bg-void border-b border-gray-200 dark:border-void-lighter flex items-center justify-between px-4 flex-shrink-0 z-50 relative shadow-sm transition-colors duration-300">
      
      {/* Left: Setup Branding */}
      <div className="flex items-center gap-4">
        <AppLauncherClient apps={[]} userRole="System Administrator" />
        <div className="flex items-center gap-2">
           <Settings size={22} className="text-gray-600 dark:text-gray-400" />
           <span className="font-semibold text-gray-900 dark:text-gray-100 text-lg">Setup</span>
        </div>
      </div>

      {/* Center: Global Setup Search */}
      <div className="flex-1 max-w-xl mx-8">
        <div className="relative group">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-aether-blue transition-colors" />
          <input 
            type="text" 
            placeholder="Search Setup (e.g. Users, Profiles, Objects)..." 
            className="w-full h-8 pl-9 pr-3 bg-gray-100 dark:bg-void-light border border-transparent dark:border-void-lighter rounded-md text-sm text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-void-lighter focus:border-aether-blue focus:ring-1 focus:ring-aether-blue focus:outline-none transition-all placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-2">
         <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:block mr-2">Admin Portal</span>
        <button className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-aether-blue dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-void-lighter rounded-lg transition-colors" title="Notifications">
          <Bell size={20} />
        </button>

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block"></div>

        <ThemeToggle />
        <ProfileDropdown />
      </div>
    </header>
  );
}
