-- AetherOps — Phase 2 Schema Migration
-- Run this in your Supabase SQL editor to add the new columns needed for AI integration.

-- Add compliance_status and ai_summary columns to deals
ALTER TABLE deals ADD COLUMN IF NOT EXISTS compliance_status text DEFAULT 'Clean';
ALTER TABLE deals ADD COLUMN IF NOT EXISTS ai_summary text DEFAULT '';
