'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { globalSearch } from '@/actions/search';

export default function GlobalSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Record<string, any>>({});
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length >= 2) {
        setIsSearching(true);
        const data = await globalSearch(searchTerm);
        setResults(data);
        setIsSearching(false);
        setShowDropdown(true);
      } else {
        setResults({});
        setShowDropdown(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const hasResults = Object.keys(results).length > 0;

  return (
    <div className="flex-1 max-w-2xl mx-8 relative" ref={wrapperRef}>
      <div className="relative group">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-aether-blue transition-colors z-10" />
        <input 
          type="text" 
          placeholder="Search Setup, Apps, and Items..." 
          className="w-full h-8 pl-9 pr-3 bg-gray-100 dark:bg-void border border-transparent dark:border-void-lighter rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-void focus:border-aether-blue focus:ring-1 focus:ring-aether-blue focus:outline-none transition-all placeholder:text-gray-500 relative z-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => { if (searchTerm.length >= 2) setShowDropdown(true); }}
        />
        
        {/* Dropdown Results */}
        {showDropdown && (
          <div className="absolute top-0 pt-10 pb-2 left-0 w-full bg-white dark:bg-void-light border border-gray-200 dark:border-void-lighter rounded-xl shadow-2xl z-0 max-h-[80vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
             {isSearching ? (
                 <div className="p-8 text-center text-sm text-gray-500">Searching all records...</div>
             ) : hasResults ? (
                 Object.values(results).map((group: any) => (
                    <div key={group.api_name} className="mb-4 last:mb-0">
                       <h3 className="px-4 py-1.5 bg-gray-50 dark:bg-void-lighter/30 border-y border-gray-100 dark:border-void-lighter text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                          {group.label}
                       </h3>
                       <ul className="mt-1">
                          {group.items.map((rec: any) => {
                             const label = rec.record_data?.Name || rec.record_data?.Title || rec.record_data?.LastName || 'Unknown Record';
                             const secondary = rec.record_data?.Email || rec.record_data?.Company || rec.record_data?.Phone || '';
                             
                             return (
                                <li key={rec.id}>
                                   <Link 
                                      href={`/${group.api_name.toLowerCase()}/${rec.id}`}
                                      onClick={() => setShowDropdown(false)}
                                      className="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-void-lighter hover:translate-x-1 transition-all group"
                                   >
                                      <div className="text-sm font-semibold text-aether-blue dark:text-blue-400 group-hover:text-[#014486] dark:group-hover:text-blue-300 transition-colors">{label}</div>
                                      {secondary && <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{secondary}</div>}
                                   </Link>
                                </li>
                             );
                          })}
                       </ul>
                    </div>
                 ))
             ) : (
                 <div className="p-8 text-center text-sm text-gray-500">No results found for "{searchTerm}"</div>
             )}
          </div>
        )}
      </div>
    </div>
  );
}
