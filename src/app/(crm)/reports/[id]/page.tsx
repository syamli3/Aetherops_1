import { executeReport } from '@/actions/reports';
import { createClient } from '@/utils/supabase/server';
import { FileBarChart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function ReportViewer({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  // 1. Fetch Report Metadata
  const supabaseSession = await createClient();
  const { data: report, error } = await supabaseSession
    .from('sf_reports' as any)
    .select('*, sf_objects(*)')
    .eq('id', id)
    .single();

  if (error || !report) {
    return <div className="p-12 text-center text-slate-500">Report not found or access denied.</div>;
  }

  // 2. Execute dynamic query mapping
  const results = await executeReport(report as any);

  // 3. Field labels for headers
  const { data: fields } = await supabaseSession
    .from('sf_fields' as any)
    .select('field_api_name, field_label')
    .eq('object_id', report.object_id);

  const fieldMap = (fields || []).reduce((acc: any, f: any) => {
    acc[f.field_api_name] = f.field_label;
    return acc;
  }, {});

  return (
    <div className="flex-1 w-full bg-[#f3f3f3] p-6 h-full font-sans flex flex-col">
      <div className="mb-6 max-w-7xl mx-auto w-full">
        <Link href="/reports" className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium mb-4 w-fit">
          <ArrowLeft size={16} /> Back to Reports
        </Link>
        <div className="flex items-center justify-between">
           <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <FileBarChart size={24} className="text-[#0176D3]" />
                {report.name}
              </h1>
              <p className="text-sm text-slate-500 mt-1">Object: <span className="font-semibold text-slate-700">{report.sf_objects?.plural_label}</span> • <span className="text-[#0176D3]">{results.length}</span> Records</p>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden max-w-7xl mx-auto w-full flex-1 flex flex-col">
        {results.length === 0 ? (
          <div className="p-12 flex-1 flex flex-col items-center justify-center text-center">
            <div className="bg-slate-50 p-6 rounded-full border border-slate-200 mb-4">
               <FileBarChart size={48} className="text-slate-300" />
            </div>
            <p className="text-lg font-medium text-slate-600">No records matched the filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
             <table className="w-full text-sm text-left align-middle border-collapse">
               <thead className="bg-[#f3f3f3] text-slate-600 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider sticky top-0 z-10 shadow-sm">
                 <tr>
                   {report.selected_columns.map((col: string) => (
                     <th key={col} className="px-4 py-3 border-r border-slate-200 last:border-r-0 whitespace-nowrap bg-[#f9f9f9]">
                       {fieldMap[col] || col}
                     </th>
                   ))}
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-200 bg-white">
                 {results.map((record: any, idx: number) => (
                   <tr key={record.id || idx} className="hover:bg-blue-50 transition-colors">
                     {report.selected_columns.map((col: string) => {
                       const val = record.record_data?.[col];
                       return (
                         <td key={col} className="px-4 py-3 border-r border-slate-200 last:border-r-0 truncate max-w-[200px] text-slate-700">
                           {val !== undefined && val !== null ? String(val) : <span className="text-slate-400 italic font-light">Empty</span>}
                         </td>
                       );
                     })}
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        )}
      </div>
    </div>
  );
}
