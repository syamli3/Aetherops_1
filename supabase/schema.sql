-- Antigravity CRM (B2C Edition) Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS (Internal Staff)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'agent')),
    department TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CUSTOMERS (External)
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    address TEXT,
    
    -- AI & Calculated Fields
    lifetime_value NUMERIC(10, 2) DEFAULT 0.00,
    churn_risk_score INTEGER CHECK (churn_risk_score >= 0 AND churn_risk_score <= 100),
    vip_status BOOLEAN DEFAULT false,
    personality_summary TEXT,
    
    -- Extensibility
    custom_fields JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- INTERACTIONS (The Timeline)
CREATE TABLE interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    type TEXT NOT NULL CHECK (type IN ('email', 'chat', 'call', 'note', 'ticket')),
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound', 'internal')),
    content TEXT NOT NULL,
    
    -- AI Enriched Data
    sentiment_score INTEGER CHECK (sentiment_score >= 0 AND sentiment_score <= 100),
    ai_summary TEXT,
    
    interaction_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TRANSACTIONS
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT NOT NULL CHECK (status IN ('completed', 'pending', 'refunded', 'failed')),
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TAGS
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#808080'
);

-- CUSTOMER_TAGS (Junction Table)
CREATE TABLE customer_tags (
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (customer_id, tag_id)
);


-- ROW LEVEL SECURITY (RLS)

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_tags ENABLE ROW LEVEL SECURITY;

-- Policies (Basic implementation, can be hardened later)
-- Admins can do everything. Agents can view their assigned department's customers (simplified to all for now pending Auth setup).
-- For this setup phase, we'll create permissive policies for authenticated users to ensure rapid frontend development.
-- We will lock this down tighter once the UI is wired up.

CREATE POLICY "Allow authenticated users full access to users" ON users FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access to customers" ON customers FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access to interactions" ON interactions FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access to transactions" ON transactions FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access to tags" ON tags FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access to customer_tags" ON customer_tags FOR ALL TO authenticated USING (true);

-- Triggers to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- SF ARCHITECTURE (PROVISIONING ENGINE)

-- PROFILES
CREATE TABLE sf_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ROLES
CREATE TABLE sf_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    parent_role_id UUID REFERENCES sf_roles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- USERS (SF Native)
CREATE TABLE sf_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    alias TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    nickname TEXT,
    title TEXT,
    company TEXT,
    department TEXT,
    role_id UUID REFERENCES sf_roles(id) ON DELETE SET NULL,
    profile_id UUID REFERENCES sf_profiles(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE sf_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sf_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sf_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users full access to sf_profiles" ON sf_profiles FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access to sf_roles" ON sf_roles FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access to sf_users" ON sf_users FOR ALL TO authenticated USING (true);

CREATE TRIGGER update_sf_users_updated_at BEFORE UPDATE ON sf_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- METADATA ENGINE (OBJECT MANAGER)
CREATE TABLE sf_objects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label TEXT NOT NULL,
    plural_label TEXT NOT NULL,
    api_name TEXT UNIQUE NOT NULL,
    is_custom BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE sf_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    object_id UUID NOT NULL REFERENCES sf_objects(id) ON DELETE CASCADE,
    field_label TEXT NOT NULL,
    field_api_name TEXT NOT NULL,
    data_type TEXT NOT NULL CHECK (data_type IN ('Text', 'Number', 'Picklist', 'Checkbox', 'Date', 'Lookup')),
    target_object_id UUID REFERENCES sf_objects(id) ON DELETE SET NULL,
    is_required BOOLEAN DEFAULT false,
    is_custom BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(object_id, field_api_name)
);

ALTER TABLE sf_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE sf_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users full access to sf_objects" ON sf_objects FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access to sf_fields" ON sf_fields FOR ALL TO authenticated USING (true);

CREATE TRIGGER update_sf_objects_updated_at BEFORE UPDATE ON sf_objects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sf_fields_updated_at BEFORE UPDATE ON sf_fields FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed Standard Objects
INSERT INTO sf_objects (label, plural_label, api_name, is_custom, description) VALUES
('Account', 'Accounts', 'Account', false, 'Standard object for tracking companies and organizations.'),
('Contact', 'Contacts', 'Contact', false, 'Standard object for tracking individual people.'),
('Opportunity', 'Opportunities', 'Opportunity', false, 'Standard object for tracking sales deals.'),
('Lead', 'Leads', 'Lead', false, 'Standard object for tracking prospects.');

-- UNIVERSAL DATA STORE (RECORDS)
CREATE TABLE sf_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    object_id UUID NOT NULL REFERENCES sf_objects(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES sf_users(id) ON DELETE SET NULL,
    record_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE sf_records ENABLE ROW LEVEL SECURITY;

-- Helper to check Admin Profile
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM sf_users u
    JOIN sf_profiles p ON u.profile_id = p.id
    WHERE u.id = auth.uid() AND p.name = 'System Administrator'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recursive CTE to find subordinate users
CREATE OR REPLACE FUNCTION get_subordinate_users(current_user_id UUID)
RETURNS SETOF UUID AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE subordinates AS (
      -- Base case: find direct children roles of the current user's role
      SELECT child.id
      FROM sf_roles child
      JOIN sf_users u ON u.role_id = child.parent_role_id
      WHERE u.id = current_user_id
  
      UNION ALL
  
      -- Recursive case: find children of children
      SELECT r.id
      FROM sf_roles r
      JOIN subordinates s ON r.parent_role_id = s.id
  )
  SELECT u.id
  FROM sf_users u
  WHERE u.role_id IN (SELECT id FROM subordinates);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy 1: Admin Bypass
CREATE POLICY "Admin Full Access" ON sf_records
FOR ALL TO authenticated
USING (is_admin());

-- Policy 2: Hierarchical Ownership Security
CREATE POLICY "Users Hierarchical Access" ON sf_records
FOR ALL TO authenticated
USING (
    owner_id = auth.uid() OR 
    owner_id IN (SELECT get_subordinate_users(auth.uid()))
)
WITH CHECK (
    owner_id = auth.uid() OR 
    is_admin()
);

CREATE TRIGGER update_sf_records_updated_at BEFORE UPDATE ON sf_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ACTIVITY TIMELINE
CREATE TABLE sf_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    record_id UUID NOT NULL REFERENCES sf_records(id) ON DELETE CASCADE,
    user_id UUID REFERENCES sf_users(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('Call', 'Email', 'Note', 'Meeting')),
    subject TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE sf_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users full access to sf_activities" ON sf_activities FOR ALL TO authenticated USING (true);
CREATE TRIGGER update_sf_activities_updated_at BEFORE UPDATE ON sf_activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- PROCESS AUTOMATION ENGINE (RECORD-TRIGGERED FLOWS)
CREATE TABLE sf_flows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    object_id UUID NOT NULL REFERENCES sf_objects(id) ON DELETE CASCADE,
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('onCreate', 'onUpdate', 'onSave')),
    conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
    actions JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE sf_flows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users full access to sf_flows" ON sf_flows FOR ALL TO authenticated USING (true);
CREATE TRIGGER update_sf_flows_updated_at BEFORE UPDATE ON sf_flows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- DYNAMIC APP LAUNCHER & WORKSPACES
CREATE TABLE sf_apps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE sf_app_tabs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    app_id UUID NOT NULL REFERENCES sf_apps(id) ON DELETE CASCADE,
    object_id UUID NOT NULL REFERENCES sf_objects(id) ON DELETE CASCADE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE sf_apps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users full access to sf_apps" ON sf_apps FOR ALL TO authenticated USING (true);
CREATE TRIGGER update_sf_apps_updated_at BEFORE UPDATE ON sf_apps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE sf_app_tabs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users full access to sf_app_tabs" ON sf_app_tabs FOR ALL TO authenticated USING (true);

-- Seed Initial Apps
INSERT INTO sf_apps (name, description) VALUES 
('Sales Console', 'Primary workspace for managing the sales pipeline and opportunities.'),
('Service Console', 'Workspace for support agents to manage customer cases and tickets.');

-- Optional: Seed Tabs (Requires looking up the exact UUIDs of the seeded objects).
-- For this scaffold, we will fetch standard objects dynamically in Next.js if no tabs exist for simplicity,
-- or allow Admins to configure them later.

-- DYNAMIC REPORTING ENGINE
CREATE TABLE sf_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    object_id UUID NOT NULL REFERENCES sf_objects(id) ON DELETE CASCADE,
    selected_columns JSONB NOT NULL DEFAULT '[]'::jsonb,
    filters JSONB NOT NULL DEFAULT '[]'::jsonb,
    owner_id UUID REFERENCES sf_users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE sf_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reports Ownership Security" ON sf_reports
FOR ALL TO authenticated
USING (owner_id = auth.uid() OR is_admin())
WITH CHECK (owner_id = auth.uid() OR is_admin());

CREATE TRIGGER update_sf_reports_updated_at BEFORE UPDATE ON sf_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- DYNAMIC PAGE LAYOUT ENGINE
CREATE TABLE sf_layouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    object_id UUID NOT NULL REFERENCES sf_objects(id) ON DELETE CASCADE,
    layout_name TEXT NOT NULL,
    layout_config JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE sf_layouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users full access to sf_layouts" ON sf_layouts FOR ALL TO authenticated USING (true);
CREATE TRIGGER update_sf_layouts_updated_at BEFORE UPDATE ON sf_layouts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- FIELD LEVEL SECURITY (FLS) ENGINE
CREATE TABLE sf_field_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES sf_profiles(id) ON DELETE CASCADE,
    field_id UUID NOT NULL REFERENCES sf_fields(id) ON DELETE CASCADE,
    is_readable BOOLEAN NOT NULL DEFAULT true,
    is_editable BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(profile_id, field_id)
);

ALTER TABLE sf_field_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow admins to manage field permissions" ON sf_field_permissions FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Allow users to view their own field permissions" ON sf_field_permissions FOR SELECT TO authenticated USING (true);
CREATE TRIGGER update_sf_field_permissions_updated_at BEFORE UPDATE ON sf_field_permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- HEADLESS REST API ENGINE
CREATE TABLE sf_api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key_hash TEXT NOT NULL UNIQUE,
    owner_id UUID NOT NULL REFERENCES sf_users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE sf_api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow admins to manage API keys" ON sf_api_keys FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Allow users to view their own API keys" ON sf_api_keys FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE TRIGGER update_sf_api_keys_updated_at BEFORE UPDATE ON sf_api_keys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
