'use client';

import React, { useState, useEffect, useRef } from 'react';
import { searchRecords } from '@/actions/records';
import { Search, X } from 'lucide-react';

export default function LookupSearch({
  targetObjectId,
  value,
  onChange,
}: {
  targetObjectId: string;
  value: string; // The UUID of the selected record
  onChange: (val: string) => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedRecordLabel, setSelectedRecordLabel] = useState<string | null>(null);
  
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Hydrate initial label if `value` exists but no label yet (Could be passed in or fetched)
  useEffect(() => {
    if (value && !selectedRecordLabel) {
       // Ideally, fetch the label for the specific `value` (ID). For now, as a placeholder until we fetch it:
       setSelectedRecordLabel('Selected Record');
    }
  }, [value, selectedRecordLabel]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length >= 2) {
        setIsSearching(true);
        const data = await searchRecords(targetObjectId, searchTerm);
        setResults(data);
        setIsSearching(false);
        setShowDropdown(true);
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, targetObjectId]);

  const handleSelect = (rec: any) => {
     // Naive extraction: usually standard Name or first text field is the identifier
     const label = rec.record_data?.Name || rec.record_data?.Title || 'Unknown';
     setSelectedRecordLabel(label);
     onChange(rec.id);
     setShowDropdown(false);
     setSearchTerm('');
  };

  const handleClear = () => {
     setSelectedRecordLabel(null);
     onChange('');
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
        {selectedRecordLabel && value ? (
          <div className="flex items-center justify-between border border-blue-200 dark:border-blue-900/50 rounded-lg p-2 bg-blue-50 dark:bg-blue-900/20 transition-all shadow-sm">
             <div className="flex items-center gap-2">
                <span className="text-sm text-aether-blue dark:text-blue-400 font-bold ml-1">{selectedRecordLabel}</span>
             </div>
             <button onClick={handleClear} className="text-gray-400 dark:text-gray-500 hover:text-crimson transition-colors pr-1">
                <X size={14} />
             </button>
          </div>
       ) : (
          <div className="relative group">
             <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-aether-blue transition-colors" />
             <input 
               type="text" 
               className="w-full text-sm bg-white dark:bg-void-light border border-gray-200 dark:border-void-lighter rounded-lg py-2 pl-9 pr-3 focus:bg-white dark:focus:bg-void focus:border-aether-blue focus:ring-1 focus:ring-aether-blue focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 text-gray-900 dark:text-gray-100 shadow-sm"
               placeholder="Search related object..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
             />
          </div>
       )}

       {showDropdown && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-void-light border border-gray-200 dark:border-void-lighter rounded-xl shadow-2xl max-h-60 overflow-y-auto z-50 backdrop-blur-xl transition-all animate-in slide-in-from-top-2 duration-200">
             {isSearching ? (
                <div className="p-4 text-xs font-black text-gray-400 dark:text-gray-500 text-center uppercase tracking-widest">Searching...</div>
             ) : (
                <ul className="py-2">
                   {results.map((rec) => {
                      const label = rec.record_data?.Name || rec.record_data?.Title || 'Unknown';
                      return (
                         <li 
                            key={rec.id} 
                            className="px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-void-lighter cursor-pointer border-b border-gray-50 dark:border-void-lighter/50 last:border-none transition-colors"
                            onClick={() => handleSelect(rec)}
                         >
                            <div className="font-bold text-aether-blue dark:text-blue-400 group-hover:underline">{label}</div>
                         </li>
                      );
                   })}
                </ul>
             )}
          </div>
       )}

       {showDropdown && searchTerm.length >= 2 && results.length === 0 && !isSearching && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-void-light border border-gray-200 dark:border-void-lighter rounded-xl shadow-2xl z-50 p-4 text-xs font-black text-center text-gray-400 dark:text-gray-500 uppercase tracking-widest animate-in slide-in-from-top-2">
             No matching records found.
          </div>
       )}
    </div>
  );
}
