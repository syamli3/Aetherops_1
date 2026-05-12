import React from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';
import { Plus, Workflow, CheckCircle, XCircle } from 'lucide-react';
import { getObjects } from '@/actions/metadata';

export default async function FlowsIndexPage() {
   const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
   );

   const { data: flows } = await (supabaseAdmin.from('sf_flows') as any).select('*').order('created_at', { ascending: false });
   
   const objects = await getObjects();
   const getObjectLabel = (id: string) => objects.find(o => o.id === id)?.label || 'Unknown';

   return (
      <div className="max-w-6xl mx-auto py-8">
         <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-[#00A1E0] rounded flex items-center justify-center text-white shadow-sm">
                  <Workflow size={24} />
               </div>
               <div>
                  <h1 className="text-2xl font-bold text-gray-900 leading-tight">Flows</h1>
                  <p className="text-sm text-gray-500">Manage Record-Triggered Automation Rules</p>
               </div>
            </div>
            <Link 
               href="/setup/flows/new"
               className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 text-gray-800 text-sm font-semibold transition-colors"
            >
               <Plus size={16} /> New Flow
            </Link>
         </div>

         <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                     <th className="p-3">Flow Name</th>
                     <th className="p-3">Target Object</th>
                     <th className="p-3">Trigger Type</th>
                     <th className="p-3">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {!flows || flows.length === 0 ? (
                     <tr>
                        <td colSpan={4} className="p-8 text-center text-sm text-gray-500">
                           No flows found. Create one to get started.
                        </td>
                     </tr>
                  ) : (
                     flows.map((flow: any) => (
                        <tr key={flow.id} className="hover:bg-gray-50 transition-colors">
                           <td className="p-3 whitespace-nowrap">
                              <div className="font-semibold text-[#0176D3]">{flow.name}</div>
                              <div className="text-xs text-gray-500 font-mono mt-0.5">{flow.id}</div>
                           </td>
                           <td className="p-3 font-medium text-gray-900">
                              {getObjectLabel(flow.object_id)}
                           </td>
                           <td className="p-3">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                                 {flow.trigger_type}
                              </span>
                           </td>
                           <td className="p-3">
                              {flow.is_active ? (
                                 <span className="inline-flex items-center gap-1 text-green-700 font-medium text-sm">
                                    <CheckCircle size={14} className="text-green-500" /> Active
                                 </span>
                              ) : (
                                 <span className="inline-flex items-center gap-1 text-red-700 font-medium text-sm">
                                    <XCircle size={14} className="text-red-500" /> Inactive
                                 </span>
                              )}
                           </td>
                        </tr>
                     ))
                  )}
               </tbody>
            </table>
         </div>
      </div>
   );
}
