'use client';

import React, { useState } from 'react';
import { Play, Filter, Zap, Save, ArrowRight, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function FlowBuilderClient() {
  const router = useRouter();
  const [nodes, setNodes] = useState([
    { id: '1', type: 'trigger', title: 'When Lead is Created', desc: 'Object: Lead | Event: onCreate' },
    { id: '2', type: 'condition', title: 'Check Status', desc: 'status == Qualified' },
    { id: '3', type: 'action', title: 'Fire Webhook', desc: 'POST https://api.aetherops.com/...' },
  ]);

  return (
    <div className="flex h-screen bg-[#060e20] text-[#dee5ff] font-sans selection:bg-[#53ddfc]/30">
      
      {/* LEFT SIDEBAR - NODE PALETTE */}
      <div className="w-72 border-r border-[#40485d]/30 bg-[#091328] flex flex-col z-10 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
        <div className="p-6 border-b border-[#40485d]/20">
          <h2 className="text-xl font-bold tracking-tight text-[#dee5ff]">Flow <span className="text-[#53ddfc]">Canvas</span></h2>
          <p className="text-xs text-[#a3aac4] mt-1 font-medium tracking-wide uppercase">Node Library</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
           
           <div className="space-y-3">
              <h3 className="text-[0.6875rem] uppercase tracking-[0.05em] text-[#a3aac4] font-semibold pl-1">Triggers</h3>
              <div className="group flex items-center gap-3 p-3 rounded-xl bg-[#0f1930] border border-[#40485d]/20 hover:border-[#a3a6ff]/50 hover:bg-[#141f38] transition-all cursor-grab active:cursor-grabbing shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
                <div className="w-8 h-8 rounded-lg bg-[#a3a6ff]/10 flex items-center justify-center border border-[#a3a6ff]/20 group-hover:bg-[#a3a6ff]/20 transition-colors">
                  <Play className="w-4 h-4 text-[#a3a6ff]" />
                </div>
                <div>
                   <p className="text-sm font-medium text-[#dee5ff]">Record Event</p>
                   <p className="text-xs text-[#a3aac4]">Trigger on Creation/Update</p>
                </div>
              </div>
           </div>

           <div className="space-y-3">
              <h3 className="text-[0.6875rem] uppercase tracking-[0.05em] text-[#a3aac4] font-semibold pl-1">Logic Rules</h3>
              <div className="group flex items-center gap-3 p-3 rounded-xl bg-[#0f1930] border border-[#40485d]/20 hover:border-[#53ddfc]/50 hover:bg-[#141f38] transition-all cursor-grab shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
                <div className="w-8 h-8 rounded-lg bg-[#53ddfc]/10 flex items-center justify-center border border-[#53ddfc]/20 group-hover:bg-[#53ddfc]/20 transition-colors">
                  <Filter className="w-4 h-4 text-[#53ddfc]" />
                </div>
                <div>
                   <p className="text-sm font-medium text-[#dee5ff]">Condition Branch</p>
                   <p className="text-xs text-[#a3aac4]">If/Else Logic Gate</p>
                </div>
              </div>
           </div>

           <div className="space-y-3">
              <h3 className="text-[0.6875rem] uppercase tracking-[0.05em] text-[#a3aac4] font-semibold pl-1">Data Actions</h3>
              
              <div className="group flex items-center gap-3 p-3 rounded-xl bg-[#0f1930] border border-[#40485d]/20 hover:border-[#ff6f7e]/50 hover:bg-[#141f38] transition-all cursor-grab shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
                <div className="w-8 h-8 rounded-lg bg-[#ff6f7e]/10 flex items-center justify-center border border-[#ff6f7e]/20 group-hover:bg-[#ff6f7e]/20 transition-colors">
                  <Zap className="w-4 h-4 text-[#ff6f7e]" />
                </div>
                <div>
                   <p className="text-sm font-medium text-[#dee5ff]">HTTP Webhook</p>
                   <p className="text-xs text-[#a3aac4]">POST to External APIs</p>
                </div>
              </div>

              <div className="group flex items-center gap-3 p-3 rounded-xl bg-[#0f1930] border border-[#40485d]/20 hover:border-[#ff6f7e]/50 hover:bg-[#141f38] transition-all cursor-grab shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
                <div className="w-8 h-8 rounded-lg bg-[#ff6f7e]/10 flex items-center justify-center border border-[#ff6f7e]/20 group-hover:bg-[#ff6f7e]/20 transition-colors">
                  <Save className="w-4 h-4 text-[#ff6f7e]" />
                </div>
                <div>
                   <p className="text-sm font-medium text-[#dee5ff]">Update Record</p>
                   <p className="text-xs text-[#a3aac4]">Mutate CRM Data</p>
                </div>
              </div>
           </div>

        </div>
      </div>

      {/* MAIN CANVAS */}
      <div className="flex-1 relative overflow-hidden bg-[#060e20] flex flex-col">
         {/* Top Actions Bar */}
         <div className="absolute top-0 right-0 p-6 z-20 flex gap-4">
            <button 
              onClick={() => router.push('/setup/home')}
              className="px-5 py-2 rounded-lg bg-transparent border border-[#40485d]/40 text-[#a3aac4] font-medium text-sm hover:text-white hover:bg-[#141f38] transition-all"
            >
              Discard
            </button>
            <button className="px-6 py-2 rounded-lg bg-[#9396ff] text-[#0a0081] font-bold text-sm hover:shadow-[0_0_20px_rgba(163,166,255,0.4)] transition-all flex items-center gap-2">
              <Save className="w-4 h-4" /> Deploy Flow
            </button>
         </div>

         {/* The Canvas Grid Background */}
         <div className="absolute inset-0 opacity-20 pointer-events-none" 
              style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #a3aac4 1px, transparent 0)', backgroundSize: '32px 32px' }}>
         </div>

         {/* Nodes Container */}
         <div className="relative flex-1 flex flex-col items-center pt-24 pb-20 overflow-y-auto">
            
            {/* 1. Trigger Node */}
            <div className="relative z-10 w-80 bg-[#192540]/60 backdrop-blur-xl border border-[#40485d]/40 rounded-2xl shadow-[0_24px_48px_-12px_rgba(0,0,0,0.8)] overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#a3a6ff] to-[#53ddfc]"></div>
               <div className="p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#a3a6ff]/10 flex items-center justify-center border border-[#a3a6ff]/20 shrink-0">
                     <Play className="w-5 h-5 text-[#a3a6ff]" />
                  </div>
                  <div>
                    <h4 className="text-[#a3aac4] text-[0.6875rem] uppercase tracking-wider font-bold mb-1">Trigger</h4>
                    <h3 className="text-white text-base font-semibold mb-1">Lead Created</h3>
                    <p className="text-[#a3aac4] text-xs">Fires whenever `sf_records` registers a new Lead.</p>
                  </div>
               </div>
            </div>

            {/* Connecting Line */}
            <div className="w-px h-16 bg-gradient-to-b from-[#40485d] to-[#53ddfc]/50 relative">
               <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#53ddfc] shadow-[0_0_10px_#53ddfc]"></div>
            </div>

            {/* 2. Condition Node */}
            <div className="relative z-10 w-96 bg-[#192540]/60 backdrop-blur-xl border border-[#53ddfc]/30 rounded-2xl shadow-[0_24px_48px_-12px_rgba(0,0,0,0.8)] overflow-hidden group hover:border-[#53ddfc]/60 transition-colors">
               <div className="absolute inset-0 bg-gradient-to-br from-[#53ddfc]/5 to-transparent pointer-events-none"></div>
               <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                       <Filter className="w-4 h-4 text-[#53ddfc]" />
                       <h4 className="text-[#53ddfc] text-[0.6875rem] uppercase tracking-wider font-bold">Logic Gate</h4>
                    </div>
                    <Settings className="w-4 h-4 text-[#40485d] group-hover:text-[#a3aac4] cursor-pointer transition-colors" />
                  </div>
                  <div className="bg-[#0f1930] rounded-lg p-3 border border-[#40485d]/30 font-mono text-sm text-[#dee5ff]">
                     <span className="text-[#a3a6ff]">record</span>.<span className="text-white">status</span> === <span className="text-[#ff6f7e]">'Qualified'</span>
                  </div>
               </div>
            </div>

            {/* Connecting Line */}
            <div className="w-px h-16 bg-gradient-to-b from-[#53ddfc]/50 to-[#ff6f7e]/50 relative">
               <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#ff6f7e] shadow-[0_0_10px_#ff6f7e]"></div>
            </div>

            {/* 3. Action Node */}
            <div className="relative z-10 w-80 bg-[#192540]/60 backdrop-blur-xl border border-[#ff6f7e]/30 rounded-2xl shadow-[0_24px_48px_-12px_rgba(0,0,0,0.8)] overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-[#ff6f7e]/5 to-transparent pointer-events-none"></div>
               <div className="p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#ff6f7e]/10 flex items-center justify-center border border-[#ff6f7e]/20 shrink-0">
                     <Zap className="w-5 h-5 text-[#ff6f7e]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[#ff6f7e] text-[0.6875rem] uppercase tracking-wider font-bold mb-1">Action: Webhook</h4>
                    <h3 className="text-white text-base font-semibold mb-2">Ping Slack Channel</h3>
                    <div className="bg-[#0f1930] rounded px-2 py-1 border border-[#40485d]/30 flex items-center justify-between">
                       <span className="text-xs text-[#a3aac4] truncate w-40">https://hooks.slack.com/services/T00000000/B00000000...</span>
                       <span className="bg-[#141f38] text-[0.6rem] px-1.5 py-0.5 rounded text-[#a3a6ff] font-bold">POST</span>
                    </div>
                  </div>
               </div>
            </div>

            {/* End Indicator */}
            <div className="mt-12 flex flex-col items-center gap-2 opacity-50">
               <div className="w-2 h-2 rounded-full bg-[#40485d]"></div>
               <div className="w-2 h-2 rounded-full bg-[#40485d]"></div>
               <div className="text-xs text-[#a3aac4] font-medium tracking-widest uppercase">End of Flow</div>
            </div>

         </div>
      </div>
    </div>
  );
}
