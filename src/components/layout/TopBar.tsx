"use client";

import { Activity, Shield, Zap } from "lucide-react";

export function TopBar() {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      {/* Logo + Brand */}
      <div className="flex items-center gap-3">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 border border-accent/20">
          <Zap className="h-5 w-5 text-accent" />
          <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-accent pulse-dot" />
        </div>
        <div>
          <h1 className="text-base font-semibold tracking-tight text-text-primary font-[family-name:var(--font-mono)]">
            AetherOps
          </h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted font-medium">
            Autonomous CRM
          </p>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <Activity className="h-3.5 w-3.5 text-success" />
          <span className="font-[family-name:var(--font-mono)]">12 deals active</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <Shield className="h-3.5 w-3.5 text-crimson-light" />
          <span className="font-[family-name:var(--font-mono)]">3 alerts</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-success pulse-dot" />
          <span className="text-[11px] text-text-muted font-[family-name:var(--font-mono)]">
            AI Engine Online
          </span>
        </div>
      </div>
    </div>
  );
}
