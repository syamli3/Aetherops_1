import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function RelatedLists({ relatedGroups }: { relatedGroups: any[] }) {
  if (!relatedGroups || relatedGroups.length === 0) {
    return (
       <div className="text-center p-8 text-gray-500 text-sm">
          No related records found.
       </div>
    );
  }

  return (
    <div className="space-y-6">
       {relatedGroups.map((group, idx) => (
          <div key={idx} className="border border-gray-200 dark:border-void-lighter rounded-xl shadow-sm bg-white dark:bg-void-light overflow-hidden transition-all">
             {/* Card Header */}
             <div className="p-4 border-b border-gray-100 dark:border-void-lighter bg-gray-50 dark:bg-void-light/50 flex justify-between items-center transition-colors">
                <div className="flex items-center gap-3">
                   <h3 className="text-[11px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest">{group.objectLabel}</h3>
                   <span className="text-[10px] font-bold bg-gray-200 dark:bg-void-lighter text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full shadow-inner">{group.records.length}</span>
                </div>
                <Link 
                   href={`/${group.objectApiName.toLowerCase()}/new?${group.fieldApiName}=true`} 
                   className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-void border border-gray-200 dark:border-void-lighter text-[11px] font-bold rounded-md hover:bg-gray-50 dark:hover:bg-void-lighter transition-all text-gray-700 dark:text-gray-300 shadow-sm transform active:scale-95"
                >
                   <Plus size={14} /> New
                </Link>
             </div>
 
             {/* Card Body - Minified Data Table */}
             <div className="overflow-x-auto p-2 scrollbar-thin">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="border-b border-gray-50 dark:border-void-lighter">
                         <th className="p-3 pl-4 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Record Name</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50 dark:divide-void-lighter">
                      {group.records.slice(0, 5).map((rec: any) => {
                         const rawLabel = rec.record_data?.Name || rec.record_data?.Title || rec.record_data?.LastName || 'Unknown Record';
                         return (
                            <tr key={rec.id} className="hover:bg-gray-50/50 dark:hover:bg-void-lighter/30 transition-colors group">
                               <td className="p-3 pl-4 text-sm font-bold">
                                  <Link href={`/${group.objectApiName.toLowerCase()}/${rec.id}`} className="text-aether-blue dark:text-blue-400 hover:underline underline-offset-4">
                                     {rawLabel}
                                  </Link>
                               </td>
                            </tr>
                         );
                      })}
                   </tbody>
                </table>
             </div>
             {group.records.length > 5 && (
                <div className="p-3 text-center border-t border-gray-50 dark:border-void-lighter bg-gray-50 dark:bg-void-light/30 transition-colors">
                   <Link href={`/${group.objectApiName.toLowerCase()}`} className="text-[11px] font-black text-aether-blue dark:text-blue-400 hover:underline uppercase tracking-widest">
                      View All
                   </Link>
                </div>
             )}
          </div>
       ))}
    </div>
  );
}
