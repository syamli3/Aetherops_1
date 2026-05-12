"use client";

import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
} from "recharts";
import { Target, Download, Filter, BarChart2, LineChart as LineChartIcon, PieChart as PieChartIcon } from "lucide-react";

interface Metric {
  label: string;
  value: number;
}

interface StatusCount {
  status: string;
  count: number;
}

const COLORS = ['#3b82f6', '#a855f7', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

export default function AnalyticsDashboardPage() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [statusCounts, setStatusCounts] = useState<StatusCount[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Advanced Reporting State
  const [rawRecords, setRawRecords] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState('All Time'); // All Time, Last 7 Days, Last 30 Days
  const [statusFilter, setStatusFilter] = useState('All');
  const [chartType, setChartType] = useState<'Bar' | 'Line' | 'Pie'>('Bar');

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: leadObj } = await supabase.from('sf_objects').select('id').eq('api_name','Lead').single();
        if (leadObj) {
          const { data: leadRecords } = await supabase.from('sf_records')
            .select('*')
            .eq('object_id', (leadObj as any).id)
            .order('created_at', { ascending: false });
            
          setRawRecords(leadRecords || []);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Compute derived data whenever filters or raw data changes
  useMemo(() => {
    if (!rawRecords.length) return;

    // 1. Apply Filters
    let filtered = [...rawRecords];
    
    // Status Filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(r => r.record_data?.status === statusFilter);
    }
    
    // Date Filter
    if (dateRange !== 'All Time') {
      const now = new Date();
      const cutoff = new Date();
      if (dateRange === 'Last 7 Days') cutoff.setDate(now.getDate() - 7);
      if (dateRange === 'Last 30 Days') cutoff.setDate(now.getDate() - 30);
      filtered = filtered.filter(r => new Date(r.created_at) >= cutoff);
    }

    // 2. Compute Metrics (Total Leads, Total Pipeline Value)
    const totalPipeline = filtered.reduce((acc: number, r: any) => {
       const v = r.record_data?.estimated_value;
       if (v === null || v === undefined || isNaN(Number(v))) return acc + 0;
       return acc + Number(v);
    }, 0);

    setMetrics([
      { label: 'Total Leads', value: filtered.length },
      { label: 'Total Pipeline Value', value: totalPipeline }
    ]);

    // 3. Compute Chart Data
    const counts: Record<string, number> = {};
    filtered.forEach((r: any) => {
       const status = r.record_data?.status || "New";
       counts[status] = (counts[status] || 0) + 1;
    });

    const formattedCounts = Object.entries(counts).map(([status, count]) => ({
       status, count
    }));
    setStatusCounts(formattedCounts);

  }, [rawRecords, dateRange, statusFilter]);

  // CSV Export Engine
  const handleExportCSV = () => {
    if (!rawRecords || rawRecords.length === 0) return;
    
    // Get headers dynamically from all record_data keys
    const allKeys = new Set<string>();
    rawRecords.forEach(r => {
      Object.keys(r.record_data || {}).forEach(k => allKeys.add(k));
    });
    allKeys.add('created_at');
    
    const headers = Array.from(allKeys);
    
    // Build CSV string
    const csvRows = [];
    csvRows.push(headers.join(',')); // Header row
    
    rawRecords.forEach(r => {
      const values = headers.map(header => {
        if (header === 'created_at') return `"${r.created_at}"`;
        const val = r.record_data?.[header];
        const stringVal = Object.prototype.toString.call(val) === '[object String]' ? val.replace(/"/g, '""') : val;
        return `"${stringVal || ''}"`;
      });
      csvRows.push(values.join(','));
    });
    
    const csvString = csvRows.join('\\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AetherOps_Export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-neutral-900 border border-white/10 p-4 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-md">
          <p className="text-white/80 font-medium mb-1">{label}</p>
          <p className="text-blue-400 font-bold text-lg">{payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[0%] left-[0%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[150px] mix-blend-screen" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto h-full flex flex-col">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-light tracking-tight text-white/90 mb-2">
              Advanced <span className="font-semibold text-white">Analytics</span>
            </h1>
            <p className="text-neutral-400">Dynamic reporting, filtering, and data extraction.</p>
          </div>
          
          {/* Advanced Reporting Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-1 backdrop-blur-md">
               <Filter className="w-4 h-4 text-white/50 ml-2 mr-1" />
               <select 
                 className="bg-transparent text-sm text-white/90 focus:outline-none border-none py-1.5 pl-1 pr-6 cursor-pointer appearance-none"
                 value={dateRange}
                 onChange={(e) => setDateRange(e.target.value)}
               >
                 <option value="All Time" className="bg-neutral-900">All Time</option>
                 <option value="Last 30 Days" className="bg-neutral-900">Last 30 Days</option>
                 <option value="Last 7 Days" className="bg-neutral-900">Last 7 Days</option>
               </select>
            </div>
            
            <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-1 backdrop-blur-md">
               <select 
                 className="bg-transparent text-sm text-white/90 focus:outline-none border-none py-1.5 pl-3 pr-6 cursor-pointer appearance-none"
                 value={statusFilter}
                 onChange={(e) => setStatusFilter(e.target.value)}
               >
                 <option value="All" className="bg-neutral-900">All Statuses</option>
                 <option value="New" className="bg-neutral-900">New</option>
                 <option value="Contacted" className="bg-neutral-900">Contacted</option>
                 <option value="Qualified" className="bg-neutral-900">Qualified</option>
                 <option value="Converted" className="bg-neutral-900">Converted</option>
               </select>
            </div>

            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-500/20 hover:border-blue-500/50 transition-all"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center min-h-[500px]">
             <div className="w-8 h-8 border-4 border-white/10 border-t-white/60 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metrics.map((metric, i) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className="text-neutral-400 text-sm font-medium tracking-wide uppercase mb-3 relative z-10">{metric.label}</p>
                  <p className="text-4xl font-semibold text-white tracking-tight relative z-10">
                    {metric.label.toLowerCase().includes('spend') || metric.label.toLowerCase().includes('value') ? '$' : ''}
                    {metric.value.toLocaleString()}
                  </p>
                </motion.div>
              ))}
              
              {metrics.length === 0 && (
                <div className="col-span-full py-10 text-center border-2 border-dashed border-white/5 rounded-2xl">
                   <p className="text-neutral-500">No data found matching your query.</p>
                </div>
              )}
            </div>

            {/* Dynamic Recharts Chart Area */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-semibold text-white/90 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  Lead Volume by Status
                </h2>
                
                {/* Chart Toggles */}
                <div className="flex items-center bg-black/20 rounded-lg p-1 border border-white/5">
                   <button onClick={() => setChartType('Bar')} className={`p-1.5 rounded-md transition-all ${chartType === 'Bar' ? 'bg-white/10 text-white shadow' : 'text-white/40 hover:text-white/70'}`}>
                     <BarChart2 className="w-4 h-4" />
                   </button>
                   <button onClick={() => setChartType('Line')} className={`p-1.5 rounded-md transition-all ${chartType === 'Line' ? 'bg-white/10 text-white shadow' : 'text-white/40 hover:text-white/70'}`}>
                     <LineChartIcon className="w-4 h-4" />
                   </button>
                   <button onClick={() => setChartType('Pie')} className={`p-1.5 rounded-md transition-all ${chartType === 'Pie' ? 'bg-white/10 text-white shadow' : 'text-white/40 hover:text-white/70'}`}>
                     <PieChartIcon className="w-4 h-4" />
                   </button>
                </div>
              </div>

              <div className="h-[400px] w-full">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={chartType}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="h-full w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      {chartType === 'Bar' ? (
                        <BarChart data={statusCounts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorStatus" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#a855f7" stopOpacity={0.8}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="status" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 13 }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 13 }} />
                          <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                          <Bar dataKey="count" fill="url(#colorStatus)" radius={[6, 6, 0, 0]} barSize={40} />
                        </BarChart>
                      ) : chartType === 'Line' ? (
                        <LineChart data={statusCounts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="status" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 13 }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 13 }} />
                          <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                          <Line type="monotone" dataKey="count" stroke="#a855f7" strokeWidth={3} dot={{ r: 6, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 8, fill: '#fff' }} />
                        </LineChart>
                      ) : (
                        <PieChart>
                          <Pie
                            data={statusCounts}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={120}
                            paddingAngle={5}
                            dataKey="count"
                            nameKey="status"
                            stroke="none"
                          >
                            {statusCounts.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip content={<CustomTooltip />} />
                        </PieChart>
                      )}
                    </ResponsiveContainer>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
