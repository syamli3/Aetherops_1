'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createObject } from '@/actions/metadata';

export default function NewObjectClient() {
  const router = useRouter();
  const [label, setLabel] = useState('');
  const [pluralLabel, setPluralLabel] = useState('');
  const [apiName, setApiName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-generate Plural and API Name
  const handleLabelChange = (val: string) => {
    setLabel(val);
    
    // Naive pluralization for convenience
    if (!pluralLabel || pluralLabel === label + 's' || pluralLabel === label.slice(0, -1) + 's') {
        if (val.endsWith('s')) setPluralLabel(val + 'es');
        else if (val.endsWith('y')) setPluralLabel(val.slice(0, -1) + 'ies');
        else setPluralLabel(val + 's');
    }

    const generated = val.replace(/[^a-zA-Z0-9]/g, '_') + '__c';
    setApiName(generated);
  };

  const handleSubmit = async () => {
    if (!label || !pluralLabel || !apiName) {
      alert('Please fill out Label, Plural Label, and API Name.');
      return;
    }

    setIsSubmitting(true);
    const res = await createObject({
      label,
      plural_label: pluralLabel,
      api_name: apiName,
      description
    });
    setIsSubmitting(false);

    if (res.success) {
      // Redirect to the newly created object's detail page
      router.push(`/setup/object-manager/${apiName}`);
      router.refresh(); // Force the navigation bar to re-fetch the new tab!
    } else {
      alert(`Failed to create object: ${res.error}`);
    }
  };

  return (
    <div className="bg-white border top-0 border-gray-200 mt-4 rounded shadow-sm max-w-3xl mx-auto flex flex-col">
       <div className="bg-gray-50 border-b border-gray-200 p-4 rounded-t">
          <h2 className="text-lg font-bold text-gray-800">New Custom Object</h2>
          <p className="text-sm text-gray-500 mt-1">Custom objects allow you to store unique AetherOps data. Every custom object automatically gets standard fields like Name, Created By, and ID.</p>
       </div>
       
       <div className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-start gap-4">
             <div className="w-1/3 text-right text-sm font-semibold text-gray-700 pr-2 pt-2 flex items-center justify-end gap-1">
               <span className="w-1 h-4 bg-red-600 rounded-l inline-block"></span>
               Label
             </div>
             <div className="flex-1">
                <input 
                  type="text" 
                  className="w-full text-sm border border-gray-300 rounded p-1.5 focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] focus:outline-none"
                  value={label}
                  onChange={(e) => handleLabelChange(e.target.value)}
                  placeholder="e.g. Project"
                />
                <p className="text-xs text-gray-500 mt-1">The singular label. Used on tabs, page layouts, and reports.</p>
             </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-start gap-4">
             <div className="w-1/3 text-right text-sm font-semibold text-gray-700 pr-2 pt-2 flex items-center justify-end gap-1">
               <span className="w-1 h-4 bg-red-600 rounded-l inline-block"></span>
               Plural Label
             </div>
             <div className="flex-1">
                <input 
                  type="text" 
                  className="w-full text-sm border border-gray-300 rounded p-1.5 focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] focus:outline-none"
                  value={pluralLabel}
                  onChange={(e) => setPluralLabel(e.target.value)}
                  placeholder="e.g. Projects"
                />
                <p className="text-xs text-gray-500 mt-1">The plural label. Used for the main tab name in the CRM.</p>
             </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-start gap-4">
             <div className="w-1/3 text-right text-sm font-semibold text-gray-700 pr-2 pt-2 flex items-center justify-end gap-1">
               <span className="w-1 h-4 bg-red-600 rounded-l inline-block"></span>
               Object Name (API)
             </div>
             <div className="flex-1">
                <input 
                  type="text" 
                  className="w-full text-sm border border-gray-300 rounded p-1.5 bg-gray-50 focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] focus:outline-none font-mono"
                  value={apiName}
                  onChange={(e) => setApiName(e.target.value)}
                  placeholder="Project__c"
                />
                <p className="text-xs text-gray-500 mt-1">The unique developer name used by the API and database layer.</p>
             </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-start gap-4">
             <div className="w-1/3 text-right text-sm font-semibold text-gray-700 pr-2 pt-2 flex items-center justify-end gap-1">
               Description
             </div>
             <div className="flex-1">
                <textarea 
                  className="w-full text-sm border border-gray-300 rounded p-1.5 focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] focus:outline-none min-h-[80px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Track internal implementation projects mapped to Accounts."
                />
             </div>
          </div>
       </div>

       <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-center gap-2 rounded-b">
          <button 
             onClick={() => router.push(`/setup/object-manager`)}
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
