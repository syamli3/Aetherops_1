# AetherOps — Zero-Input Autonomous CRM

A premium, autonomous B2B CRM dashboard with Dark Glassmorphism UI, autonomous Kanban pipeline, real-time Omni-Feed, and VAPT-style compliance scanner.

## User Review Required

> [!IMPORTANT]
> **Supabase**: This plan uses an **entirely local mock data layer** (JSON seed data + React state) so you can review the full UI without needing a running Supabase project. Once the UI is approved, Supabase can be wired in by swapping the mock provider for Supabase client calls. If you'd prefer to connect a live Supabase project from the start, please share the project URL and anon key.

> [!IMPORTANT]
> **Drag-and-drop library**: The plan uses `@hello-pangea/dnd` (maintained fork of `react-beautiful-dnd`) for the Kanban. Let me know if you have a different preference.

---

## Proposed Changes

### 1 · Project Scaffolding

#### [NEW] Next.js App (root)

- Scaffold with `npx -y create-next-app@latest ./` — TypeScript, App Router, Tailwind CSS, ESLint, `src/` directory.
- Install additional deps:
  ```
  framer-motion recharts @hello-pangea/dnd lucide-react
  @supabase/supabase-js
  ```
- Initialize shadcn/ui (`npx -y shadcn@latest init`) with `zinc` base color, dark mode.

---

### 2 · Design System & Global Styles

#### [NEW] `tailwind.config.ts`

Extend Tailwind with custom tokens:

| Token | Value | Purpose |
|---|---|---|
| `void` | `#0B0C10` | Primary background |
| `void-light` | `#13141A` | Elevated surface |
| `glass-border` | `rgba(255,255,255,0.05)` | Glass panel border |
| `glass-bg` | `rgba(255,255,255,0.02)` | Glass panel fill |
| `crimson` | `#991B1B` | Compliance alerts |
| `crimson-glow` | `0 0 20px rgba(153,27,27,0.4)` | Crimson box-shadow |
| `accent` | `#22D3EE` | Cyan accent for confidence / highlights |

Custom font: `JetBrains Mono` (monospace) via Google Fonts.

#### [NEW] `src/app/globals.css`

- Set `body` background to `void`, color white, font-family.
- Utility classes: `.glass-panel` (backdrop-blur-xl, bg-glass-bg, border glass-border, rounded-2xl).
- Custom scrollbar styles (thin, dark track).

---

### 3 · Layout

#### [NEW] `src/app/layout.tsx`

Root layout: import Google Font (JetBrains Mono + Inter), apply dark theme, metadata.

#### [NEW] `src/app/page.tsx`

Three-column grid layout:
```
grid grid-cols-[320px_1fr_360px] h-screen
```
Renders `<OmniFeed />`, `<KanbanBoard />`, and a right column stack of `<ComplianceRadar />` + `<ExecutionQueue />`.

#### [NEW] `src/components/ui/GlassPanel.tsx`

Reusable wrapper: `backdrop-blur-xl bg-white/[0.02] border border-white/[0.05] rounded-2xl`.

---

### 4 · Epic 1 — Omni-Feed (Left Column)

#### [NEW] `src/components/omni-feed/OmniFeed.tsx`

- Renders a header ("Omni-Feed") and a scrollable list of `FeedCard` components.
- Consumes data from `src/lib/data/intelligence-logs.ts` (mock) or Supabase subscription.
- New cards appear at top with Framer Motion `AnimatePresence` + slide-in animation.

#### [NEW] `src/components/omni-feed/FeedCard.tsx`

- Shows: icon (based on log type), title, brief summary, relative timestamp.
- Subtle border-left color-coded by type (email = cyan, call = green, compliance = crimson).

#### [NEW] `src/lib/data/intelligence-logs.ts`

Seed array of ~8 intelligence log entries with fields: `id, type, title, summary, created_at`.

---

### 5 · Epic 2 — Autonomous Kanban (Center Column)

#### [NEW] `src/components/kanban/KanbanBoard.tsx`

- Uses `@hello-pangea/dnd` `<DragDropContext>` + `<Droppable>` columns.
- Four columns: **Discovery → Negotiation → Security Review → Closed**.
- State managed via `useState`; drag-end handler moves cards between columns.

#### [NEW] `src/components/kanban/KanbanColumn.tsx`

- Column header with title + deal count badge.
- Renders list of `<DealCard>` inside `<Droppable>`.

#### [NEW] `src/components/kanban/DealCard.tsx`

- Displays: **Company Name**, **Deal Value** (Intl.NumberFormat USD), **AI Confidence Score** (mini Recharts `<RadialBarChart>` ring).
- Compliance flag → glowing crimson border (`box-shadow: crimson-glow, border-color: crimson`).
- Hover: `hover:-translate-y-1 transition-transform`.
- Wrapped in `<Draggable>`.

#### [NEW] `src/lib/data/deals.ts`

Seed data: ~8 deals spread across the 4 columns. Fields: `id, company, value, confidence, column, has_compliance_flag`.

---

### 6 · Epic 3 — Right Column

#### [NEW] `src/components/compliance/ComplianceRadar.tsx`

- Header: "Compliance Radar" with a pulsing red dot indicator.
- Lists vulnerability cards from `src/lib/data/contract-vulnerabilities.ts`.
- Each card: severity badge (CRITICAL / HIGH / MEDIUM), clause reference, description.
- Strict Matte Crimson palette: `bg-red-950/40, border-red-900/30, text-red-400`.

#### [NEW] `src/components/execution/ExecutionQueue.tsx`

- Header: "Execution Queue".
- Lists pending actions from `src/lib/data/pending-actions.ts`.
- Each item: action type icon, recipient, subject line, status chip.
- Footer buttons:
  - Primary: **"Verify & Execute"** — solid cyan button.
  - Secondary: **"Push to Slack"** — ghost icon button with Lucide `MessageSquare` icon.

#### [NEW] `src/lib/data/contract-vulnerabilities.ts`

Seed array of ~4 vulnerabilities. Fields: `id, severity, clause, description, contract_name`.

#### [NEW] `src/lib/data/pending-actions.ts`

Seed array of ~3 pending actions. Fields: `id, type, recipient, subject, status`.

---

### 7 · Supabase Schema (SQL)

#### [NEW] `supabase/schema.sql`

DDL for four tables — saved as reference, executed manually or via Supabase dashboard when ready:

```sql
-- deals
create table deals (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  value numeric not null,
  confidence integer not null check (confidence between 0 and 100),
  column_name text not null default 'discovery',
  has_compliance_flag boolean default false,
  created_at timestamptz default now()
);

-- intelligence_logs
create table intelligence_logs (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  title text not null,
  summary text not null,
  created_at timestamptz default now()
);

-- contract_vulnerabilities
create table contract_vulnerabilities (
  id uuid primary key default gen_random_uuid(),
  severity text not null,
  clause text not null,
  description text not null,
  contract_name text not null,
  created_at timestamptz default now()
);

-- pending_actions
create table pending_actions (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  recipient text not null,
  subject text not null,
  status text not null default 'drafted',
  created_at timestamptz default now()
);
```

#### [NEW] `src/lib/supabase.ts`

Supabase client singleton reading `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from `.env.local`. Exported but not actively called until live DB is configured.

---

## Verification Plan

### Automated / Browser Tests

1. **Dev server smoke test** — `npm run dev`, open `http://localhost:3000` in the browser tool, confirm the page loads without console errors.
2. **Layout verification** — Screenshot the full page in the browser tool and confirm:
   - Three-column layout is visible.
   - Dark Glassmorphism aesthetic (dark background, blurred glass panels).
3. **Kanban drag-and-drop** — Use the browser tool to drag a deal card from "Discovery" to "Negotiation" and verify it moves.
4. **Compliance alert styling** — Inspect a deal card with `has_compliance_flag: true` and verify the glowing Matte Crimson (`#991B1B`) border renders.
5. **Omni-Feed animation** — Confirm feed cards are visible and stacked in the left column.

### Manual Verification (by you)

- After the browser tests pass, I will ask you to review the running app at `http://localhost:3000` and confirm the aesthetic matches your vision.
