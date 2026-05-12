'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Papa from 'papaparse';
import { getObjects, getFieldsForObject } from '@/actions/metadata';
import { bulkImportRecords } from '@/actions/import';
import { FileUp, Database, ArrowRight, CheckCircle2, ChevronLeft, AlertCircle, Loader2 } from 'lucide-react';

type Step = 'select' | 'map' | 'preview' | 'importing' | 'complete';

export default function DataImporter() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('select');
  
  // Metadata
  const [objects, setObjects] = useState<any[]>([]);
  const [selectedObjectId, setSelectedObjectId] = useState<string>('');
  const [fields, setFields] = useState<any[]>([]);
  
  // File State
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  
  // Mapping State: CSV Header -> sf_field_api_name
  const [mapping, setMapping] = useState<Record<string, string>>({});
  
  // Status
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; count?: number; error?: string } | null>(null);

  useEffect(() => {
    async function init() {
      const allObjects = await getObjects();
      setObjects(allObjects);
    }
    init();
  }, []);

  useEffect(() => {
    if (selectedObjectId) {
      async function fetchFields() {
        const objectFields = await getFieldsForObject(selectedObjectId);
        setFields(objectFields);
      }
      fetchFields();
    }
  }, [selectedObjectId]);

  // --- Step 1: Selection ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setIsProcessing(true);
      
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setCsvData(results.data);
          if (results.meta.fields) {
            setCsvHeaders(results.meta.fields);
            
            // Auto-map based on exact name match
            const initialMapping: Record<string, string> = {};
            results.meta.fields.forEach(header => {
              const matchedField = fields.find(f => 
                f.field_label.toLowerCase() === header.toLowerCase() || 
                f.field_api_name.toLowerCase() === header.toLowerCase()
              );
              if (matchedField) {
                initialMapping[header] = matchedField.field_api_name;
              }
            });
            setMapping(initialMapping);
          }
          setIsProcessing(false);
          setStep('map');
        }
      });
    }
  };

  // --- Step 2: Mapping ---
  const handleMappingChange = (csvHeader: string, fieldApiName: string) => {
    setMapping(prev => ({
      ...prev,
      [csvHeader]: fieldApiName
    }));
  };

  const handleNextToPreview = () => setStep('preview');

  // --- Step 3: Transformation & Upload ---
  const executeImport = async () => {
    setStep('importing');
    
    // Transform Data with Strict Type Coercion
    const transformedRecords = csvData.map(row => {
      const record: Record<string, any> = {};
      
      Object.entries(mapping).forEach(([csvHeader, fieldApiName]) => {
        const rawValue = row[csvHeader];
        const fieldDef = fields.find(f => f.field_api_name === fieldApiName);
        
        if (!fieldDef) return;

        // Perform Coercion
        if (fieldDef.data_type === 'Number' || fieldDef.data_type === 'Currency') {
          record[fieldApiName] = rawValue ? Number(rawValue.replace(/[^0-9.-]+/g, "")) : 0;
        } else if (fieldDef.data_type === 'Checkbox' || fieldDef.data_type === 'Boolean') {
          const lowerVal = String(rawValue).toLowerCase();
          record[fieldApiName] = lowerVal === 'true' || lowerVal === 'yes' || lowerVal === '1';
        } else {
          record[fieldApiName] = rawValue;
        }
      });
      
      return record;
    });

    const selectedObj = objects.find(o => o.id === selectedObjectId);
    const result = await bulkImportRecords(selectedObjectId, transformedRecords, selectedObj.plural_label.toLowerCase());
    
    setImportResult(result);
    setStep('complete');
  };

  // --- UI Renderers ---
  return (
    <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden max-w-4xl w-full">
      {/* Wizard Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-[#0176D3] rounded-lg flex items-center justify-center text-white">
                <FileUp size={24} />
             </div>
             <div>
                <h1 className="text-xl font-bold text-gray-900">Data Import Wizard</h1>
                <p className="text-sm text-gray-500">Bulk upload records from CSV</p>
             </div>
          </div>
          
          <div className="flex items-center gap-2">
             {[
               { id: 'select', label: 'Select' },
               { id: 'map', label: 'Map' },
               { id: 'preview', label: 'Review' }
             ].map((s, idx) => (
               <React.Fragment key={s.id}>
                 <div className={`flex items-center gap-2 ${
                   (idx === 0 && step === 'select') || 
                   (idx === 1 && step === 'map') || 
                   (idx === 2 && step === 'preview') ||
                   (step === 'importing' || step === 'complete') 
                   ? 'text-[#0176D3]' : 'text-gray-400'
                 }`}>
                   <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                     (idx === 0 && step === 'select') || 
                     (idx === 1 && step === 'map') || 
                     (idx === 2 && step === 'preview') ||
                     (step === 'importing' || step === 'complete')
                     ? 'border-[#0176D3] bg-blue-50' : 'border-gray-300'
                   }`}>
                     {idx + 1}
                   </div>
                   <span className="text-xs font-semibold uppercase tracking-wider">{s.label}</span>
                 </div>
                 {idx < 2 && <div className="w-8 h-px bg-gray-300 mx-2" />}
               </React.Fragment>
             ))}
          </div>
        </div>

        {step === 'select' && (
          <div className="space-y-6">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">1. Select Target Object</label>
                  <select 
                    className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-[#0176D3] focus:border-[#0176D3]"
                    value={selectedObjectId}
                    onChange={(e) => setSelectedObjectId(e.target.value)}
                  >
                    <option value="">-- Select Object --</option>
                    {objects.map(obj => (
                      <option key={obj.id} value={obj.id}>{obj.label} ({obj.api_name})</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">2. Upload CSV File</label>
                  <div className={`relative border-2 border-dashed rounded-lg p-8 transition-colors ${
                    !selectedObjectId ? 'bg-gray-100 border-gray-300 opacity-50 cursor-not-allowed' : 'border-[#0176D3] hover:bg-blue-50 cursor-pointer'
                  }`}>
                    <input 
                      type="file" 
                      accept=".csv"
                      className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      onChange={handleFileChange}
                      disabled={!selectedObjectId || isProcessing}
                    />
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileUp size={32} className={selectedObjectId ? 'text-[#0176D3]' : 'text-gray-400'} />
                      <span className="text-sm font-medium text-gray-600">
                        {isProcessing ? 'Parsing File...' : 'Drop CSV here or click to upload'}
                      </span>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        )}

        {step === 'map' && (
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-700 uppercase">Map CSV Headers</h2>
                <button 
                  onClick={handleNextToPreview}
                  className="bg-[#0176D3] text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 hover:bg-[#014486]"
                >
                  Review Mapping <ArrowRight size={16} />
                </button>
             </div>
             
             <div className="bg-white border border-gray-200 rounded overflow-hidden">
                <table className="w-full text-sm">
                   <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                         <th className="px-4 py-2 text-left text-gray-600 font-bold">CSV Header</th>
                         <th className="px-4 py-2 text-center text-gray-600 font-bold w-12 text-xl">→</th>
                         <th className="px-4 py-2 text-left text-gray-600 font-bold">AetherOps Field</th>
                      </tr>
                   </thead>
                   <tbody>
                      {csvHeaders.map(header => (
                        <tr key={header} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                           <td className="px-4 py-3 font-medium text-gray-900">{header}</td>
                           <td className="px-4 py-3 text-center text-gray-400 font-bold">→</td>
                           <td className="px-4 py-3">
                              <select 
                                className="w-full border border-gray-300 rounded p-1.5 text-xs bg-white"
                                value={mapping[header] || ''}
                                onChange={(e) => handleMappingChange(header, e.target.value)}
                              >
                                 <option value="">(Ignore Column)</option>
                                 {fields.map(field => (
                                   <option key={field.id} value={field.field_api_name}>
                                     {field.field_label} ({field.field_api_name})
                                   </option>
                                 ))}
                              </select>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-6">
             <div className="bg-blue-50 border border-blue-200 rounded p-4 flex items-start gap-3">
                <AlertCircle className="text-blue-600 mt-1" size={20} />
                <div>
                   <h3 className="text-sm font-bold text-blue-900 uppercase">Import Preview</h3>
                   <p className="text-xs text-blue-700 mt-1">
                     You are about to import <strong>{csvData.length} records</strong> into <strong>{objects.find(o => o.id === selectedObjectId)?.label}</strong>. 
                     Fields will be automatically typed (Numbers and Checkboxes coerced).
                   </p>
                </div>
             </div>

             <div className="bg-white border border-gray-200 rounded overflow-x-auto">
                <table className="w-full text-[10px] text-left">
                   <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                         {Object.values(mapping).filter(v => !!v).map(fieldApi => (
                           <th key={fieldApi} className="px-2 py-1.5 border-r border-gray-200 font-bold text-gray-500">{fieldApi}</th>
                         ))}
                      </tr>
                   </thead>
                   <tbody>
                      {csvData.slice(0, 5).map((row, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                           {Object.entries(mapping).filter(([h, f]) => !!f).map(([header, fieldApi]) => (
                             <td key={fieldApi} className="px-2 py-1 border-r border-gray-100 text-gray-600 truncate max-w-[100px]">
                               {row[header]}
                             </td>
                           ))}
                        </tr>
                      ))}
                   </tbody>
                </table>
                <div className="p-2 bg-gray-50 text-[10px] text-gray-400 italic text-center">
                  Showing first 5 rows of {csvData.length} total.
                </div>
             </div>

             <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setStep('map')}
                  className="px-4 py-2 border border-gray-300 rounded text-sm font-bold text-gray-600 hover:bg-gray-100"
                >
                  Back to Mapping
                </button>
                <button 
                  onClick={executeImport}
                  className="bg-[#0176D3] text-white px-6 py-2 rounded text-sm font-bold flex items-center gap-2 hover:bg-[#014486]"
                >
                  Execute Import <ArrowRight size={16} />
                </button>
             </div>
          </div>
        )}

        {step === 'importing' && (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
             <Loader2 className="text-[#0176D3] animate-spin" size={48} />
             <h2 className="text-lg font-bold text-gray-900">Uploading Records...</h2>
             <p className="text-sm text-gray-500 italic">Processing {csvData.length} entries. Please do not refresh.</p>
          </div>
        )}

        {step === 'complete' && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
             {importResult?.success ? (
               <>
                 <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4 scale-animation">
                    <CheckCircle2 size={48} />
                 </div>
                 <div>
                    <h2 className="text-2xl font-bold text-gray-900">Import Successful!</h2>
                    <p className="text-gray-600 mt-2">Successfully loaded <strong>{importResult.count}</strong> records.</p>
                 </div>
                 <div className="flex gap-4">
                   <button 
                     onClick={() => {
                        const obj = objects.find(o => o.id === selectedObjectId);
                        router.push(`/${obj.plural_label.toLowerCase()}`);
                     }}
                     className="bg-[#0176D3] text-white px-6 py-2 rounded text-sm font-bold hover:bg-[#014486] transition-colors"
                   >
                     View Records
                   </button>
                   <button 
                     onClick={() => window.location.reload()}
                     className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded text-sm font-bold hover:bg-gray-50 transition-colors"
                   >
                     Import More
                   </button>
                 </div>
               </>
             ) : (
               <>
                 <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4">
                    <AlertCircle size={48} />
                 </div>
                 <div>
                    <h2 className="text-2xl font-bold text-gray-900">Import Failed</h2>
                    <p className="text-red-600 mt-2">{importResult?.error || 'Unknown error occurred during bulk insert.'}</p>
                 </div>
                 <button 
                   onClick={() => setStep('preview')}
                   className="bg-[#0176D3] text-white px-6 py-2 rounded text-sm font-bold hover:bg-[#014486]"
                 >
                   Try Again
                 </button>
               </>
             )}
          </div>
        )}
      </div>
      
      <style jsx>{`
        .scale-animation {
          animation: scaleIn 0.5s ease-out;
        }
        @keyframes scaleIn {
          0% { transform: scale(0); }
          80% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
