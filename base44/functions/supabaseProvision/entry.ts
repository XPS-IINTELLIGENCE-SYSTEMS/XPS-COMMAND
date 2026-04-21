import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_KEY');

// ═══════════════════════════════════════════════════════════
// COMPLETE ENTERPRISE SCHEMA — EVERY XPS INTELLIGENCE TABLE
// ═══════════════════════════════════════════════════════════
const SCHEMA_SQL = `
-- ╔═══════════════════════════════════════════════════════╗
-- ║  XPS INTELLIGENCE — FULL ENTERPRISE SUPABASE SCHEMA  ║
-- ╚═══════════════════════════════════════════════════════╝

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ═══════════════════════════════════════
-- 1. USERS & AUTH
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS xps_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  base44_id TEXT UNIQUE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin','user','manager','field_tech','viewer')),
  phone TEXT,
  company_name TEXT,
  title TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  ai_mode TEXT DEFAULT 'Basic Chat',
  notification_method TEXT DEFAULT 'Email',
  avatar_url TEXT,
  last_login TIMESTAMPTZ,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- 2. LEADS
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  base44_id TEXT UNIQUE,
  company TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  website TEXT,
  vertical TEXT,
  specialty TEXT,
  lead_type TEXT DEFAULT 'XPress' CHECK (lead_type IN ('XPress','Jobs')),
  stage TEXT DEFAULT 'Incoming',
  pipeline_status TEXT DEFAULT 'Incoming',
  bid_stage TEXT DEFAULT 'Not Started',
  location TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  employee_count INT,
  estimated_revenue NUMERIC,
  square_footage NUMERIC,
  estimated_value NUMERIC,
  score INT DEFAULT 0,
  priority INT DEFAULT 5,
  sentiment_score INT,
  sentiment_label TEXT,
  sentiment_notes TEXT,
  source TEXT,
  ingestion_source TEXT DEFAULT 'Manual',
  ai_insight TEXT,
  ai_recommendation TEXT,
  profile_data JSONB,
  validation_notes TEXT,
  notes TEXT,
  last_contacted TIMESTAMPTZ,
  last_enriched TIMESTAMPTZ,
  enrichment_count INT DEFAULT 0,
  intel_record_ids TEXT,
  data_bank_origin TEXT DEFAULT 'direct',
  dormant_reason TEXT,
  dormant_date TIMESTAMPTZ,
  reactivation_trigger TEXT,
  reactivation_date DATE,
  years_in_business INT,
  existing_material TEXT,
  equipment_used TEXT,
  profile_url TEXT,
  created_by TEXT,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- 3. COMMERCIAL JOBS
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS commercial_jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  base44_id TEXT UNIQUE,
  job_name TEXT NOT NULL,
  address TEXT,
  city TEXT NOT NULL,
  county TEXT,
  state TEXT NOT NULL,
  zip TEXT,
  owner_name TEXT,
  owner_contact TEXT,
  owner_email TEXT,
  owner_phone TEXT,
  gc_name TEXT,
  gc_contact TEXT,
  gc_email TEXT,
  gc_phone TEXT,
  architect_name TEXT,
  architect_contact TEXT,
  project_type TEXT DEFAULT 'other',
  sector TEXT DEFAULT 'Commercial Private',
  total_sqft NUMERIC,
  flooring_sqft NUMERIC,
  project_phase TEXT DEFAULT 'discovered',
  construction_start_date DATE,
  flooring_need_date DATE,
  project_value NUMERIC,
  estimated_flooring_value NUMERIC,
  permit_number TEXT,
  permit_source TEXT,
  permit_date DATE,
  flooring_system_recommendation TEXT,
  takeoff_data JSONB,
  takeoff_complete BOOLEAN DEFAULT FALSE,
  competitive_pricing JSONB,
  urgency_score INT,
  lead_score INT,
  route_to TEXT DEFAULT 'NCP',
  bid_status TEXT DEFAULT 'not_started',
  bid_document_id TEXT,
  contractor_id TEXT,
  operation_id TEXT,
  source_url TEXT,
  source_type TEXT DEFAULT 'Other',
  discovery_date TIMESTAMPTZ,
  bid_due_date DATE,
  ai_insight TEXT,
  follow_up_count INT DEFAULT 0,
  last_follow_up TIMESTAMPTZ,
  notes TEXT,
  work_stages JSONB,
  material_log JSONB,
  site_photos JSONB,
  created_by TEXT,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- 4. CONTRACTOR COMPANIES
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS contractor_companies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  base44_id TEXT UNIQUE,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  specialty TEXT,
  license_number TEXT,
  insurance_verified BOOLEAN DEFAULT FALSE,
  employee_count INT,
  years_in_business INT,
  annual_revenue NUMERIC,
  rating NUMERIC,
  notes TEXT,
  profile_data JSONB,
  source TEXT,
  status TEXT DEFAULT 'Active',
  created_by TEXT,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- 5. INTEL RECORDS
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS intel_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  base44_id TEXT UNIQUE,
  source_company TEXT DEFAULT 'Custom',
  category TEXT DEFAULT 'custom',
  industry TEXT,
  sub_industry TEXT,
  title TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  source_url TEXT,
  source_type TEXT DEFAULT 'manual',
  tags TEXT,
  confidence_score INT,
  scraped_at TIMESTAMPTZ,
  scraper_job_id TEXT,
  is_indexed BOOLEAN DEFAULT FALSE,
  data_freshness TEXT DEFAULT 'recent',
  location_name TEXT,
  location_state TEXT,
  pricing_data JSONB,
  keyword_data JSONB,
  engagement_metrics JSONB,
  metadata JSONB,
  created_by TEXT,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- 6. PROPOSALS
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS proposals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  base44_id TEXT UNIQUE,
  title TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_contact TEXT,
  client_email TEXT,
  service_type TEXT,
  square_footage NUMERIC,
  price_per_sqft NUMERIC,
  total_value NUMERIC NOT NULL,
  scope_of_work TEXT,
  materials TEXT,
  timeline TEXT,
  terms TEXT,
  status TEXT DEFAULT 'Draft',
  notes TEXT,
  lead_id TEXT,
  job_id TEXT,
  pdf_url TEXT,
  created_by TEXT,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- 7. INVOICES
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  base44_id TEXT UNIQUE,
  invoice_number TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_address TEXT,
  line_items JSONB,
  subtotal NUMERIC,
  tax_rate NUMERIC,
  tax_amount NUMERIC,
  total NUMERIC NOT NULL,
  status TEXT DEFAULT 'Draft',
  due_date TIMESTAMPTZ,
  payment_terms TEXT,
  notes TEXT,
  proposal_id TEXT,
  lead_id TEXT,
  created_by TEXT,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- 8. OUTREACH EMAILS
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS outreach_emails (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  base44_id TEXT UNIQUE,
  to_email TEXT NOT NULL,
  to_name TEXT,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT DEFAULT 'Draft',
  email_type TEXT,
  lead_id TEXT,
  gc_id TEXT,
  campaign_stage INT DEFAULT 0,
  campaign_id TEXT,
  send_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  notes TEXT,
  created_by TEXT,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- 9. SCHEDULED CALLS
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS scheduled_calls (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  base44_id TEXT UNIQUE,
  title TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  phone_number TEXT,
  email TEXT,
  scheduled_time TIMESTAMPTZ NOT NULL,
  call_type TEXT,
  status TEXT DEFAULT 'Scheduled',
  talking_points TEXT,
  call_script TEXT,
  outcome TEXT,
  lead_id TEXT,
  duration_minutes INT,
  created_by TEXT,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- 10. AGENT TASKS
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS agent_tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  base44_id TEXT UNIQUE,
  task_description TEXT NOT NULL,
  task_type TEXT,
  status TEXT DEFAULT 'Queued',
  priority TEXT DEFAULT 'Medium',
  scheduled_for TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  result TEXT,
  error TEXT,
  related_entity_type TEXT,
  related_entity_id TEXT,
  created_by TEXT,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- 11. AGENT JOBS
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS agent_jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  base44_id TEXT UNIQUE,
  agent_type TEXT NOT NULL,
  job_description TEXT NOT NULL,
  goal TEXT,
  status TEXT DEFAULT 'queued',
  priority INT DEFAULT 5,
  step_current INT DEFAULT 0,
  step_total INT DEFAULT 0,
  retry_count INT DEFAULT 0,
  max_retries INT DEFAULT 3,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  result TEXT,
  error TEXT,
  trigger_source TEXT DEFAULT 'manual',
  parent_job_id TEXT,
  execution_log JSONB,
  memory_context TEXT,
  tool_calls JSONB,
  live_output TEXT,
  created_by TEXT,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- 12. AGENT ACTIVITY LOG
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS agent_activity (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  base44_id TEXT UNIQUE,
  agent_type TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details TEXT,
  metadata JSONB,
  created_by TEXT,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- 13. CALENDAR EVENTS
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  base44_id TEXT UNIQUE,
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  color TEXT DEFAULT '#d4af37',
  description TEXT,
  project_type TEXT DEFAULT 'Custom',
  project_id TEXT,
  project_label TEXT,
  ai_generated BOOLEAN DEFAULT FALSE,
  ai_notes TEXT,
  created_by TEXT,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- 14. KNOWLEDGE BASE
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  base44_id TEXT UNIQUE,
  title TEXT NOT NULL,
  category TEXT,
  content TEXT,
  raw_content TEXT,
  source_url TEXT,
  file_url TEXT,
  tags TEXT,
  ai_summary TEXT,
  key_facts JSONB,
  keywords_extracted TEXT,
  quality_score INT,
  status TEXT DEFAULT 'Raw',
  created_by TEXT,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- 15. SEO CONTENT
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS seo_content (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  base44_id TEXT UNIQUE,
  title TEXT NOT NULL,
  content_type TEXT,
  platform TEXT,
  body TEXT,
  target_keywords TEXT,
  meta_title TEXT,
  meta_description TEXT,
  image_url TEXT,
  video_url TEXT,
  status TEXT DEFAULT 'Draft',
  publish_date TIMESTAMPTZ,
  campaign TEXT,
  created_by TEXT,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- 16. SEO KEYWORDS
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS seo_keywords (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  base44_id TEXT UNIQUE,
  keyword TEXT NOT NULL,
  search_volume INT,
  difficulty INT,
  current_position INT,
  target_position INT,
  page_targeting TEXT,
  last_checked TIMESTAMPTZ,
  movement_30_days INT,
  opportunity_score INT,
  content_status TEXT DEFAULT 'no_content',
  intent TEXT DEFAULT 'informational',
  cluster TEXT,
  created_by TEXT,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- 17. SEO COMPETITORS
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS seo_competitors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  base44_id TEXT UNIQUE,
  company_name TEXT NOT NULL,
  website_url TEXT NOT NULL,
  keywords TEXT,
  top_pages JSONB,
  social_profiles JSONB,
  content_strategy TEXT,
  strengths TEXT,
  weaknesses TEXT,
  last_scraped TIMESTAMPTZ,
  domain_authority INT,
  monthly_traffic TEXT,
  ad_spend_estimate TEXT,
  notes TEXT,
  status TEXT DEFAULT 'Active',
  created_by TEXT,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- 18. WORKFLOWS
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS workflows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  base44_id TEXT UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  steps JSONB,
  status TEXT DEFAULT 'Draft',
  trigger_type TEXT,
  last_run TIMESTAMPTZ,
  run_count INT DEFAULT 0,
  notes TEXT,
  created_by TEXT,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- 19. SCRAPE JOBS
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS scrape_jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  base44_id TEXT UNIQUE,
  name TEXT NOT NULL,
  keywords TEXT,
  urls TEXT,
  industry TEXT,
  location TEXT,
  category TEXT DEFAULT 'Company Research',
  destination TEXT DEFAULT 'Local',
  mode TEXT DEFAULT 'Single',
  schedule TEXT DEFAULT 'Manual',
  is_active BOOLEAN DEFAULT TRUE,
  last_run TIMESTAMPTZ,
  run_count INT DEFAULT 0,
  results_count INT DEFAULT 0,
  status TEXT DEFAULT 'Idle',
  created_by TEXT,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- 20. CRAWL RESULTS
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS crawl_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  base44_id TEXT UNIQUE,
  url TEXT NOT NULL,
  domain TEXT NOT NULL,
  crawl_date TIMESTAMPTZ,
  content_hash TEXT,
  content_type TEXT DEFAULT 'other',
  raw_content TEXT,
  processed_content TEXT,
  diff_from_previous TEXT,
  new_keywords_found TEXT,
  lead_generated_id TEXT,
  competitor_intel_extracted JSONB,
  status TEXT DEFAULT 'pending',
  created_by TEXT,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- 21. RESEARCH RESULTS
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS research_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  base44_id TEXT UNIQUE,
  query TEXT NOT NULL,
  source_url TEXT,
  title TEXT,
  raw_content TEXT,
  ai_summary TEXT,
  ai_insights TEXT,
  key_data_points JSONB,
  category TEXT,
  status TEXT DEFAULT 'Pending',
  tags TEXT,
  lead_id TEXT,
  stored_to TEXT,
  created_by TEXT,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- 22. BID DOCUMENTS
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS bid_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  base44_id TEXT UNIQUE,
  job_id TEXT,
  title TEXT NOT NULL,
  bid_type TEXT,
  content TEXT,
  pdf_url TEXT,
  total_amount NUMERIC,
  status TEXT DEFAULT 'Draft',
  submitted_at TIMESTAMPTZ,
  notes TEXT,
  created_by TEXT,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- 23. BUSINESS PLANS
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS business_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  base44_id TEXT UNIQUE,
  title TEXT NOT NULL,
  executive_summary TEXT,
  market_analysis TEXT,
  services_offered TEXT,
  target_market TEXT,
  competitive_advantage TEXT,
  financial_projections TEXT,
  marketing_strategy TEXT,
  operations_plan TEXT,
  status TEXT DEFAULT 'Draft',
  notes TEXT,
  created_by TEXT,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- 24. SYSTEM AUDIT LOG
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS system_audit_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- INDEXES FOR PERFORMANCE
-- ═══════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_state ON leads(state);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_company_trgm ON leads USING gin(company gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_leads_base44 ON leads(base44_id);

CREATE INDEX IF NOT EXISTS idx_jobs_phase ON commercial_jobs(project_phase);
CREATE INDEX IF NOT EXISTS idx_jobs_state ON commercial_jobs(state);
CREATE INDEX IF NOT EXISTS idx_jobs_type ON commercial_jobs(project_type);
CREATE INDEX IF NOT EXISTS idx_jobs_base44 ON commercial_jobs(base44_id);

CREATE INDEX IF NOT EXISTS idx_intel_category ON intel_records(category);
CREATE INDEX IF NOT EXISTS idx_intel_source ON intel_records(source_company);
CREATE INDEX IF NOT EXISTS idx_intel_title_trgm ON intel_records USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_intel_base44 ON intel_records(base44_id);

CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_emails_status ON outreach_emails(status);
CREATE INDEX IF NOT EXISTS idx_agent_jobs_status ON agent_jobs(status);
CREATE INDEX IF NOT EXISTS idx_scrape_jobs_status ON scrape_jobs(status);
CREATE INDEX IF NOT EXISTS idx_crawl_status ON crawl_results(status);
CREATE INDEX IF NOT EXISTS idx_audit_action ON system_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_user ON system_audit_log(user_email);

-- ═══════════════════════════════════════
-- UPDATED_AT TRIGGER FUNCTION
-- ═══════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all major tables
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'xps_users','leads','commercial_jobs','contractor_companies','intel_records',
    'proposals','invoices','outreach_emails','scheduled_calls','agent_tasks',
    'agent_jobs','calendar_events','knowledge_base','seo_content','seo_keywords',
    'seo_competitors','workflows','scrape_jobs','crawl_results','research_results',
    'bid_documents','business_plans'
  ]) LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS update_%s_updated_at ON %I', t, t);
    EXECUTE format('CREATE TRIGGER update_%s_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t, t);
  END LOOP;
END;
$$;

-- ═══════════════════════════════════════
-- EXEC_SQL helper for remote DDL
-- ═══════════════════════════════════════
CREATE OR REPLACE FUNCTION exec_sql(query TEXT)
RETURNS JSONB AS $$
BEGIN
  EXECUTE query;
  RETURN '{"status":"ok"}'::JSONB;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('status','error','message',SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════
-- DASHBOARD STATS RPC
-- ═══════════════════════════════════════
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_leads', (SELECT count(*) FROM leads),
    'active_leads', (SELECT count(*) FROM leads WHERE stage NOT IN ('Won','Lost','Dormant')),
    'total_jobs', (SELECT count(*) FROM commercial_jobs),
    'active_jobs', (SELECT count(*) FROM commercial_jobs WHERE project_phase NOT IN ('complete','lost')),
    'total_proposals', (SELECT count(*) FROM proposals),
    'pending_proposals', (SELECT count(*) FROM proposals WHERE status IN ('Draft','Sent','Viewed')),
    'total_invoices', (SELECT count(*) FROM invoices),
    'unpaid_invoices', (SELECT count(*) FROM invoices WHERE status NOT IN ('Paid','Cancelled')),
    'total_intel', (SELECT count(*) FROM intel_records),
    'total_agents', (SELECT count(*) FROM agent_jobs),
    'running_agents', (SELECT count(*) FROM agent_jobs WHERE status IN ('running','planning')),
    'total_emails_sent', (SELECT count(*) FROM outreach_emails WHERE status = 'Sent'),
    'pipeline_value', (SELECT COALESCE(sum(estimated_value),0) FROM leads WHERE stage NOT IN ('Won','Lost','Dormant'))
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════
-- SEARCH FUNCTION (full-text)
-- ═══════════════════════════════════════
CREATE OR REPLACE FUNCTION search_all(search_term TEXT, result_limit INT DEFAULT 20)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'leads', (SELECT COALESCE(jsonb_agg(jsonb_build_object('id',id,'company',company,'contact_name',contact_name,'stage',stage,'score',score)), '[]'::jsonb) FROM (SELECT * FROM leads WHERE company ILIKE '%' || search_term || '%' OR contact_name ILIKE '%' || search_term || '%' LIMIT result_limit) sub),
    'jobs', (SELECT COALESCE(jsonb_agg(jsonb_build_object('id',id,'job_name',job_name,'city',city,'state',state,'project_phase',project_phase)), '[]'::jsonb) FROM (SELECT * FROM commercial_jobs WHERE job_name ILIKE '%' || search_term || '%' OR city ILIKE '%' || search_term || '%' LIMIT result_limit) sub),
    'intel', (SELECT COALESCE(jsonb_agg(jsonb_build_object('id',id,'title',title,'category',category,'source_company',source_company)), '[]'::jsonb) FROM (SELECT * FROM intel_records WHERE title ILIKE '%' || search_term || '%' OR tags ILIKE '%' || search_term || '%' LIMIT result_limit) sub),
    'contractors', (SELECT COALESCE(jsonb_agg(jsonb_build_object('id',id,'company_name',company_name,'city',city,'state',state)), '[]'::jsonb) FROM (SELECT * FROM contractor_companies WHERE company_name ILIKE '%' || search_term || '%' LIMIT result_limit) sub)
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;

// ═══════════════════════════════════════════════════════════
// STORAGE BUCKET DEFINITIONS
// ═══════════════════════════════════════════════════════════
const STORAGE_BUCKETS = [
  { name: 'proposals', public: false },
  { name: 'invoices', public: false },
  { name: 'bid-documents', public: false },
  { name: 'site-photos', public: true },
  { name: 'brand-assets', public: true },
  { name: 'knowledge-files', public: false },
  { name: 'media', public: true },
  { name: 'exports', public: false },
];

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (user?.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { action } = body;

  // ═══════════════════════════════════════
  // ACTION: GET FULL SQL SCHEMA
  // ═══════════════════════════════════════
  if (action === 'get_schema_sql') {
    return Response.json({
      sql: SCHEMA_SQL,
      tables_count: 24,
      instructions: [
        '1. Go to your Supabase Dashboard → SQL Editor',
        '2. Create a new query',
        '3. Paste the entire SQL below and click Run',
        '4. This creates 24 tables, indexes, triggers, and 3 RPC functions',
        '5. After running, come back here and click "Verify Setup"',
      ],
      buckets: STORAGE_BUCKETS,
      rpc_functions: ['exec_sql', 'get_dashboard_stats', 'search_all'],
    });
  }

  // ═══════════════════════════════════════
  // ACTION: TRY AUTO-PROVISION (via exec_sql RPC)
  // ═══════════════════════════════════════
  if (action === 'auto_provision') {
    // Split SQL into individual statements and execute
    const statements = SCHEMA_SQL.split(';').map(s => s.trim()).filter(s => s.length > 5 && !s.startsWith('--'));
    const results = [];
    let success = 0;
    let failed = 0;

    for (const stmt of statements) {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: stmt + ';' }),
        });
        const data = await res.json().catch(() => null);
        if (res.ok && data?.status !== 'error') {
          success++;
          results.push({ status: 'ok', stmt: stmt.slice(0, 80) });
        } else {
          failed++;
          results.push({ status: 'error', stmt: stmt.slice(0, 80), error: data?.message || `HTTP ${res.status}` });
        }
      } catch (e) {
        failed++;
        results.push({ status: 'error', stmt: stmt.slice(0, 80), error: e.message });
      }
    }

    return Response.json({ success, failed, total: statements.length, results: results.slice(0, 50) });
  }

  // ═══════════════════════════════════════
  // ACTION: CREATE STORAGE BUCKETS
  // ═══════════════════════════════════════
  if (action === 'create_buckets') {
    const results = [];
    for (const bucket of STORAGE_BUCKETS) {
      const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: bucket.name, name: bucket.name, public: bucket.public }),
      });
      const data = await res.json().catch(() => null);
      results.push({ bucket: bucket.name, public: bucket.public, status: res.ok ? 'created' : 'exists_or_error', detail: data });
    }
    return Response.json({ results });
  }

  // ═══════════════════════════════════════
  // ACTION: VERIFY SETUP
  // ═══════════════════════════════════════
  if (action === 'verify') {
    const expected_tables = [
      'xps_users','leads','commercial_jobs','contractor_companies','intel_records',
      'proposals','invoices','outreach_emails','scheduled_calls','agent_tasks',
      'agent_jobs','agent_activity','calendar_events','knowledge_base','seo_content',
      'seo_keywords','seo_competitors','workflows','scrape_jobs','crawl_results',
      'research_results','bid_documents','business_plans','system_audit_log'
    ];

    // Check tables
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    });
    const spec = await res.json();
    const existing = spec.definitions ? Object.keys(spec.definitions) : [];

    const found = [];
    const missing = [];
    for (const t of expected_tables) {
      if (existing.includes(t)) found.push(t);
      else missing.push(t);
    }

    // Check RPC functions
    const rpc_checks = {};
    for (const fn of ['get_dashboard_stats', 'search_all', 'exec_sql']) {
      try {
        const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
          method: 'POST',
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(fn === 'search_all' ? { search_term: 'test' } : fn === 'exec_sql' ? { query: 'SELECT 1' } : {}),
        });
        rpc_checks[fn] = r.ok ? 'available' : 'error';
      } catch {
        rpc_checks[fn] = 'error';
      }
    }

    // Check storage
    const storageRes = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    });
    const buckets = await storageRes.json().catch(() => []);
    const bucketNames = Array.isArray(buckets) ? buckets.map(b => b.name) : [];

    const readiness = missing.length === 0 ? 'READY' : missing.length <= 5 ? 'PARTIAL' : 'NOT_SETUP';

    return Response.json({
      readiness,
      tables: { found: found.length, missing: missing.length, missing_list: missing, total_expected: expected_tables.length },
      rpc_functions: rpc_checks,
      storage: { buckets: bucketNames, expected: STORAGE_BUCKETS.map(b => b.name) },
      extra_tables: existing.filter(t => !expected_tables.includes(t)),
    });
  }

  // ═══════════════════════════════════════
  // ACTION: FULL SYNC ALL ENTITIES → SUPABASE
  // ═══════════════════════════════════════
  if (action === 'full_sync') {
    const ENTITY_TABLE_MAP = {
      'Lead': 'leads',
      'CommercialJob': 'commercial_jobs',
      'ContractorCompany': 'contractor_companies',
      'IntelRecord': 'intel_records',
      'Proposal': 'proposals',
      'Invoice': 'invoices',
      'OutreachEmail': 'outreach_emails',
      'ScheduledCall': 'scheduled_calls',
      'AgentTask': 'agent_tasks',
      'AgentJob': 'agent_jobs',
      'CalendarEvent': 'calendar_events',
      'KnowledgeBase': 'knowledge_base',
      'SEOContent': 'seo_content',
      'SEOKeyword': 'seo_keywords',
      'SEOCompetitor': 'seo_competitors',
      'Workflow': 'workflows',
      'ScrapeJob': 'scrape_jobs',
      'CrawlResult': 'crawl_results',
      'ResearchResult': 'research_results',
      'BusinessPlan': 'business_plans',
    };

    const report = {};
    for (const [entityName, tableName] of Object.entries(ENTITY_TABLE_MAP)) {
      try {
        const records = await base44.asServiceRole.entities[entityName].filter({});
        if (!records || records.length === 0) {
          report[entityName] = { status: 'empty', count: 0, table: tableName };
          continue;
        }

        const batch = records.map(r => {
          const row = { base44_id: String(r.id), synced_at: new Date().toISOString() };
          for (const [k, v] of Object.entries(r)) {
            if (k === 'id') continue;
            if (k === 'date' && tableName === 'calendar_events') { row['event_date'] = v; continue; }
            if (typeof v === 'object' && v !== null) row[k] = JSON.stringify(v);
            else row[k] = v;
          }
          return row;
        });

        // Upsert in batches of 200
        let synced = 0;
        const errors = [];
        for (let i = 0; i < batch.length; i += 200) {
          const chunk = batch.slice(i, i + 200);
          const res = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'resolution=merge-duplicates,return=minimal',
            },
            body: JSON.stringify(chunk),
          });
          if (res.ok) synced += chunk.length;
          else {
            const err = await res.json().catch(() => null);
            errors.push({ batch: i, status: res.status, error: err?.message || err?.details || 'Unknown' });
          }
        }

        report[entityName] = { status: errors.length ? 'partial' : 'synced', count: records.length, synced, table: tableName, errors };
      } catch (e) {
        report[entityName] = { status: 'error', table: tableName, error: e.message };
      }
    }

    return Response.json({ report, total_entities: Object.keys(ENTITY_TABLE_MAP).length });
  }

  return Response.json({ error: `Unknown action: ${action}`, available: ['get_schema_sql', 'auto_provision', 'create_buckets', 'verify', 'full_sync'] }, { status: 400 });
});