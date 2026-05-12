import React from 'react';
import { notFound } from 'next/navigation';
import { Search } from 'lucide-react';
import Link from 'next/link';
import ViewToggle from '@/components/crm/ViewToggle';
import KanbanBoard from '@/components/crm/KanbanBoard';

export const revalidate = 0;

export default async function DynamicListView({ 
  params,
  searchParams
}: { 
  params: Promise<{ resource: string }>,
  searchParams: Promise<{ view?: string }>
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const resourceName = resolvedParams.resource;
  const viewMode = resolvedSearchParams.view === 'kanban' ? 'kanban' : 'table';
  
  // Is this Object allowed to have a Kanban?
  const isKanbanEnabled = ['lead', 'leads', 'opportunity', 'opportunities'].includes(resourceName.toLowerCase());
  const { getObjects, getFieldsForObject } = await import('@/actions/metadata');
  const { getRecordsForObject } = await import('@/actions/records');
  const allObjects = await getObjects();
  const obj = allObjects.find((o) => o.plural_label.toLowerCase() === resourceName.toLowerCase() || o.api_name.toLowerCase() === resourceName.toLowerCase() || o.label.toLowerCase() === resourceName.toLowerCase());

  if (!obj) {
    notFound();
  }

  const fields = await getFieldsForObject(obj.id);
  const records = await getRecordsForObject(obj.api_name);
  // Show standard fields as default columns, maybe up to 5
  const columns = fields.filter(f => !f.is_custom).slice(0, 5);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-void transition-colors duration-300">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-void-lighter bg-gray-50 dark:bg-void-light/50 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#7F8DE1] rounded flex items-center justify-center text-white shrink-0 shadow-md transform hover:rotate-6 transition-transform">
            <span className="text-xl font-bold">{obj.label.charAt(0)}</span>
          </div>
          <div>
            <div className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5">{obj.plural_label}</div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 tracking-tight">
              All {obj.plural_label} <span className="text-aether-blue cursor-pointer text-sm">▼</span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
           {isKanbanEnabled && <ViewToggle />}
           <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>
           <button className="px-3 py-1.5 bg-white dark:bg-void border border-gray-300 dark:border-void-lighter text-gray-700 dark:text-gray-300 text-sm font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-void-lighter transition-all shadow-sm transform active:scale-95">Import</button>
           <Link href={`/${resourceName}/new`} className="flex items-center gap-1.5 px-4 py-1.5 bg-aether-blue text-white text-sm font-bold rounded-lg hover:bg-[#014486] transition-all shadow-lg transform active:scale-95">
             New {obj.label}
           </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-3 border-b border-gray-200 dark:border-void-lighter flex items-center justify-between bg-white dark:bg-void transition-colors">
         <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
           {viewMode === 'kanban' && isKanbanEnabled ? `Kanban Board • Sorted by Stage` : `${records.length} items • Sorted by Updated At`}
         </span>
         <div className="relative group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-aether-blue transition-colors" />
            <input 
              type="text" 
              placeholder={`Search this list...`} 
              className="pl-9 pr-3 py-1.5 text-sm bg-gray-50 dark:bg-void-light border border-gray-200 dark:border-void-lighter rounded-lg focus:bg-white dark:focus:bg-void focus:border-aether-blue focus:ring-1 focus:ring-aether-blue focus:outline-none transition-all w-72 placeholder:text-gray-400 dark:placeholder:text-gray-600" 
            />
         </div>
      </div>

      {/* Main Canvas Switcher */}
      {viewMode === 'kanban' && isKanbanEnabled ? (
         <KanbanWrapper apiName={obj.api_name} resourceName={resourceName} />
      ) : (
        /* Data Table */
        <div className="flex-1 overflow-auto bg-white dark:bg-void transition-colors scrollbar-thin">
         <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white dark:bg-void z-10 border-b border-gray-100 dark:border-void-lighter shadow-sm transition-colors">
               <tr>
                  <th className="p-3 pl-5 w-10">
                    <input type="checkbox" className="rounded border-gray-300 dark:bg-void-light dark:border-void-lighter focus:ring-aether-blue" />
                  </th>
                  {columns.map(col => (
                    <th key={col.id} className="p-3 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest cursor-pointer hover:text-aether-blue dark:hover:text-blue-400 transition-colors">
                      {col.field_label}
                    </th>
                  ))}
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-void-lighter">
               {(!records || records.length === 0) ? (
                 <tr>
                    <td colSpan={columns.length + 1} className="p-20 text-center transition-colors">
                       <p className="mb-2 text-xl font-bold text-gray-800 dark:text-gray-200 tracking-tight">No records found.</p>
                       <p className="text-gray-500 dark:text-gray-500 text-sm">Click <Link href={`/${resourceName}/new`} className="text-aether-blue dark:text-blue-400 hover:underline font-bold underline-offset-4">New</Link> to create your first record.</p>
                    </td>
                 </tr>
               ) : (
                 records.map((record: any) => (
                   <tr key={record.id} className="hover:bg-gray-50/80 dark:hover:bg-void-lighter/30 transition-colors group">
                      <td className="p-3 pl-5 w-10">
                         <input type="checkbox" className="rounded border-gray-300 dark:bg-void-light dark:border-void-lighter focus:ring-aether-blue" />
                      </td>
                      {columns.map((col: any, index: number) => {
                        const cellValue = record.record_data?.[col.field_api_name] || '';
                        
                        // The first mapped column gets the clickable Link treatment
                        if (index === 0) {
                           return (
                             <td key={col.id} className="p-3 text-sm font-bold">
                                <Link 
                                  href={`/${resourceName}/${record.id}`}
                                  className="text-aether-blue dark:text-blue-400 hover:underline underline-offset-4 decoration-2"
                                >
                                  {cellValue || '—'}
                                </Link>
                             </td>
                           );
                        }
                        
                        // All other columns render text normally
                        return (
                          <td key={col.id} className="p-3 text-sm text-gray-700 dark:text-gray-300 truncate max-w-xs transition-colors">
                            {typeof cellValue === 'boolean' ? (cellValue ? 'Yes' : 'No') : cellValue}
                          </td>
                        );
                      })}
                   </tr>
                 ))
               )}
            </tbody>
         </table>
      </div>
      )}
    </div>
  );
}

// Sub-component to isolate Kanban data fetching
async function KanbanWrapper({ apiName, resourceName }: { apiName: string, resourceName: string }) {
  const { getKanbanData, getPicklistOptions } = await import('@/actions/kanban');
  
  // Define default grouping fields per object for the scaffold
  const groupByField = resourceName.toLowerCase() === 'leads' ? 'Status' : 'StageName';
  
  const initialData = await getKanbanData(apiName, groupByField);
  const columns = await getPicklistOptions(apiName, groupByField);

  return (
    <div className="flex-1 bg-white dark:bg-void p-4 overflow-hidden transition-colors">
      <KanbanBoard 
        initialData={initialData} 
        columns={columns} 
        resourceName={resourceName} 
        groupByField={groupByField} 
      />
    </div>
  );
}
