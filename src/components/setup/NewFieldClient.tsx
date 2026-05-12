'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createField } from '@/actions/metadata';

export default function NewFieldClient({ 
  objectId, 
  apiName, 
  allObjects 
}: { 
  objectId: string, 
  apiName: string, 
  allObjects: any[] 
}) {
  const router = useRouter();
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldApiName, setFieldApiName] = useState('');
  const [dataType, setDataType] = useState<'Text' | 'Number' | 'Picklist' | 'Checkbox' | 'Date' | 'Lookup'>('Text');
  const [isRequired, setIsRequired] = useState(false);
  const [targetObjectId, setTargetObjectId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-generate API Name: "Custom_Field__c"
  const handleLabelChange = (val: string) => {
    setFieldLabel(val);
    const generated = val.replace(/[^a-zA-Z0-9]/g, '_') + '__c';
    setFieldApiName(generated);
  };

  const handleSubmit = async () => {
    if (!fieldLabel || !fieldApiName || !dataType) {
      alert('Please fill out all required attributes.');
      return;
    }
    
    if (dataType === 'Lookup' && !targetObjectId) {
      alert('Please select a related object for this lookup field.');
      return;
    }

    setIsSubmitting(true);
    const res = await createField(objectId, apiName, {
      field_label: fieldLabel,
      field_api_name: fieldApiName,
      data_type: dataType,
      is_required: isRequired,
      target_object_id: dataType === 'Lookup' ? targetObjectId : undefined
    });
    setIsSubmitting(false);

    if (res.success) {
      router.push(`/setup/object-manager/${apiName}/fields-relationships`);
      router.refresh();
    } else {
      alert(`Failed: ${res.error}`);
    }
  };

  return (
    <div className="bg-white border top-0 border-gray-200 mt-4 rounded shadow-sm max-w-2xl mx-auto flex flex-col">
       <div className="bg-gray-50 border-b border-gray-200 p-4 rounded-t">
          <h2 className="text-lg font-bold text-gray-800">New Custom Field</h2>
       </div>
       <div className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 border-b border-gray-100 pb-4">
             <div className="w-1/3 text-right text-sm font-semibold text-gray-700 pr-2">Data Type</div>
             <div className="flex-1">
                <select 
                  className="w-full text-sm border border-gray-300 rounded p-1.5 focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] focus:outline-none"
                  value={dataType}
                  onChange={(e: any) => setDataType(e.target.value)}
                >
                   <option value="Text">Text</option>
                   <option value="Number">Number</option>
                   <option value="Picklist">Picklist</option>
                   <option value="Checkbox">Checkbox</option>
                   <option value="Date">Date</option>
                   <option value="Lookup">Lookup Relationship</option>
                </select>
             </div>
          </div>

          {dataType === 'Lookup' && (
             <div className="flex flex-col p-4 bg-orange-50 border border-orange-100 rounded md:flex-row md:items-center gap-4 pb-4">
                <div className="w-1/3 text-right text-sm font-semibold text-gray-700 pr-2 flex items-center justify-end gap-1">
                  <span className="w-1 h-full bg-red-600 rounded-l block"></span>
                  Related To
                </div>
                <div className="flex-1">
                   <select 
                     className="w-full text-sm border border-gray-300 rounded p-1.5 focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] focus:outline-none"
                     value={targetObjectId}
                     onChange={(e) => setTargetObjectId(e.target.value)}
                   >
                      <option value="">--Select Object--</option>
                      {allObjects.map(o => (
                         <option key={o.id} value={o.id}>{o.label} ({o.api_name})</option>
                      ))}
                   </select>
                   <p className="text-xs text-gray-500 mt-1">Select the parent object this record will link to.</p>
                </div>
             </div>
          )}

          <div className="flex flex-col md:flex-row md:items-center gap-4">
             <div className="w-1/3 text-right text-sm font-semibold text-gray-700 pr-2 flex items-center justify-end gap-1">
               <span className="w-1 h-4 bg-red-600 rounded-l inline-block"></span>
               Field Label
             </div>
             <div className="flex-1">
                <input 
                  type="text" 
                  className="w-full text-sm border border-gray-300 rounded p-1.5 focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] focus:outline-none"
                  value={fieldLabel}
                  onChange={(e) => handleLabelChange(e.target.value)}
                  placeholder="e.g. Primary Account"
                />
             </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center gap-4">
             <div className="w-1/3 text-right text-sm font-semibold text-gray-700 pr-2 flex items-center justify-end gap-1">
               <span className="w-1 h-4 bg-red-600 rounded-l inline-block"></span>
               Field Name (API)
             </div>
             <div className="flex-1">
                <input 
                  type="text" 
                  className="w-full text-sm border border-gray-300 rounded p-1.5 bg-gray-50 focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] focus:outline-none"
                  value={fieldApiName}
                  onChange={(e) => setFieldApiName(e.target.value)}
                />
             </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-4">
             <div className="w-1/3 text-right text-sm font-semibold text-gray-700 pr-2 flex items-center justify-end gap-1">
               Required
             </div>
             <div className="flex-1 flex text-sm items-center gap-2 text-gray-700">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-gray-300 text-[#0176D3] focus:ring-[#0176D3]"
                  checked={isRequired}
                  onChange={(e) => setIsRequired(e.target.checked)}
                />
                Always require a value in this field in order to save a record
             </div>
          </div>
       </div>

       <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-center gap-2 rounded-b">
          <button 
             onClick={() => router.push(`/setup/object-manager/${apiName}/fields-relationships`)}
             className="px-4 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-100 transition-colors"
          >
             Cancel
          </button>
          <button 
             onClick={handleSubmit}
             disabled={isSubmitting}
             className="px-4 py-1.5 bg-[#0176D3] text-white text-sm font-medium rounded hover:bg-[#014486] transition-colors disabled:opacity-50"
          >
             {isSubmitting ? 'Saving...' : 'Save'}
          </button>
       </div>
    </div>
  );
}
