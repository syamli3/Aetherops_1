'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Grid, LineChart, Settings, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AppLauncherClient({ apps, userRole }: { apps: any[], userRole?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    router.push(path);
    router.refresh();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
         onClick={() => setIsOpen(!isOpen)}
         className={`p-1.5 rounded-lg transition-all transform active:scale-95 flex items-center justify-center ${
           isOpen 
             ? 'text-aether-blue bg-blue-50 dark:bg-void-lighter ring-1 ring-aether-blue/20' 
             : 'text-gray-500 hover:text-aether-blue hover:bg-gray-100 dark:hover:bg-void-lighter'
         }`}
         title="App Launcher"
      >
         <Grid size={20} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
             initial={{ opacity: 0, scale: 0.95, y: -10 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             exit={{ opacity: 0, scale: 0.95, y: -10 }}
             transition={{ duration: 0.2, ease: "easeOut" }}
             className="absolute top-12 left-0 w-80 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-gray-200/60 dark:border-white/10 shadow-2xl rounded-2xl z-[60] p-4 overflow-hidden"
          >
             <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">Your Workspaces</h3>
             
             <div className="flex flex-col gap-2">
                {/* AetherOps CRM Workspace Tile */}
                <div 
                   onClick={() => handleNavigate('/dashboard/pipeline')}
                   className="flex items-center gap-4 p-3 rounded-xl bg-gray-50/50 hover:bg-white dark:bg-void/40 dark:hover:bg-void transition-all cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-void-lighter hover:shadow-sm group h-20"
                >
                   <div className="w-12 h-12 bg-gradient-to-br from-[#0176D3] to-[#0158a1] rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-md transform group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
                     <LineChart size={24} />
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-bold text-gray-900 dark:text-gray-100 leading-none mb-1 group-hover:text-aether-blue transition-colors truncate">AetherOps CRM</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 leading-tight">Pipeline, Analytics & Leads</div>
                   </div>
                </div>

                {/* System Setup Tile (RBAC Guarded) */}
                {userRole !== 'Standard User' && (
                  <div 
                     onClick={() => handleNavigate('/setup/home')}
                     className="flex items-center gap-4 p-3 rounded-xl bg-gray-50/50 hover:bg-white dark:bg-void/40 dark:hover:bg-void transition-all cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-void-lighter hover:shadow-sm group h-20"
                  >
                     <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-md transform group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
                       <Database size={24} />
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="text-[15px] font-bold text-gray-900 dark:text-gray-100 leading-none mb-1 group-hover:text-purple-500 transition-colors truncate">System Setup</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 leading-tight">Users, Security & Architecture</div>
                     </div>
                  </div>
                )}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
