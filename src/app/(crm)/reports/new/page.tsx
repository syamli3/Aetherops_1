'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// import { Database } from '@/lib/database.types';
import { executeReport, saveReport, FilterLogic } from '@/actions/reports';
import { Plus, Trash2, Save, Play } from 'lucide-react';
import { getObjects, getFieldsForObject } from '@/actions/metadata';

// type SFObject = Database['public']['Tables']['sf_objects']['Row'];
// type SFField = Database['public']['Tables']['sf_fields']['Row'];
type SFObject = any;
type SFField = any;

export default function ReportBuilder() {
  const router = useRouter();
  
  // Metadata State
  const [objects, setObjects] = useState<SFObject[]>([]);
  const [availableFields, setAvailableFields] = useState<SFField[]>([]);
  
  // Report Config State
  const [reportName, setReportName] = useState('Untitled Report');
  const [selectedObjectId, setSelectedObjectId] = useState<string>('');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterLogic[]>([]);
  
  // Execution State
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Initial Load: Fetch Objects
  useEffect(() => {
    async function loadMetadata() {
      const objs = await getObjects();
      setObjects(objs || []);
    }
    loadMetadata();
  }, []);

  // 2. Load Fields when Object changes
  useEffect(() => {
    async function loadFields() {
      if (!selectedObjectId) {
        setAvailableFields([]);
        setSelectedColumns([]);
        return;
      }
      const fields = await getFieldsForObject(selectedObjectId);
      setAvailableFields(fields || []);
      // Default to first 3 fields
      if (fields && fields.length > 0) {
        setSelectedColumns(fields.slice(0, 3).map(f => f.field_api_name));
      }
    }
    loadFields();
  }, [selectedObjectId]);

  // 3. Debounced Live Preview Execution
  useEffect(() => {
    if (!selectedObjectId) return;

    const runPreview = async () => {
      setIsLoading(true);
      const data = await executeReport({
        name: reportName,
        object_id: selectedObjectId,
        selected_columns: selectedColumns,
        filters: filters
      });
      setPreviewData(data);
      setIsLoading(false);
    };

    const debounceTimer = setTimeout(runPreview, 500); // 500ms debounce
    return () => clearTimeout(debounceTimer);
  }, [selectedObjectId, selectedColumns, filters]); // Re-run when config changes

  // Handlers
  const handleAddFilter = () => {
    setFilters([...filters, { field: '', operator: 'equals', value: '' }]);
  };

  const handleUpdateFilter = (index: number, key: keyof FilterLogic, value: string) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], [key]: value } as any;
    setFilters(newFilters);
  };

  const handleRemoveFilter = (index: number) => {
    const newFilters = [...filters];
    newFilters.splice(index, 1);
    setFilters(newFilters);
  };

  const handleToggleColumn = (apiName: string) => {
    if (selectedColumns.includes(apiName)) {
      setSelectedColumns(selectedColumns.filter(c => c !== apiName));
    } else {
      setSelectedColumns([...selectedColumns, apiName]);
    }
  };

  const onSave = async () => {
    setIsSaving(true);
    const result = await saveReport({
      name: reportName,
      object_id: selectedObjectId,
      selected_columns: selectedColumns,
      filters: filters
    });
    setIsSaving(false);
    if (result.success) {
      router.push('/home'); // Or to a dedicated /reports list
    } else {
      alert('Failed to save report: ' + result.error);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      
      {/* Left Sidebar: Configuration */}
      <div className="w-[350px] bg-white border-r border-slate-200 flex flex-col h-full shadow-sm z-10">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <input 
            type="text" 
            className="w-full text-lg font-semibold bg-transparent border-none focus:ring-0 placeholder-slate-400 p-0"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            placeholder="Report Name"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Object Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Primary Object</label>
            <select 
              className="w-full text-sm border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              value={selectedObjectId}
              onChange={(e) => setSelectedObjectId(e.target.value)}
            >
              <option value="">Select an Object...</option>
              {objects.map(obj => (
                <option key={obj.id} value={obj.id}>{obj.plural_label}</option>
              ))}
            </select>
          </div>

          {/* Columns Selection */}
          {selectedObjectId && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Columns</label>
              <div className="border border-slate-200 rounded-md bg-slate-50 p-2 max-h-48 overflow-y-auto space-y-1 shadow-inner">
                {availableFields.map(field => (
                  <label key={field.id} className="flex items-center space-x-2 text-sm p-1 hover:bg-white rounded cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedColumns.includes(field.field_api_name)}
                      onChange={() => handleToggleColumn(field.field_api_name)}
                    />
                    <span className="text-slate-700 truncate">{field.field_label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Filters */}
          {selectedObjectId && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filters</label>
                <button onClick={handleAddFilter} className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded">
                  <Plus size={16} />
                </button>
              </div>
              
              <div className="space-y-2">
                {filters.map((filter, index) => (
                  <div key={index} className="p-3 bg-white border border-slate-200 rounded-md shadow-sm space-y-2 relative group">
                    <button 
                      onClick={() => handleRemoveFilter(index)}
                      className="absolute -top-2 -right-2 bg-white text-slate-400 border border-slate-200 rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={12} />
                    </button>

                    <select 
                      className="w-full text-xs border-slate-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      value={filter.field}
                      onChange={(e) => handleUpdateFilter(index, 'field', e.target.value)}
                    >
                      <option value="">Select Field...</option>
                      {availableFields.map(f => (
                        <option key={f.id} value={f.field_api_name}>{f.field_label}</option>
                      ))}
                    </select>

                    <select 
                      className="w-full text-xs border-slate-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      value={filter.operator}
                      onChange={(e) => handleUpdateFilter(index, 'operator', e.target.value)}
                    >
                      <option value="equals">equals</option>
                      <option value="not_equals">not equals</option>
                      <option value="contains">contains</option>
                      <option value="greater_than">greater than</option>
                      <option value="less_than">less than</option>
                    </select>

                    <input 
                      type="text" 
                      className="w-full text-xs border-slate-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Value..."
                      value={filter.value as string}
                      onChange={(e) => handleUpdateFilter(index, 'value', e.target.value)}
                    />
                  </div>
                ))}
                {filters.length === 0 && (
                  <div className="text-xs text-slate-500 italic text-center py-4 bg-slate-50 rounded border border-dashed border-slate-300">
                    No filters applied. Showing all records.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <button 
            onClick={onSave}
            disabled={!selectedObjectId || isSaving}
            className="w-full flex items-center justify-center gap-2 bg-[#0176D3] hover:bg-[#015ba7] text-white px-4 py-2 rounded-md disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-medium text-sm"
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save & Run Report'}
          </button>
        </div>
      </div>

      {/* Main Canvas: Live Preview */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-100">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm z-0">
          <div className="flex items-center gap-3">
             <div className="bg-orange-500 p-2 rounded text-white shadow-sm">
                 <Play size={20} />
             </div>
             <div>
                 <h1 className="text-xl font-bold text-slate-800">Live Preview</h1>
                 <p className="text-xs text-slate-500">Evaluating {previewData.length} total records dynamically.</p>
             </div>
          </div>
          {isLoading && (
            <span className="text-sm font-medium text-blue-600 animate-pulse flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              <span className="h-2 w-2 bg-blue-600 rounded-full animate-ping"></span>
              Translating Query...
            </span>
          )}
        </header>

        <main className="flex-1 overflow-auto p-6">
          {!selectedObjectId ? (
             <div className="h-full flex flex-col items-center justify-center text-slate-400">
                 <div className="bg-white p-8 rounded-full border border-slate-200 border-dashed mb-4 shadow-sm">
                     <Play size={48} className="text-slate-300" />
                 </div>
                 <p className="text-lg font-medium text-slate-600">Select an Object to start building</p>
                 <p className="text-sm">Your live report preview will render here.</p>
             </div>
          ) : previewData.length === 0 ? (
             <div className="h-full flex items-center justify-center">
                 <div className="bg-yellow-50 text-yellow-800 px-4 py-3 rounded-md border border-yellow-200 flex flex-col justify-center items-center shadow-sm w-96 text-center">
                     <p className="font-semibold mb-1">No Records Found</p>
                     <p className="text-sm text-yellow-700">Adjust your filter criteria backwards to widen the search scope.</p>
                 </div>
             </div>
          ) : (
            <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left align-middle border-collapse">
                  <thead className="bg-[#f3f3f3] text-slate-600 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
                    <tr>
                      {selectedColumns.map(col => {
                        const fieldDef = availableFields.find(f => f.field_api_name === col);
                        return (
                          <th key={col} className="px-4 py-3 border-r border-slate-200 last:border-r-0 whitespace-nowrap">
                            {fieldDef?.field_label || col}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {previewData.map((record, idx) => (
                      <tr key={record.id || idx} className="hover:bg-slate-50 transition-colors">
                        {selectedColumns.map(col => {
                          const val = record.record_data?.[col];
                          return (
                            <td key={col} className="px-4 py-3 border-r border-slate-200 last:border-r-0 truncate max-w-[200px] text-slate-700">
                              {val !== undefined && val !== null ? String(val) : <span className="text-slate-400 italic">Empty</span>}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
