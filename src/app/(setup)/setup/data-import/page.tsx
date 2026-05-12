import React from 'react';
import DataImporter from '@/components/crm/DataImporter';
import { Database } from 'lucide-react';

export default function DataImportPage() {
  return (
    <div className="flex flex-col items-center py-10 space-y-6">
      <div className="max-w-4xl w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-[#0176D3] rounded flex items-center justify-center text-white shadow-lg">
            <Database size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">Data Management</h1>
            <p className="text-gray-500 text-sm">Import records via CSV mapping and transformation.</p>
          </div>
        </div>
        
        <DataImporter />
      </div>
    </div>
  );
}
