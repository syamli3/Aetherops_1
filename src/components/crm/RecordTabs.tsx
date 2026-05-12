'use client';

import React, { useState } from 'react';

export default function RecordTabs({
  detailsContent,
  relatedContent,
}: {
  detailsContent: React.ReactNode;
  relatedContent: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<'details' | 'related'>('details');

  return (
    <div className="w-full lg:w-[70%] bg-white dark:bg-void-light rounded-xl shadow-sm border border-gray-200 dark:border-void-lighter flex flex-col transition-all">
       <div className="p-4 border-b border-gray-100 dark:border-void-lighter flex gap-6 bg-gray-50 dark:bg-void-light/50 transition-colors">
          <button 
             onClick={() => setActiveTab('details')}
             className={`text-[11px] font-bold uppercase tracking-widest pb-1 transition-all ${activeTab === 'details' ? 'text-aether-blue border-b-2 border-aether-blue' : 'text-gray-400 dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
          >
             Details
          </button>
          <button 
             onClick={() => setActiveTab('related')}
             className={`text-[11px] font-bold uppercase tracking-widest pb-1 transition-all ${activeTab === 'related' ? 'text-aether-blue border-b-2 border-aether-blue' : 'text-gray-400 dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
          >
             Related
          </button>
       </div>
       <div className="p-8">
          {activeTab === 'details' ? detailsContent : relatedContent}
       </div>
    </div>
  );
}
