'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveRecord, updateRecord } from '@/actions/records';
import LookupSearch from '@/components/crm/LookupSearch';
import { ObjectLayoutConfig, LayoutSection } from '@/actions/layouts';

interface SFField {
  id: string;
  field_label: string;
  field_api_name: string;
  data_type: string;
  target_object_id?: string | null;
  is_required: boolean;
  is_custom: boolean;
}

export default function DynamicFormClient({
  objectId,
  objectLabel,
  fields,
  resourceName,
  initialData = {},
  recordId,
  layoutConfig,
}: {
  objectId: string;
  objectLabel: string;
  fields: SFField[];
  resourceName: string;
  initialData?: Record<string, any>;
  recordId?: string;
  layoutConfig?: ObjectLayoutConfig | null;
}) {
  const router = useRouter();
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Group fields into two columns for the SLDS layout (simplified split)
  const leftColumnFields = fields.filter((_, i) => i % 2 === 0);
  const rightColumnFields = fields.filter((_, i) => i % 2 !== 0);

  const handleInputChange = (fieldApiName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldApiName]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Dispatch the server action to save or update the generic JSONB record payload
    let result;
    if (recordId) {
      result = await updateRecord(recordId, formData, resourceName);
    } else {
      result = await saveRecord(objectId, formData, resourceName);
    }
    
    setIsSubmitting(false);

    if (result.success) {
      // Redirect back to list view or detail view
      if (recordId) {
        router.push(`/${resourceName}/${recordId}`);
      } else {
        router.push(`/${resourceName}`);
      }
    } else {
      console.error('Failed to save record:', result.error);
      alert(`Failed to save record: ${result.error}`);
    }
  };

  const renderField = (field: SFField) => {
    return (
      <div key={field.id} className="flex relative items-center py-2.5 group transition-colors">
        {field.is_required && (
          <div className="absolute left-0 top-3 bottom-3 w-1 bg-crimson rounded-full shadow-[0_0_8px_rgba(153,27,27,0.4)]" />
        )}
        <div className={`w-1/3 text-right pr-6 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest transition-colors ${field.is_required ? 'pl-2' : ''}`}>
          {field.field_label}
          {field.is_required && <span className="text-crimson ml-1">*</span>}
        </div>
        <div className="w-2/3">
          {field.data_type === 'Picklist' ? (
             <select 
               className="w-full text-sm bg-white dark:bg-void-light border border-gray-200 dark:border-void-lighter rounded-lg p-2 font-medium text-gray-900 dark:text-gray-100 focus:border-aether-blue focus:ring-1 focus:ring-aether-blue focus:outline-none transition-all shadow-sm"
               value={formData[field.field_api_name] || ''}
               onChange={(e) => handleInputChange(field.field_api_name, e.target.value)}
             >
                <option value="">--None--</option>
                <option value="Option1">Option 1</option>
                <option value="Option2">Option 2</option>
             </select>
          ) : field.data_type === 'Lookup' ? (
             <LookupSearch 
               targetObjectId={field.target_object_id || ''}
               value={formData[field.field_api_name] || ''}
               onChange={(val) => handleInputChange(field.field_api_name, val)}
             />
          ) : field.data_type === 'Checkbox' ? (
             <div className="flex items-center h-9">
               <input 
                 type="checkbox" 
                 className="w-5 h-5 rounded-md border-gray-300 dark:bg-void-light dark:border-void-lighter text-aether-blue focus:ring-aether-blue transition-all cursor-pointer"
                 checked={!!formData[field.field_api_name]}
                 onChange={(e) => handleInputChange(field.field_api_name, e.target.checked)}
               />
             </div>
          ) : (
             <input 
               type="text" 
               className="w-full text-sm bg-white dark:bg-void-light border border-gray-200 dark:border-void-lighter rounded-lg p-2 font-medium text-gray-900 dark:text-gray-100 focus:border-aether-blue focus:ring-1 focus:ring-aether-blue focus:outline-none transition-all shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-600"
               value={formData[field.field_api_name] || ''}
               onChange={(e) => handleInputChange(field.field_api_name, e.target.value)}
               placeholder={`Enter ${field.field_label.toLowerCase()}...`}
             />
          )}
        </div>
      </div>
    );
  };

  const renderLayoutDrivenForm = () => {
    if (!layoutConfig || layoutConfig.length === 0) return renderGenericFallback();

    return (
      <div className="flex flex-col w-full gap-8">
        {layoutConfig.map((section: LayoutSection) => (
           <div key={section.id} className="bg-white dark:bg-void-light/50 rounded-xl border border-gray-200 dark:border-void-lighter shadow-sm overflow-hidden pb-6 transition-all duration-300">
             <div className="bg-gray-50 dark:bg-void-light px-5 py-3 border-b border-gray-100 dark:border-void-lighter mb-6 transition-colors">
               <h3 className="text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest">{section.sectionName}</h3>
             </div>
             <div className={`grid gap-x-10 gap-y-6 px-8 ${section.columns === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
               {section.fields.map(apiName => {
                 const originalField = fields.find(f => f.field_api_name === apiName);
                 if (!originalField) return null; // Fault tolerant: quietly ignore missing fields
                 return (
                   <div key={apiName} className="flex flex-col group transition-all">
                      {/* We wrap the field to act like standard stacked labels for the specific CSS grid */}
                      <div key={originalField.id} className="flex flex-col relative py-1">
                         {originalField.is_required && (
                           <div className="absolute -left-3 top-2 bottom-0 w-1 bg-crimson rounded-full shadow-[0_0_8px_rgba(153,27,27,0.4)]" />
                         )}
                         <div className={`text-[10px] font-black text-gray-500 dark:text-gray-500 mb-2 uppercase tracking-widest transition-colors ${originalField.is_required ? '' : ''}`}>
                           {originalField.field_label}
                           {originalField.is_required && <span className="text-crimson ml-1">*</span>}
                         </div>
                         <div className="w-full">
                           {originalField.data_type === 'Picklist' ? (
                              <select 
                                className="w-full text-sm bg-white dark:bg-void-light border border-gray-200 dark:border-void-lighter rounded-lg p-2 font-medium text-gray-900 dark:text-gray-100 focus:border-aether-blue focus:ring-1 focus:ring-aether-blue focus:outline-none transition-all shadow-sm"
                                value={formData[originalField.field_api_name] || ''}
                                onChange={(e) => handleInputChange(originalField.field_api_name, e.target.value)}
                              >
                                 <option value="">--None--</option>
                                 <option value="Option1">Option 1</option>
                                 <option value="Option2">Option 2</option>
                              </select>
                           ) : originalField.data_type === 'Lookup' ? (
                              <LookupSearch 
                                targetObjectId={originalField.target_object_id || ''}
                                value={formData[originalField.field_api_name] || ''}
                                onChange={(val) => handleInputChange(originalField.field_api_name, val)}
                              />
                           ) : originalField.data_type === 'Checkbox' ? (
                              <div className="py-2">
                                <input 
                                  type="checkbox" 
                                  className="w-5 h-5 rounded-md border-gray-300 dark:bg-void-light dark:border-void-lighter text-aether-blue focus:ring-aether-blue cursor-pointer transition-all"
                                  checked={!!formData[originalField.field_api_name]}
                                  onChange={(e) => handleInputChange(originalField.field_api_name, e.target.checked)}
                                />
                              </div>
                           ) : (
                              <input 
                                type="text" 
                                className="w-full text-sm bg-white dark:bg-void-light border border-gray-200 dark:border-void-lighter rounded-lg p-2 font-medium text-gray-900 dark:text-gray-100 focus:border-aether-blue focus:ring-1 focus:ring-aether-blue focus:outline-none transition-all shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                value={formData[originalField.field_api_name] || ''}
                                onChange={(e) => handleInputChange(originalField.field_api_name, e.target.value)}
                                placeholder={`Enter ${originalField.field_label.toLowerCase()}...`}
                              />
                           )}
                         </div>
                       </div>
                   </div>
                 );
               })}
             </div>
           </div>
        ))}
      </div>
    );
  };

  const renderGenericFallback = () => {
     return (
        <div className="flex bg-white dark:bg-void-light/50 flex-1 min-h-[40vh] border border-gray-200 dark:border-void-lighter rounded-xl shadow-inner transition-colors">
           {/* Left Column */}
           <div className="flex-1 p-6 border-r border-gray-100 dark:border-void-lighter/50">
              {leftColumnFields.length > 0 ? leftColumnFields.map(renderField) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
                  <div className="text-[10px] font-black uppercase tracking-widest mb-2">No Metadata Found</div>
                  <p className="text-xs text-center px-4">This resource doesn't have any fields defined in the left column.</p>
                </div>
              )}
           </div>

           {/* Right Column */}
           <div className="flex-1 p-6">
              {rightColumnFields.length > 0 ? rightColumnFields.map(renderField) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
                   <div className="text-[10px] font-black uppercase tracking-widest mb-2">Column Empty</div>
                   <p className="text-xs text-center px-4">Add fields to this object via Setup to see them here.</p>
                </div>
              )}
           </div>
        </div>
     )
  }

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex flex-col flex-1">
        {renderLayoutDrivenForm()}
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="sticky bottom-0 -mx-8 -mb-8 mt-10 p-5 bg-white/80 dark:bg-void/80 backdrop-blur-md border-t border-gray-200 dark:border-void-lighter flex justify-center gap-3 rounded-b-xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] transition-all">
         <button 
           onClick={() => router.push(`/${resourceName}`)}
           className="px-6 py-2 bg-white dark:bg-void border border-gray-300 dark:border-void-lighter text-gray-700 dark:text-gray-300 text-sm font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-void-lighter transition-all transform active:scale-95 shadow-sm"
         >
           Cancel
         </button>
         <button 
           className="px-6 py-2 bg-white dark:bg-void border border-gray-300 dark:border-void-lighter text-gray-700 dark:text-gray-300 text-sm font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-void-lighter transition-all transform active:scale-95 shadow-sm"
         >
           Save &amp; New
         </button>
         <button 
           onClick={handleSubmit}
           disabled={isSubmitting}
           className="px-8 py-2 bg-aether-blue text-white text-sm font-black rounded-lg hover:bg-[#014486] transition-all disabled:opacity-50 transform active:scale-95 shadow-lg shadow-blue-500/20"
         >
           {isSubmitting ? 'Saving...' : 'Save Record'}
         </button>
      </div>
    </div>
  );
}
