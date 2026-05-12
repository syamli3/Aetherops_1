'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Plus, UserPlus, FileText, Contact } from 'lucide-react';

export default function GlobalActionDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-1.5 rounded-lg transition-all transform active:scale-95 ${
          isOpen 
            ? 'text-[#0176D3] bg-blue-50 dark:bg-blue-900/20 rotate-45' 
            : 'text-gray-500 hover:text-[#0176D3] hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        title="Global Actions"
      >
        <Plus size={20} className="transition-transform duration-300" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white/90 dark:bg-void-light/90 backdrop-blur-md rounded-xl shadow-xl border border-gray-200/50 dark:border-void-lighter z-[100] p-1.5 animate-in fade-in zoom-in-95 duration-200">
          <div className="px-3 py-2 border-b border-gray-100 dark:border-void-lighter mb-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quick Create</p>
          </div>

          <Link
            href="/lead/new"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-void-lighter hover:text-aether-blue dark:hover:text-blue-400 hover:translate-x-1 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/40 transition-colors">
              <UserPlus size={16} />
            </div>
            New Lead
          </Link>

          <Link
            href="/account/new"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-void-lighter hover:text-aether-blue dark:hover:text-blue-400 hover:translate-x-1 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 transition-colors">
              <FileText size={16} />
            </div>
            New Account
          </Link>

          <Link
            href="/contact/new"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-void-lighter hover:text-aether-blue dark:hover:text-blue-400 hover:translate-x-1 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:bg-teal-100 dark:group-hover:bg-teal-900/40 transition-colors">
              <Contact size={16} />
            </div>
            New Contact
          </Link>
        </div>
      )}
    </div>
  );
}
