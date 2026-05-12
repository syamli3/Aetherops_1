'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import { LayoutList, KanbanSquare } from 'lucide-react';

export default function ViewToggle() {
   const searchParams = useSearchParams();
   const pathname = usePathname();
   const currentView = searchParams.get('view') === 'kanban' ? 'kanban' : 'table';

   return (
     <div className="flex border border-gray-300 dark:border-void-lighter rounded-lg bg-white dark:bg-void overflow-hidden shadow-sm transition-all">
        <Link 
          href={pathname + '?view=table'}
          className={`px-4 py-2 flex items-center justify-center transition-all ${currentView === 'table' ? 'bg-aether-blue text-white shadow-inner' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-void-lighter'}`}
          title="Display as Table"
        >
          <LayoutList size={18} />
        </Link>
        <div className="w-px bg-gray-300 dark:bg-void-lighter"></div>
        <Link 
          href={pathname + '?view=kanban'}
          className={`px-4 py-2 flex items-center justify-center transition-all ${currentView === 'kanban' ? 'bg-aether-blue text-white shadow-inner' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-void-lighter'}`}
          title="Display as Kanban Board"
        >
          <KanbanSquare size={18} />
        </Link>
     </div>
   );
}
