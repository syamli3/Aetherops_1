'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MainNavClient({ navItems }: { navItems: { label: string, href: string }[] }) {
  const pathname = usePathname();

  return (
    <ul className="flex items-center h-full">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
           <li key={item.href} className="h-full">
             <Link 
               href={item.href}
               className={`h-full flex items-center px-4 text-sm font-medium transition-all border-b-2 ${
                 isActive 
                   ? 'text-aether-blue border-aether-blue bg-blue-50/30 dark:bg-void-lighter/50' 
                   : 'text-gray-700 dark:text-gray-300 border-transparent hover:text-aether-blue dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-void-lighter/30'
               }`}
             >
               {item.label}
             </Link>
           </li>
        );
      })}
    </ul>
  );
}
