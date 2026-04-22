# Complete Migration Checklist: Base44 → Vercel + Supabase

## 1. ENVIRONMENT SETUP

### Vercel
```bash
npm i -g vercel
vercel link  # Link to your Vercel project
vercel env pull  # Pull existing secrets
```

**Required `.env.local` variables:**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
GROQ_API_KEY=your_groq_api_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_OAUTH_CLIENT_ID=your_google_oauth_id
```

### Supabase
1. **Create Supabase project:** https://supabase.com → New project
2. **Get credentials:**
   - Go to Settings → API
   - Copy `Project URL` (VITE_SUPABASE_URL)
   - Copy `Anon Key` (VITE_SUPABASE_ANON_KEY)
   - Copy `Service Role Key` (for backend functions)

---

## 2. SUPABASE TABLE SCHEMA

Create these tables in Supabase SQL Editor (`https://your-project.supabase.co/sql/new`):

### Core Tables

```sql
-- LEADS
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  location TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  vertical TEXT,
  specialty TEXT,
  score NUMERIC DEFAULT 0,
  priority NUMERIC DEFAULT 5,
  stage TEXT DEFAULT 'Incoming',
  ai_insight TEXT,
  ai_recommendation TEXT,
  estimated_value NUMERIC DEFAULT 0,
  existing_material TEXT,
  notes TEXT,
  last_contacted TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- CALL LOGS
CREATE TABLE call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  source_type TEXT,
  source_id UUID,
  call_outcome TEXT DEFAULT 'Pending',
  notes TEXT,
  deal_value NUMERIC DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- PROSPECTS
CREATE TABLE prospect_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  state TEXT NOT NULL,
  city TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  specialty TEXT,
  employee_count NUMERIC,
  estimated_revenue NUMERIC,
  cold_call_priority NUMERIC DEFAULT 5,
  cold_call_status TEXT DEFAULT 'Not Contacted',
  enriched BOOLEAN DEFAULT false,
  last_contacted TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- COMMERCIAL JOBS
CREATE TABLE commercial_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  address TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  project_type TEXT,
  total_sqft NUMERIC,
  flooring_sqft NUMERIC,
  project_phase TEXT DEFAULT 'discovered',
  bid_status TEXT DEFAULT 'not_started',
  estimated_flooring_value NUMERIC,
  gc_name TEXT,
  gc_email TEXT,
  owner_email TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- PROPOSALS
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  client_name TEXT NOT NULL,
  service_type TEXT,
  total_value NUMERIC NOT NULL,
  status TEXT DEFAULT 'Draft',
  lead_id UUID REFERENCES leads(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- BID DOCUMENTS
CREATE TABLE bid_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES commercial_jobs(id),
  project_name TEXT NOT NULL,
  total_bid_value NUMERIC,
  send_status TEXT DEFAULT 'draft',
  bid_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- OUTREACH EMAILS
CREATE TABLE outreach_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email TEXT NOT NULL,
  to_name TEXT,
  subject TEXT NOT NULL,
  body TEXT,
  status TEXT DEFAULT 'Draft',
  lead_id UUID REFERENCES leads(id),
  sent_at TIMESTAMP,
  opened_at TIMESTAMP,
  replied_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- MESSAGE TEMPLATES
CREATE TABLE message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  channel TEXT DEFAULT 'Email',
  category TEXT,
  subject TEXT,
  body TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- WORKFLOWS
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'Active',
  trigger_type TEXT,
  actions JSONB,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_leads_stage ON leads(stage);
CREATE INDEX idx_leads_score ON leads(score DESC);
CREATE INDEX idx_call_logs_outcome ON call_logs(call_outcome);
CREATE INDEX idx_prospects_status ON prospect_companies(cold_call_status);
CREATE INDEX idx_jobs_phase ON commercial_jobs(project_phase);
```

---

## 3. MIGRATION STEPS

### Step 1: Export Data from Base44
1. Go to `/migration` page in app
2. Click "CSV" for each entity to download backups
3. Click "Push to Supabase" to auto-migrate (one entity at a time, start with small ones)

### Step 2: Verify Data in Supabase
- Open Supabase dashboard → SQL Editor
- Run: `SELECT COUNT(*) FROM leads;` (verify record counts)

### Step 3: Update Frontend to Use Supabase
Replace all:
```javascript
// OLD
import { base44 } from '@/api/base44Client';
const leads = await base44.entities.Lead.list();

// NEW
import { supabaseEntities as entities } from '@/lib/supabaseClient';
const leads = await entities.Lead.list();
```

### Step 4: Deploy Vercel Function
```bash
# Functions are auto-deployed, but test locally:
npm run build
vercel functions --logs groqEnrichLead
```

### Step 5: Switch Groq Enrichment
Replace all:
```javascript
// OLD
await base44.integrations.Core.InvokeLLM({ prompt, model: 'gpt_5_mini' });

// NEW
const res = await fetch('https://your-app.vercel.app/api/groqEnrichLead', {
  method: 'POST',
  body: JSON.stringify({ lead_id, company, contact_name, ... })
});
const { enrichment } = await res.json();
```

---

## 4. REQUIRED SERVICES & COSTS

| Service | Purpose | Cost | Setup |
|---|---|---|---|
| **Vercel** | Frontend hosting + Functions | $0–$20/mo | Already have token |
| **Supabase** | Database + Auth + Storage | $25/mo (Pro) | Create project |
| **Groq** | Lead enrichment LLM | ~$0.01/query | Already have API key |
| **Google OAuth** | User login | Free (your credentials) | Already have keys |
| **Custom Domain** (optional) | Professional URL | $12/yr | Add in Vercel Settings |

**Total: ~$25–50/month vs. $500 Base44**

---

## 5. AUTHENTICATION (Supabase Auth)

Replace Base44 auth with Supabase:

```javascript
import { supabaseClient } from '@/lib/supabaseClient';

// Sign up
const { data, error } = await supabaseClient.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password'
});

// Sign in
const { data, error } = await supabaseClient.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// Get current user
const { data: { user } } = await supabaseClient.auth.getUser();
```

---

## 6. SCHEDULED JOBS (Replacement for Base44 Automations)

### Option A: Vercel Cron (Built-in, easiest)
```javascript
// api/cron/daily-enrichment.js
export const config = {
  runtime: 'nodejs18.x',
};

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Your logic here
  res.status(200).json({ ok: true });
}
```

Then in `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/daily-enrichment",
    "schedule": "0 7 * * *"
  }]
}
```

### Option B: Inngest (Recommended for complex workflows)
```bash
npm install inngest
```

```javascript
// functions/enrichment-job.js
import { inngest } from '@/lib/inngest';

export const enrichmentJob = inngest.createFunction(
  { id: 'enrich-daily' },
  { cron: 'TZ=America/New_York 0 7 * * *' },
  async ({ step }) => {
    const leads = await step.run('fetch-leads', async () => {
      const { data } = await supabaseClient.from('leads').select('*').is('ai_insight', null).limit(10);
      return data;
    });

    for (const lead of leads) {
      await step.run(`enrich-${lead.id}`, async () => {
        const res = await fetch('https://your-app.vercel.app/api/groqEnrichLead', {
          method: 'POST',
          body: JSON.stringify({ lead_id: lead.id, company: lead.company })
        });
        return res.json();
      });
    }
  }
);
```

---

## 7. FILE STORAGE (Replacement for Base44 Storage)

Use Supabase Storage:

```javascript
// Upload file
const { data, error } = await supabaseClient.storage
  .from('documents')
  .upload(`bid-${Date.now()}.pdf`, file);

// Download file
const { data, error } = await supabaseClient.storage
  .from('documents')
  .download(`bid-123.pdf`);
```

---

## 8. VERCEL DEPLOYMENT

```bash
# Deploy to Vercel
vercel deploy --prod

# Set environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add GROQ_API_KEY
```

---

## 9. FINAL CHECKLIST

- [ ] Supabase project created and tables imported
- [ ] All data exported from Base44 and pushed to Supabase
- [ ] Frontend updated to use `supabaseEntities` instead of `base44.entities`
- [ ] Authentication switched to Supabase Auth
- [ ] Groq enrichment function deployed and tested
- [ ] Scheduled jobs set up (Vercel Cron or Inngest)
- [ ] File storage switched to Supabase Storage
- [ ] Environment variables set in Vercel
- [ ] App deployed to Vercel
- [ ] Data verified in production
- [ ] Base44 account cancelled

---

## 10. SUPPORT & DEBUGGING

**If Supabase queries fail:**
- Check RLS policies: Settings → Authentication → Policies
- Default: public read/write. For production, restrict to authenticated users:
  ```sql
  CREATE POLICY "Enable read for authenticated" ON leads
    FOR SELECT USING (auth.role() = 'authenticated');
  ```

**If Groq enrichment is slow:**
- Use `mixtral-8x7b-32768` (faster than llama2)
- Reduce `max_tokens` to 300

**If Vercel Function times out:**
- Increase timeout in `vercel.json`: `{ "functions": { "api/**": { "maxDuration": 60 } } }`

---

**You're now independent of Base44. Welcome to owning your own infrastructure!**