'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, ChevronDown, User, Shield, Box, Workflow, Home, Database } from 'lucide-react';

const MENU = [
  {
    category: 'Administration',
    items: [
      { label: 'Users', href: '/setup/users', icon: User },
      { label: 'Profiles', href: '/setup/profiles', icon: Shield },
    ]
  },
  {
    category: 'Platform Tools',
    items: [
      { label: 'Object Manager', href: '/setup/object-manager', icon: Box },
      { label: 'Flows', href: '/setup/flows', icon: Workflow },
      { label: 'Data Import', href: '/setup/data-import', icon: Database },
    ]
  }
];

export default function SetupSidebar() {
  const pathname = usePathname();
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Administration': true,
    'Platform Tools': true
  });

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  return (
    <aside className="w-64 bg-white dark:bg-void border-r border-gray-200 dark:border-void-lighter h-full flex flex-col overflow-y-auto transition-colors duration-300">
       <div className="p-4 border-b border-gray-100 dark:border-void-lighter">
          <Link href="/setup/home" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-aether-blue dark:hover:text-blue-400 transition-all group">
             <Home size={16} className="group-hover:scale-110 transition-transform" /> Setup Home
          </Link>
       </div>

       <div className="flex-1 py-4">
         {MENU.map((section) => (
            <div key={section.category} className="mb-4">
               <button 
                 onClick={() => toggleCategory(section.category)}
                 className="w-full flex items-center gap-1 px-4 py-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-void-lighter/50 transition-colors"
               >
                 {expandedCategories[section.category] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                 {section.category}
               </button>
               
               {expandedCategories[section.category] && (
                 <ul className="mt-1 flex flex-col">
                   {section.items.map((item) => {
                     const isActive = pathname.startsWith(item.href);
                     return (
                       <li key={item.href}>
                         <Link 
                           href={item.href}
                           className={`flex items-center gap-3 px-6 py-2 text-sm transition-all border-l-4 ${
                             isActive 
                               ? 'border-aether-blue text-aether-blue font-bold bg-blue-50/50 dark:bg-void-lighter' 
                               : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-void-lighter hover:text-gray-900 dark:hover:text-gray-200'
                           }`}
                         >
                           <item.icon size={16} className={isActive ? 'text-aether-blue' : 'text-gray-400 group-hover:text-gray-600'} />
                           {item.label}
                         </Link>
                       </li>
                     );
                   })}
                 </ul>
               )}
            </div>
         ))}
       </div>
    </aside>
  );
}
