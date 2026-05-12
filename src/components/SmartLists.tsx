'use client';

import React, { useState } from 'react';
import { Database } from '@/lib/database.types';
import { Search, Filter, Star, AlertTriangle, Clock, ListFilter, Users, ArrowRight } from 'lucide-react';

type Customer = Database['public']['Tables']['customers']['Row'];

// Dummy data for lists
const DUMMY_CUSTOMERS: Customer[] = [
  {
    id: '1',
    first_name: 'Elena',
    last_name: 'Rostova',
    email: 'elena.r@example.com',
    phone: '+1 (555) 019-2834',
    address: '124 Azure Way, Neo SF, CA',
    lifetime_value: 12450.00,
    churn_risk_score: 12,
    vip_status: true,
    personality_summary: 'Direct, prefers concise communication.',
    custom_fields: { "Hair Type": "Curly", "Preferred Stylist": "Marco" },
    created_at: new Date().toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: '2',
    first_name: 'Marcus',
    last_name: 'Chen',
    email: 'm.chen@example.com',
    phone: '+1 (555) 892-1102',
    address: '88 Tech Blvd, Austin, TX',
    lifetime_value: 850.00,
    churn_risk_score: 85,
    vip_status: false,
    personality_summary: 'Frustrated by recent delays. Needs empathy.',
    custom_fields: {},
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: '3',
    first_name: 'Sarah',
    last_name: 'Jenkins',
    email: 'sarah.j@example.com',
    phone: '+1 (555) 443-9912',
    address: '42 Pine St, Seattle, WA',
    lifetime_value: 4200.00,
    churn_risk_score: 40,
    vip_status: false,
    personality_summary: 'Loyal customer, likes product updates.',
    custom_fields: {},
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
  }
];

interface SmartListsProps {
  onSelectCustomer: (customer: Customer) => void;
}

export default function SmartLists({ onSelectCustomer }: SmartListsProps) {
  const [activeList, setActiveList] = useState<'all' | 'vip' | 'churn' | 'recent'>('all');
  
  // Filter logic
  let filteredCustomers = DUMMY_CUSTOMERS;
  if (activeList === 'vip') filteredCustomers = DUMMY_CUSTOMERS.filter(c => c.vip_status);
  if (activeList === 'churn') filteredCustomers = DUMMY_CUSTOMERS.filter(c => c.churn_risk_score && c.churn_risk_score > 70);
  if (activeList === 'recent') {
      // Sort by updated_at descending
      filteredCustomers = [...DUMMY_CUSTOMERS].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }

  return (
    <div className="flex h-full w-full bg-zinc-950 text-zinc-100 overflow-hidden">
      
      {/* LEFT SIDEBAR: List Selector */}
      <div className="w-64 border-r border-zinc-800/60 bg-zinc-900/40 p-4 flex flex-col gap-2">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2 px-2 flex items-center gap-2">
           <ListFilter size={14} /> Smart Lists
        </h2>
        
        <button 
          onClick={() => setActiveList('all')}
          className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${activeList === 'all' ? 'bg-indigo-600/10 text-indigo-400 font-medium' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'}`}
        >
          <div className="flex items-center gap-3">
             <Users size={16} /> All Customers
          </div>
          <span className="text-xs bg-zinc-800/80 px-1.5 py-0.5 rounded">{DUMMY_CUSTOMERS.length}</span>
        </button>
        
        <button 
          onClick={() => setActiveList('recent')}
          className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${activeList === 'recent' ? 'bg-indigo-600/10 text-indigo-400 font-medium' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'}`}
        >
          <div className="flex items-center gap-3">
             <Clock size={16} /> Recently Active
          </div>
        </button>
        
        <button 
          onClick={() => setActiveList('vip')}
          className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${activeList === 'vip' ? 'bg-indigo-600/10 text-indigo-400 font-medium' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'}`}
        >
          <div className="flex items-center gap-3">
             <Star size={16} className={activeList === 'vip' ? 'text-amber-400' : ''} /> VIP Segment
          </div>
          <span className="text-xs bg-zinc-800/80 px-1.5 py-0.5 rounded">{DUMMY_CUSTOMERS.filter(c => c.vip_status).length}</span>
        </button>
        
        <button 
          onClick={() => setActiveList('churn')}
          className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${activeList === 'churn' ? 'bg-indigo-600/10 text-indigo-400 font-medium' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'}`}
        >
          <div className="flex items-center gap-3">
             <AlertTriangle size={16} className={activeList === 'churn' ? 'text-red-400' : ''} /> High Churn Risk
          </div>
          <span className="text-xs bg-zinc-800/80 px-1.5 py-0.5 rounded">{DUMMY_CUSTOMERS.filter(c => c.churn_risk_score && c.churn_risk_score > 70).length}</span>
        </button>
      </div>

      {/* CENTER AREA: List Data */}
      <div className="flex-1 flex flex-col bg-zinc-950">
        <div className="h-16 border-b border-zinc-800/60 p-4 flex items-center justify-between bg-zinc-950/80 backdrop-blur top-0 z-10 sticky">
           <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold capitalize">
                {activeList === 'all' && 'All Customers'}
                {activeList === 'recent' && 'Recently Active Customers'}
                {activeList === 'vip' && 'VIP Segment'}
                {activeList === 'churn' && 'High Churn Risk (< 70 Score)'}
              </h2>
           </div>
           <div className="flex items-center gap-2">
              <div className="relative">
                 <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                 <input type="text" placeholder="Filter this list..." className="bg-zinc-900 border border-zinc-800 text-sm rounded-lg pl-9 pr-3 py-1.5 focus:outline-none focus:border-indigo-500 transition-colors w-64" />
              </div>
              <button className="p-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors">
                 <Filter size={16} />
              </button>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
           {/* Table Header */}
           <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 mb-2 px-4 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-widest border-b border-zinc-800/60 pb-3">
              <div>Customer</div>
              <div>Contact</div>
              <div>Lifetime Value</div>
              <div>Status</div>
              <div className="w-8"></div>
           </div>

           {/* Table Body */}
           <div className="flex flex-col gap-2">
             {filteredCustomers.map(customer => (
               <div 
                 key={customer.id} 
                 onClick={() => onSelectCustomer(customer)}
                 className="grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 p-4 rounded-xl border border-zinc-800/60 bg-zinc-900/20 hover:bg-zinc-800/40 hover:border-zinc-700 cursor-pointer transition-all items-center group"
               >
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-sm font-semibold border border-indigo-500/30">
                     {customer.first_name[0]}{customer.last_name[0]}
                   </div>
                   <div className="flex flex-col">
                     <span className="font-medium text-zinc-200">{customer.first_name} {customer.last_name}</span>
                     <span className="text-xs text-zinc-500 truncate max-w-[200px]">{customer.personality_summary}</span>
                   </div>
                 </div>

                 <div className="flex flex-col gap-1 text-sm text-zinc-400">
                    <span>{customer.email}</span>
                    <span className="text-xs">{customer.phone}</span>
                 </div>

                 <div className="font-medium text-zinc-300">
                   ${customer.lifetime_value?.toLocaleString()}
                 </div>

                 <div className="flex flex-col items-start gap-1">
                    {customer.vip_status && (
                       <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-500/20 text-amber-400 rounded ring-1 ring-amber-500/30 flex items-center gap-1 uppercase tracking-wider">
                         <Star size={10} className="fill-amber-400" /> VIP
                       </span>
                    )}
                    {customer.churn_risk_score && customer.churn_risk_score > 70 && (
                       <span className="px-2 py-0.5 text-[10px] font-semibold bg-red-500/20 text-red-400 rounded ring-1 ring-red-500/30 flex items-center gap-1 uppercase tracking-wider">
                         <AlertTriangle size={10} /> Churn Risk
                       </span>
                    )}
                 </div>

                 <div className="text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight size={18} />
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
