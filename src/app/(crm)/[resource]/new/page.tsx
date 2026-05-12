import React from 'react';
import { notFound } from 'next/navigation';
import DynamicFormClient from '@/components/crm/DynamicFormClient';
import { getLayoutForObject } from '@/actions/layouts';

export const revalidate = 0;

export default async function NewRecordPage({ params }: { params: Promise<{ resource: string }> }) {
  const resolvedParams = await params;
  const resourceName = resolvedParams.resource;
  
  const { getObjects, getFieldsForObject } = await import('@/actions/metadata');
  const allObjects = await getObjects();
  const obj = allObjects.find((o) => o.plural_label.toLowerCase() === resourceName.toLowerCase() || o.api_name.toLowerCase() === resourceName.toLowerCase());

  if (!obj) {
    notFound();
  }

  const fields = await getFieldsForObject(obj.id);
  const layoutConfig = await getLayoutForObject(obj.id);

  return (
    <div className="p-8 h-full bg-gray-50 dark:bg-void flex items-start justify-center overflow-auto scrollbar-thin transition-colors duration-300">
      {/* SLDS Modal-style wrapper */}
      <div className="bg-white dark:bg-void-light rounded-xl shadow-2xl max-w-4xl w-full flex flex-col border border-gray-200 dark:border-void-lighter min-h-[50vh] transition-all transform animate-in fade-in zoom-in duration-300">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-100 dark:border-void-lighter bg-white dark:bg-void-light/50 flex items-center gap-4 rounded-t-xl transition-colors">
            <div className="w-10 h-10 bg-[#7F8DE1] rounded-lg shadow-md flex items-center justify-center text-white shrink-0 transform hover:rotate-6 transition-transform">
               <span className="text-xl font-black">{obj.label.charAt(0)}</span>
            </div>
            <div>
              <div className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5">RESOURCE CREATION</div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">New {obj.label}</h2>
            </div>
        </div>

        {/* Modal Body / Client component injected here */}
        <div className="p-8 flex-1 overflow-y-auto bg-white dark:bg-void-light/30 transition-colors">
          <DynamicFormClient 
            objectId={obj.id} 
            objectLabel={obj.label} 
            fields={fields} 
            resourceName={resourceName} 
            layoutConfig={layoutConfig}
          />
        </div>
      </div>
    </div>
  );
}
