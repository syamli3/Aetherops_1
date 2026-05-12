import React from 'react';
import { notFound } from 'next/navigation';
import DynamicFormClient from '@/components/crm/DynamicFormClient';
import { getRecordById } from '@/actions/records';
import { getLayoutForObject } from '@/actions/layouts';

export const revalidate = 0;

export default async function DynamicRecordEditView({ params }: { params: Promise<{ resource: string, id: string }> }) {
  const resolvedParams = await params;
  const { resource: resourceName, id: recordId } = resolvedParams;

  const { getObjects, getFieldsForObject } = await import('@/actions/metadata');
  
  // 1. Fetch metadata
  const allObjects = await getObjects();
  const obj = allObjects.find((o) => o.plural_label.toLowerCase() === resourceName.toLowerCase() || o.api_name.toLowerCase() === resourceName.toLowerCase());

  if (!obj) {
    notFound();
  }

  // 2. Fetch specific record to prefill the form
  const record = await getRecordById(recordId);

  // Ensure record exists and matches this object container
  if (!record || record.object_id !== obj.id) {
    notFound();
  }

  // 3. Fetch input field geometries
  const fields = await getFieldsForObject(obj.id);
  const layoutConfig = await getLayoutForObject(obj.id);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-100px)] p-6 bg-[#f3f3f3]">
      <div className="w-full max-w-4xl bg-white rounded shadow-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
           <h2 className="text-lg font-bold text-gray-800">Edit {obj.label}</h2>
        </div>

        {/* Modal Body / Client component injected here */}
        <div className="p-6 flex-1 overflow-y-auto bg-white">
          <DynamicFormClient 
             objectId={obj.id} 
             objectLabel={obj.label} 
             fields={fields} 
             resourceName={resourceName} 
             initialData={record.record_data}
             recordId={recordId}
             layoutConfig={layoutConfig}
          />
        </div>
      </div>
    </div>
  );
}
