import React from 'react';
import { getSavedReports } from '@/actions/reports';
import { FileBarChart, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default async function ReportsList() {
  const reports = await getSavedReports();

  return (
    <div className="flex-1 w-full bg-[#f3f3f3] dark:bg-void p-6 h-full font-sans transition-colors duration-300">
      <div className="flex justify-between items-center mb-8 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3 tracking-tight">
            <div className="bg-orange-500 p-2 rounded-lg shadow-lg text-white">
               <FileBarChart size={24} />
            </div>
            Reports
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage and execute your saved analytical queries.</p>
        </div>
        <Link 
            href="/reports/new"
            className="bg-aether-blue hover:bg-[#015ba7] text-white px-5 py-2.5 rounded-lg shadow-sm flex items-center gap-2 text-sm font-bold transition-all transform active:scale-95"
        >
          <Plus size={16} />
          New Report
        </Link>
      </div>

      <div className="bg-white dark:bg-void rounded-xl shadow-sm border border-gray-200 dark:border-void-lighter overflow-hidden max-w-7xl mx-auto transition-all">
        <div className="p-4 border-b border-gray-100 dark:border-void-lighter bg-gray-50 dark:bg-void-light flex items-center justify-between">
            <h2 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Saved Reports</h2>
            <span className="text-[10px] font-bold bg-gray-200 dark:bg-void-lighter text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">{reports.length} Items</span>
        </div>
        
        {reports.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center bg-white dark:bg-void border-dashed border-2 border-gray-100 dark:border-void-lighter m-6 rounded-xl">
            <div className="w-20 h-20 bg-gray-50 dark:bg-void-lighter rounded-full flex items-center justify-center mb-6">
              <FileBarChart size={40} className="text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">No reports found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-md">You haven't created any custom reports yet. Build a new report to query your Salesforce objects dynamically.</p>
            <Link 
              href="/reports/new"
              className="px-6 py-2 border-2 border-aether-blue text-aether-blue dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-void-lighter font-bold rounded-lg text-sm transition-all"
            >
              Build your first Report
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50 dark:divide-void-lighter">
            {reports.map((report: any) => (
              <li key={report.id} className="hover:bg-gray-50/80 dark:hover:bg-void-lighter/50 transition-all group">
                <Link href={`/reports/${report.id}`} className="flex items-center justify-between p-5">
                  <div>
                    <h3 className="text-sm font-bold text-aether-blue dark:text-blue-400 group-hover:underline underline-offset-4">{report.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Object: <span className="font-bold text-gray-700 dark:text-gray-300">{report.sf_objects?.label || 'Unknown'}</span></p>
                  </div>
                  <ArrowRight size={16} className="text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
