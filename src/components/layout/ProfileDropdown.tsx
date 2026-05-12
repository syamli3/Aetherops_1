'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Settings, LogOut, Shield, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="ml-2 w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-medium text-xs border-2 border-transparent hover:border-[#0176D3] transition-all transform hover:scale-105 active:scale-95"
      >
        JS
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white/90 dark:bg-void-light/90 backdrop-blur-md rounded-xl shadow-xl border border-gray-200/50 dark:border-void-lighter z-[100] p-1.5 animate-in fade-in zoom-in-95 duration-200">
          <div className="px-3 py-2 border-b border-gray-100 dark:border-void-lighter mb-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Signed in as</p>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">Authenticated User</p>
          </div>

          <Link
            href="/settings/security"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-void-lighter hover:text-aether-blue dark:hover:text-blue-400 hover:translate-x-1 transition-all group"
          >
            <Shield size={16} className="text-gray-400 group-hover:text-aether-blue transition-colors" />
            Security & Password
          </Link>

          <Link
            href="/setup/home"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-void-lighter hover:text-aether-blue dark:hover:text-blue-400 hover:translate-x-1 transition-all group"
          >
            <Settings size={16} className="text-gray-400 group-hover:text-aether-blue transition-colors" />
            Setup
          </Link>

          <div className="h-px bg-gray-100 dark:bg-void-lighter my-1 mx-1"></div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 dark:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:translate-x-1 transition-all font-medium group"
          >
            <LogOut size={16} className="group-hover:text-red-700 transition-colors" />
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}
