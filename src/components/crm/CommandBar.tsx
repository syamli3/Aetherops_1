"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Command, Search, Command as CmdIcon, Loader2 } from "lucide-react";

export default function CommandBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [responseMsg, setResponseMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle on Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResponseMsg(null);
    try {
      const res = await fetch("/api/cmd-k", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: query }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        setResponseMsg("Error: " + (data.error || "Execution failed"));
      } else {
        setResponseMsg(data.message || "Command executed.");
      }
    } catch (err) {
      setResponseMsg("Network syntax error parsing command.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Hint */}
      {!isOpen && (
        <div 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-neutral-900 border border-white/10 px-4 py-2 rounded-full cursor-pointer hover:bg-neutral-800 transition-colors shadow-2xl"
        >
          <Command className="w-4 h-4 text-neutral-400" />
          <span className="text-sm font-medium text-neutral-300">Cmd K</span>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-neutral-950/80 backdrop-blur-sm"
          >
            <div 
              className="absolute inset-0 cursor-pointer" 
              onClick={() => setIsOpen(false)} 
            />

            <motion.div
              initial={{ scale: 0.95, y: -20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: -20, opacity: 0 }}
              transition={{ ease: "easeOut", duration: 0.2 }}
              className="relative w-full max-w-2xl bg-neutral-900 border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              <form onSubmit={handleSubmit} className="flex flex-col relative">
                <div className="flex items-center px-4 py-4 border-b border-white/10 bg-white/[0.02]">
                  <Search className="w-5 h-5 text-neutral-400 mr-3 shrink-0" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="E.g., Move record abcd-1234 to Closed..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder:text-neutral-500"
                  />
                  {loading && <Loader2 className="w-5 h-5 text-blue-500 animate-spin ml-3 shrink-0" />}
                </div>

                <div className="p-4 bg-neutral-950/50 min-h-[100px] flex items-center justify-center">
                  {!responseMsg && !loading ? (
                    <div className="flex flex-col items-center text-center text-neutral-500 gap-2">
                      <CmdIcon className="w-6 h-6 opacity-30" />
                      <p className="text-sm">Natural Language Operations Engine.<br/>Execute direct Supabase functions using plain English.</p>
                    </div>
                  ) : null}

                  {responseMsg && !loading && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full bg-blue-500/10 border border-blue-500/20 text-blue-200 p-4 rounded-xl text-sm"
                    >
                      {responseMsg}
                    </motion.div>
                  )}
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
