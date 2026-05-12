// ── Deals Pipeline ──────────────────────────────────────────────────────────

export interface Deal {
  id: string;
  company: string;
  value: number;
  confidence: number;
  column_name: "discovery" | "negotiation" | "security_review" | "closed";
  has_compliance_flag: boolean;
  compliance_status?: string;
  ai_summary?: string;
  created_at?: string;
}

export type ColumnId = Deal["column_name"];

export interface KanbanColumn {
  id: ColumnId;
  title: string;
}

export const columns: KanbanColumn[] = [
  { id: "discovery", title: "Discovery" },
  { id: "negotiation", title: "Negotiation" },
  { id: "security_review", title: "Security Review" },
  { id: "closed", title: "Closed" },
];

// ── Intelligence Logs (Omni-Feed) ───────────────────────────────────────────

export interface IntelligenceLog {
  id: string;
  type: "email" | "call" | "compliance" | "deal" | "calendar" | "document";
  title: string;
  summary: string;
  created_at: string;
}

// ── Contract Vulnerabilities (Compliance Radar) ─────────────────────────────

export interface ContractVulnerability {
  id: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  clause: string;
  description: string;
  contract_name: string;
  created_at?: string;
}

// ── Pending Actions (Execution Queue) ───────────────────────────────────────

export interface PendingAction {
  id: string;
  type: "email" | "contract" | "message";
  recipient: string;
  subject: string;
  status: "drafted" | "reviewed" | "sent" | "Executed";
  created_at?: string;
}
