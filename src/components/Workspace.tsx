'use client';

import React, { useState } from 'react';
import SmartLists from './SmartLists';
import CustomerProfile from './CustomerProfile';
import { Database } from '@/lib/database.types';
import { ArrowLeft } from 'lucide-react';

type Customer = Database['public']['Tables']['customers']['Row'];

export default function Workspace() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  return (
    <div className="flex-1 overflow-hidden relative w-full h-full flex">
      {/* View 1: Dynamic Smart Lists */}
      <div className={`absolute inset-0 transition-transform duration-300 ease-in-out ${selectedCustomer ? '-translate-x-full' : 'translate-x-0'}`}>
         <SmartLists onSelectCustomer={(c) => setSelectedCustomer(c)} />
      </div>

      {/* View 2: Customer 360 Profile */}
      <div className={`absolute inset-0 transition-transform duration-300 ease-in-out bg-zinc-950 flex flex-col ${selectedCustomer ? 'translate-x-0' : 'translate-x-full'}`}>
         
         <div className="h-12 border-b border-zinc-800 bg-zinc-900 flex items-center px-4 shadow-sm z-20">
            <button 
              onClick={() => setSelectedCustomer(null)}
              className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors font-medium px-2 py-1 rounded hover:bg-zinc-800"
            >
               <ArrowLeft size={16} /> Back to Smart Lists
            </button>
         </div>
         
         <div className="flex-1 overflow-hidden relative z-10">
            {selectedCustomer && <CustomerProfile customer={selectedCustomer} />}
         </div>
      </div>
    </div>
  );
}
