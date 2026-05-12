'use client';

import React from 'react';
import Link from 'next/link';

export default function Dashboard({ 
  metrics, 
  recent 
}: { 
  metrics: { label: string; count: number }[],
  recent: { id: string; name: string; objectLabel: string; apiName: string; createdAt: string }[]
}) {
  const [mounted, setMounted] = React.useState(false);
  const [isCustomizing, setIsCustomizing] = React.useState(false);
  const [config, setConfig] = React.useState<any>({
    showMetrics: true,
    showRecent: true
  });

  React.useEffect(() => {
    setMounted(true);
    const loadConfig = async () => {
       const { getUserPreferences } = await import('@/actions/user');
       const prefs: any = await getUserPreferences();
       if (prefs && prefs.dashboard_config) {
          setConfig(prefs.dashboard_config);
       }
    };
    loadConfig();
  }, []);

  const toggleWidget = async (key: string) => {
     const newConfig = { ...config, [key]: !config[key] };
     setConfig(newConfig);
     const { updateUserPreferences } = await import('@/actions/user');
     await updateUserPreferences({ dashboard_config: newConfig });
  };

  return (
    <div className="w-full flex flex-col gap-8 relative">
      
      {/* Customization Trigger */}
      <div className="absolute top-[-55px] right-0 flex items-center gap-2">
         <button 
           onClick={() => setIsCustomizing(!isCustomizing)}
           className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
             isCustomizing 
               ? 'bg-crimson text-white shadow-lg' 
               : 'bg-white dark:bg-void border border-gray-200 dark:border-void-lighter text-gray-600 dark:text-gray-400 hover:border-aether-blue'
           }`}
         >
           <span className={`w-2 h-2 rounded-full ${isCustomizing ? 'bg-white animate-pulse' : 'bg-gray-300 dark:bg-gray-600'}`}></span>
           {isCustomizing ? 'Finish Customizing' : 'Customize Dashboard'}
         </button>
      </div>

      {/* Top Row: Metric Cards */}
      {(config.showMetrics || isCustomizing) && (
        <div className={`transition-all duration-500 ${!config.showMetrics && isCustomizing ? 'opacity-40 grayscale' : 'opacity-100'}`}>
          <div className="flex items-center justify-between mb-4 mt-[-10px]">
             <h2 className="text-lg text-gray-800 dark:text-gray-200 font-bold tracking-tight">System Metrics</h2>
             {isCustomizing && (
                <button 
                  onClick={() => toggleWidget('showMetrics')}
                  className={`px-2 py-1 rounded text-[10px] font-black uppercase transition-all ${
                    config.showMetrics ? 'bg-crimson text-white' : 'bg-green-600 text-white'
                  }`}
                >
                  {config.showMetrics ? 'Hide' : 'Show'}
                </button>
             )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             {metrics.length === 0 ? (
                <div className="text-sm text-gray-500 italic p-6 bg-white dark:bg-void rounded-xl border border-gray-200 dark:border-void-lighter">No data found in system.</div>
             ) : (
                metrics.map((m) => (
                  <div key={m.label} className="bg-white dark:bg-void border border-gray-200 dark:border-void-lighter rounded-xl p-6 shadow-sm flex flex-col items-center justify-center h-32 hover:shadow-lg dark:hover:border-aether-blue/50 transition-all group">
                     <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">{m.label}</div>
                     <div className="text-4xl font-black text-aether-blue dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">{m.count}</div>
                  </div>
                ))
             )}
          </div>
        </div>
      )}

      {/* Bottom Row: Recent Activity Table */}
      {(config.showRecent || isCustomizing) && (
        <div className={`transition-all duration-500 ${!config.showRecent && isCustomizing ? 'opacity-40 grayscale' : 'opacity-100'}`}>
          <div className="flex items-center justify-between mt-4 mb-4">
             <h2 className="text-lg text-gray-800 dark:text-gray-200 font-bold tracking-tight">Recent Global Activity</h2>
             {isCustomizing && (
                <button 
                  onClick={() => toggleWidget('showRecent')}
                  className={`px-2 py-1 rounded text-[10px] font-black uppercase transition-all ${
                    config.showRecent ? 'bg-crimson text-white' : 'bg-green-600 text-white'
                  }`}
                >
                  {config.showRecent ? 'Hide' : 'Show'}
                </button>
             )}
          </div>
          <div className="bg-white dark:bg-void border border-gray-200 dark:border-void-lighter rounded-xl shadow-sm overflow-hidden transition-all duration-300">
             {recent.length === 0 ? (
                <div className="p-12 text-center text-sm text-gray-500">No recent activity found.</div>
             ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100 dark:divide-void-lighter">
                    <thead className="bg-[#f3f3f3] dark:bg-void-light border-b border-gray-200 dark:border-void-lighter">
                       <tr>
                          <th scope="col" className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Record Name</th>
                          <th scope="col" className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Object Type</th>
                          <th scope="col" className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Created At</th>
                       </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-void divide-y divide-gray-50 dark:divide-void-lighter">
                       {recent.map((record) => (
                          <tr key={record.id} className="hover:bg-gray-50/80 dark:hover:bg-void-lighter/50 transition-colors group">
                             <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                                <Link 
                                  href={`/${record.apiName}/${record.id}`}
                                  className="text-aether-blue dark:text-blue-400 hover:text-[#014486] dark:hover:text-blue-300 underline-offset-4 hover:underline"
                                >
                                  {record.name}
                                </Link>
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                <span className="bg-gray-100 dark:bg-void-lighter text-gray-700 dark:text-gray-300 px-2 py-1 rounded-md text-[11px] font-bold border border-gray-200 dark:border-void-lighter">
                                  {record.objectLabel}
                                </span>
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono text-xs">
                                {mounted ? new Date(record.createdAt).toLocaleString(config.locale || undefined, { 
                                   month: 'short', day: 'numeric', year: 'numeric', 
                                   hour: 'numeric', minute: '2-digit' 
                                }) : '—'}
                             </td>
                          </tr>
                       ))}
                    </tbody>
                  </table>
                </div>
             )}
          </div>
        </div>
      )}

    </div>
  );
}
