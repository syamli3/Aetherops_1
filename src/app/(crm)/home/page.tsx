import Dashboard from '@/components/crm/Dashboard';
import { getCoreMetrics, getRecentRecords } from '@/actions/dashboard';

export default async function HomePage() {
  const metrics = await getCoreMetrics();
  const recent = await getRecentRecords();

  return (
    <div className="bg-white dark:bg-void rounded-xl border border-gray-200 dark:border-void-lighter shadow-sm h-full flex flex-col overflow-hidden transition-all duration-300">
      <div className="p-6 border-b border-gray-100 dark:border-void-lighter">
        <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Overview</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
          Sales Pipeline Dashboard
        </h1>
      </div>
      <div className="p-6 flex-1 bg-[#f3f3f3] dark:bg-void-light overflow-y-auto">
         <Dashboard metrics={metrics} recent={recent} />
      </div>
    </div>
  );
}
