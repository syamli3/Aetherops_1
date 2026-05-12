"use client";

import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

// Define the shape of our Lead data inside sf_records
interface LeadData {
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  intent: string | null;
  estimated_value: string | null;
  status: string;
  source?: string;
}

interface LeadRecord {
  id: string;
  created_at: string;
  record_data: LeadData;
}

const COLUMNS = [
  { id: "New", label: "New Leads", color: "blue" },
  { id: "In Progress", label: "In Progress", color: "purple" },
  { id: "Negotiation", label: "Negotiation", color: "yellow" },
  { id: "Closed", label: "Closed", color: "green" },
];

const colorMap: Record<string, { border: string; glow: string; badgeText: string; badgeBg: string }> = {
  blue: {
    border: "border-blue-500/30",
    glow: "shadow-[0_0_20px_rgba(59,130,246,0.15)]",
    badgeText: "text-blue-400",
    badgeBg: "bg-blue-500/10",
  },
  purple: {
    border: "border-purple-500/30",
    glow: "shadow-[0_0_20px_rgba(168,85,247,0.15)]",
    badgeText: "text-purple-400",
    badgeBg: "bg-purple-500/10",
  },
  yellow: {
    border: "border-yellow-500/30",
    glow: "shadow-[0_0_20px_rgba(234,179,8,0.15)]",
    badgeText: "text-yellow-400",
    badgeBg: "bg-yellow-500/10",
  },
  green: {
    border: "border-green-500/30",
    glow: "shadow-[0_0_20px_rgba(34,197,94,0.15)]",
    badgeText: "text-green-400",
    badgeBg: "bg-green-500/10",
  },
};

export default function LeadPipelinePage() {
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [intentFilter, setIntentFilter] = useState("All Intents");

  const [selectedDraftLeadId, setSelectedDraftLeadId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState<string | null>(null);
  const [draftLoading, setDraftLoading] = useState(false);

  useEffect(() => {
    async function fetchLeads() {
      try {
        const { data: leadObject } = await supabase.from("sf_objects").select("id").eq("api_name", "Lead").single();

        if (!leadObject) {
          setLeads([]);
          setLoading(false);
          return;
        }

        const { data: records } = await supabase.from("sf_records").select("*").eq("object_id", (leadObject as any).id).order("created_at", { ascending: false });

        if (records) {
          const typedRecords = records.map((r: any) => ({
            id: r.id,
            created_at: r.created_at,
            record_data: r.record_data as LeadData,
          }));
          setLeads(typedRecords);
        }
      } catch (err) {
        console.error("Failed to fetch leads", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeads();
  }, []);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const data = lead.record_data;
      const query = searchQuery.toLowerCase();
      const matchesSearch = query === "" || (data.first_name || "").toLowerCase().includes(query) || (data.last_name || "").toLowerCase().includes(query) || (data.email || "").toLowerCase().includes(query);
      const matchesIntent = intentFilter === "All Intents" || (data.intent || "").toLowerCase().includes(intentFilter.replace(" Intent", "").toLowerCase()) || (data.intent || "") === intentFilter;
      return matchesSearch && matchesIntent;
    });
  }, [leads, searchQuery, intentFilter]);

  const groupedLeads = COLUMNS.reduce((acc, col) => {
    acc[col.id] = filteredLeads.filter((l) => {
      const status = l.record_data.status || "New";
      if (col.id === "New" && !COLUMNS.map((c) => c.id).includes(status)) return true;
      return status === col.id;
    });
    return acc;
  }, {} as Record<string, LeadRecord[]>);

  const handleViewDraft = async (e: React.MouseEvent, leadId: string) => {
    e.stopPropagation();
    setSelectedDraftLeadId(leadId);
    setDraftLoading(true);
    setDraftText(null);
    try {
      const { data: draftObj } = await supabase.from('sf_objects').select('id').eq('api_name', 'OutreachDraft').single();
      if (!draftObj) { setDraftText('No draft template found.'); return; }
      const { data: records } = await supabase.from('sf_records').select('*').eq('object_id', (draftObj as any).id);
      const match = records?.find(r => r.record_data.lead_id === leadId);
      if (match) {
        setDraftText(match.record_data.draft_text);
      } else {
        setDraftText('No AI draft has been generated for this lead yet.');
      }
    } catch(err) {
      setDraftText('Error fetching draft.');
    } finally {
      setDraftLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-900/10 rounded-full blur-[150px] mix-blend-screen" />
        <div className="absolute top-[30%] left-[50%] w-[40%] h-[40%] bg-emerald-900/10 rounded-full blur-[100px] mix-blend-screen" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto h-full flex flex-col">
        <div className="mb-8">
          <h1 className="text-4xl font-light tracking-tight text-white/90 mb-2">
            Lead <span className="font-semibold text-white">Pipeline</span>
          </h1>
          <p className="text-neutral-400">Autonomous ingestion flow and lead progression.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Search leads by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-white/[0.03] border border-white/10 backdrop-blur-xl text-white outline-none rounded-xl px-5 py-3 placeholder:text-neutral-500 focus:ring-2 focus:ring-blue-500/50 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.1)]"
          />
          <select
            value={intentFilter}
            onChange={(e) => setIntentFilter(e.target.value)}
            className="w-full md:w-56 bg-neutral-900 border border-white/10 text-white rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none cursor-pointer"
          >
            <option value="All Intents">All Intents</option>
            <option value="High Intent">High Intent</option>
            <option value="Medium Intent">Medium Intent</option>
            <option value="Low Intent">Low Intent</option>
          </select>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-white/10 border-t-white/60 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-8 snap-x">
            {COLUMNS.map((col, colIdx) => (
              <div key={col.id} className={`snap-center shrink-0 w-[340px] flex flex-col bg-white/[0.03] backdrop-blur-xl rounded-2xl border ${colorMap[col.color].border} ${colorMap[col.color].glow} p-5 min-h-[600px]`}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-semibold tracking-wider uppercase text-white/80">{col.label}</h2>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${colorMap[col.color].badgeBg} ${colorMap[col.color].badgeText}`}>
                    {groupedLeads[col.id]?.length || 0}
                  </span>
                </div>

                <div className="flex flex-col gap-4 flex-1">
                  <AnimatePresence>
                    {groupedLeads[col.id]?.map((lead, idx) => {
                      const data = lead.record_data;
                      return (
                        <motion.div
                          key={lead.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -20 }}
                          transition={{ delay: idx * 0.05, ease: "easeOut", duration: 0.2 }}
                          whileHover={{ scale: 1.02, y: -2 }}
                          className="group relative bg-neutral-900/60 backdrop-blur-md rounded-xl p-5 border border-white/5 hover:border-white/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all cursor-pointer overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="relative z-10">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className="text-base font-semibold text-white/90 truncate">{data.first_name} {data.last_name}</h3>
                                {data.email && <p className="text-xs text-neutral-500 truncate mt-0.5">{data.email}</p>}
                              </div>
                              {data.estimated_value && (
                                <div className="shrink-0 bg-green-500/10 border border-green-500/30 text-green-400 px-2 py-1 rounded-full text-xs font-mono font-medium shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                                  {data.estimated_value}
                                </div>
                              )}
                            </div>
                            {data.intent && <p className="text-sm text-neutral-400 line-clamp-2 leading-relaxed mb-4">{data.intent}</p>}
                            
                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                              <span className="bg-neutral-800/80 text-neutral-400 text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider">
                                {data.source || "System"}
                              </span>
                              <div className="flex items-center gap-2">
                                 <button onClick={(e) => handleViewDraft(e, lead.id)} className="text-[10px] text-blue-400 font-medium px-2 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20 transition-colors pointer-events-auto">
                                   View Draft
                                 </button>
                                 <span className="text-[10px] text-neutral-500 tracking-wider">
                                   {new Date(lead.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                                 </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  {groupedLeads[col.id]?.length === 0 && (
                    <div className="flex-1 flex items-center justify-center border-2 border-dashed border-white/5 rounded-xl">
                      <p className="text-neutral-600 text-sm font-medium">Empty</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedDraftLeadId && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-neutral-950/80 backdrop-blur-sm"
          >
            <div className="absolute inset-0 cursor-pointer" onClick={() => setSelectedDraftLeadId(null)} />
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="relative z-10 w-full max-w-2xl bg-neutral-900 border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">AI Outreach Draft</h2>
                <button onClick={() => setSelectedDraftLeadId(null)} className="text-neutral-400 hover:text-white">&times;</button>
              </div>
              <div className="bg-neutral-950/50 rounded-xl p-4 min-h-[150px] whitespace-pre-wrap text-sm text-neutral-300 border border-white/5">
                {draftLoading ? (
                   <div className="flex animate-pulse space-x-4">
                     <div className="flex-1 space-y-4 py-1">
                       <div className="h-2 bg-neutral-800 rounded"></div>
                       <div className="space-y-3">
                         <div className="grid grid-cols-3 gap-4"><div className="h-2 bg-neutral-800 rounded col-span-2"></div><div className="h-2 bg-neutral-800 rounded col-span-1"></div></div>
                         <div className="h-2 bg-neutral-800 rounded"></div>
                       </div>
                     </div>
                   </div>
                ) : draftText}
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setSelectedDraftLeadId(null)} className="px-4 py-2 rounded-lg bg-neutral-800 text-white hover:bg-neutral-700 transition-colors text-sm">Cancel</button>
                <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors text-sm font-medium shadow-[0_0_15px_rgba(37,99,235,0.4)]">Send Email</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
