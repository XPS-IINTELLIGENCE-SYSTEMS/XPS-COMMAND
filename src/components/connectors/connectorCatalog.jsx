// Full service catalog — every connector with metadata for the hub UI

export const CONNECTOR_CATALOG = [
  // === AI & LLM ===
  { id: "openai", name: "OpenAI", category: "AI & LLM", icon: "🤖", color: "#10a37f", baseUrl: "https://api.openai.com/v1", docsUrl: "https://platform.openai.com/docs", keyLabel: "API Key", keyPlaceholder: "sk-...", desc: "GPT models, DALL·E, Whisper" },
  { id: "anthropic", name: "Anthropic", category: "AI & LLM", icon: "🧠", color: "#d97706", baseUrl: "https://api.anthropic.com/v1", docsUrl: "https://docs.anthropic.com", keyLabel: "API Key", keyPlaceholder: "sk-ant-...", desc: "Claude models" },
  { id: "groq", name: "Groq", category: "AI & LLM", icon: "⚡", color: "#f97316", baseUrl: "https://api.groq.com/openai/v1", docsUrl: "https://console.groq.com/docs", keyLabel: "API Key", keyPlaceholder: "gsk_...", desc: "Ultra-fast LLM inference" },
  { id: "ollama", name: "Ollama", category: "AI & LLM", icon: "🦙", color: "#64748b", baseUrl: "http://localhost:11434", docsUrl: "https://ollama.com", keyLabel: "Server URL", keyPlaceholder: "http://localhost:11434", desc: "Local self-hosted models" },
  { id: "openrouter", name: "OpenRouter", category: "AI & LLM", icon: "🔀", color: "#6366f1", baseUrl: "https://openrouter.ai/api/v1", docsUrl: "https://openrouter.ai/docs", keyLabel: "API Key", keyPlaceholder: "sk-or-...", desc: "Multi-model router" },
  { id: "together_ai", name: "Together AI", category: "AI & LLM", icon: "🤝", color: "#0ea5e9", baseUrl: "https://api.together.xyz/v1", docsUrl: "https://docs.together.ai", keyLabel: "API Key", keyPlaceholder: "tok_...", desc: "Open source model hosting" },
  { id: "mistral", name: "Mistral", category: "AI & LLM", icon: "🌬️", color: "#ff7000", baseUrl: "https://api.mistral.ai/v1", docsUrl: "https://docs.mistral.ai", keyLabel: "API Key", keyPlaceholder: "...", desc: "Mistral AI models" },
  { id: "perplexity", name: "Perplexity", category: "AI & LLM", icon: "🔍", color: "#20b2aa", baseUrl: "https://api.perplexity.ai", docsUrl: "https://docs.perplexity.ai", keyLabel: "API Key", keyPlaceholder: "pplx-...", desc: "AI search & reasoning" },
  { id: "replicate", name: "Replicate", category: "AI & LLM", icon: "🎯", color: "#3b82f6", baseUrl: "https://api.replicate.com/v1", docsUrl: "https://replicate.com/docs", keyLabel: "API Token", keyPlaceholder: "r8_...", desc: "Run open-source models" },
  { id: "heygen", name: "HeyGen", category: "AI & LLM", icon: "🎬", color: "#7c3aed", baseUrl: "https://api.heygen.com/v2", docsUrl: "https://docs.heygen.com", keyLabel: "API Key", keyPlaceholder: "...", desc: "AI video generation" },
  { id: "elevenlabs", name: "ElevenLabs", category: "AI & LLM", icon: "🔊", color: "#000000", baseUrl: "https://api.elevenlabs.io/v1", docsUrl: "https://docs.elevenlabs.io", keyLabel: "API Key", keyPlaceholder: "...", desc: "AI voice & audio" },

  // === Google Cloud ===
  { id: "google_cloud", name: "Google Cloud", category: "Google", icon: "☁️", color: "#4285f4", baseUrl: "https://cloud.google.com", docsUrl: "https://cloud.google.com/docs", keyLabel: "Service Account JSON / API Key", keyPlaceholder: "AIza...", desc: "GCP services & APIs" },
  { id: "google_drive", name: "Google Drive", category: "Google", icon: "📁", color: "#0f9d58", baseUrl: "https://www.googleapis.com/drive/v3", docsUrl: "https://developers.google.com/drive", keyLabel: "OAuth (App Connector)", keyPlaceholder: "Connected via OAuth", desc: "File storage & sharing", isOAuth: true },
  { id: "google_sheets", name: "Google Sheets", category: "Google", icon: "📊", color: "#0f9d58", baseUrl: "https://sheets.googleapis.com/v4", docsUrl: "https://developers.google.com/sheets", keyLabel: "OAuth (App Connector)", keyPlaceholder: "Connected via OAuth", desc: "Spreadsheet automation", isOAuth: true },
  { id: "google_docs", name: "Google Docs", category: "Google", icon: "📄", color: "#4285f4", baseUrl: "https://docs.googleapis.com/v1", docsUrl: "https://developers.google.com/docs", keyLabel: "OAuth (App Connector)", keyPlaceholder: "Connected via OAuth", desc: "Document automation", isOAuth: true },
  { id: "google_tasks", name: "Google Tasks", category: "Google", icon: "✅", color: "#4285f4", baseUrl: "https://tasks.googleapis.com/tasks/v1", docsUrl: "https://developers.google.com/tasks", keyLabel: "OAuth (App Connector)", keyPlaceholder: "Connected via OAuth", desc: "Task management", isOAuth: true },
  { id: "google_calendar", name: "Google Calendar", category: "Google", icon: "📅", color: "#4285f4", baseUrl: "https://www.googleapis.com/calendar/v3", docsUrl: "https://developers.google.com/calendar", keyLabel: "OAuth (App Connector)", keyPlaceholder: "Connected via OAuth", desc: "Calendar sync", isOAuth: true },
  { id: "gmail", name: "Gmail", category: "Google", icon: "📧", color: "#ea4335", baseUrl: "https://gmail.googleapis.com/gmail/v1", docsUrl: "https://developers.google.com/gmail", keyLabel: "OAuth (App Connector)", keyPlaceholder: "Connected via OAuth", desc: "Email automation", isOAuth: true },
  { id: "google_keep", name: "Google Keep", category: "Google", icon: "📝", color: "#fbbc04", baseUrl: "https://keep.googleapis.com/v1", docsUrl: "https://developers.google.com/keep", keyLabel: "API Key", keyPlaceholder: "AIza...", desc: "Notes & lists (limited API)" },

  // === Infrastructure & Database ===
  { id: "supabase", name: "Supabase", category: "Infrastructure", icon: "⚡", color: "#3ecf8e", baseUrl: "", docsUrl: "https://supabase.com/docs", keyLabel: "Anon Key", keyPlaceholder: "eyJ...", secondaryLabel: "Service Role Key", desc: "Postgres DB & auth" },
  { id: "redis", name: "Redis", category: "Infrastructure", icon: "🔴", color: "#dc382d", baseUrl: "", docsUrl: "https://redis.io/docs", keyLabel: "Connection URL", keyPlaceholder: "redis://...", desc: "In-memory cache & pub/sub" },
  { id: "neon", name: "Neon", category: "Infrastructure", icon: "🟢", color: "#00e599", baseUrl: "https://console.neon.tech/api/v2", docsUrl: "https://neon.tech/docs", keyLabel: "API Key", keyPlaceholder: "...", desc: "Serverless Postgres" },
  { id: "aws", name: "AWS", category: "Infrastructure", icon: "☁️", color: "#ff9900", baseUrl: "https://aws.amazon.com", docsUrl: "https://docs.aws.amazon.com", keyLabel: "Access Key ID", keyPlaceholder: "AKIA...", secondaryLabel: "Secret Access Key", desc: "Amazon Web Services" },
  { id: "vercel", name: "Vercel", category: "Infrastructure", icon: "▲", color: "#000000", baseUrl: "https://api.vercel.com", docsUrl: "https://vercel.com/docs/rest-api", keyLabel: "API Token", keyPlaceholder: "...", desc: "Deployment & hosting" },
  { id: "base44", name: "Base44", category: "Infrastructure", icon: "🔷", color: "#6366f1", baseUrl: "https://app.base44.com/api", docsUrl: "https://docs.base44.com", keyLabel: "API Key", keyPlaceholder: "b44_...", desc: "This platform's API" },

  // === Developer Tools ===
  { id: "github", name: "GitHub", category: "Dev Tools", icon: "🐙", color: "#333333", baseUrl: "https://api.github.com", docsUrl: "https://docs.github.com/en/rest", keyLabel: "Personal Access Token", keyPlaceholder: "ghp_...", desc: "Repos, issues, CI/CD" },
  { id: "steel_dev", name: "Steel.dev", category: "Dev Tools", icon: "🦾", color: "#1e40af", baseUrl: "https://api.steel.dev/v1", docsUrl: "https://docs.steel.dev", keyLabel: "API Key", keyPlaceholder: "...", desc: "Browser automation API" },
  { id: "browserless", name: "Browserless", category: "Dev Tools", icon: "🌐", color: "#059669", baseUrl: "https://chrome.browserless.io", docsUrl: "https://www.browserless.io/docs", keyLabel: "API Token", keyPlaceholder: "...", desc: "Headless Chrome as a service" },
  { id: "apify", name: "Apify", category: "Dev Tools", icon: "🕷️", color: "#97d700", baseUrl: "https://api.apify.com/v2", docsUrl: "https://docs.apify.com", keyLabel: "API Token", keyPlaceholder: "apify_api_...", desc: "Web scraping & automation" },
  { id: "brightdata", name: "Bright Data", category: "Dev Tools", icon: "💡", color: "#4f46e5", baseUrl: "https://api.brightdata.com", docsUrl: "https://docs.brightdata.com", keyLabel: "API Token", keyPlaceholder: "...", desc: "Proxy & data collection" },
  { id: "firecrawl", name: "Firecrawl", category: "Dev Tools", icon: "🔥", color: "#f97316", baseUrl: "https://api.firecrawl.dev/v1", docsUrl: "https://docs.firecrawl.dev", keyLabel: "API Key", keyPlaceholder: "fc-...", desc: "Web crawling & scraping API" },
  { id: "serper", name: "Serper", category: "Dev Tools", icon: "🔎", color: "#3b82f6", baseUrl: "https://google.serper.dev", docsUrl: "https://serper.dev/docs", keyLabel: "API Key", keyPlaceholder: "...", desc: "Google Search API" },
  { id: "tavily", name: "Tavily", category: "Dev Tools", icon: "🧭", color: "#8b5cf6", baseUrl: "https://api.tavily.com", docsUrl: "https://docs.tavily.com", keyLabel: "API Key", keyPlaceholder: "tvly-...", desc: "AI search engine API" },

  // === Communication ===
  { id: "twilio", name: "Twilio", category: "Communication", icon: "📱", color: "#f22f46", baseUrl: "https://api.twilio.com/2010-04-01", docsUrl: "https://www.twilio.com/docs", keyLabel: "Account SID", keyPlaceholder: "AC...", secondaryLabel: "Auth Token", desc: "SMS, voice, messaging" },
  { id: "slack", name: "Slack", category: "Communication", icon: "💬", color: "#4a154b", baseUrl: "https://slack.com/api", docsUrl: "https://api.slack.com/docs", keyLabel: "Bot Token", keyPlaceholder: "xoxb-...", desc: "Team messaging & bots" },
  { id: "sendgrid", name: "SendGrid", category: "Communication", icon: "📨", color: "#1a82e2", baseUrl: "https://api.sendgrid.com/v3", docsUrl: "https://docs.sendgrid.com", keyLabel: "API Key", keyPlaceholder: "SG...", desc: "Transactional email" },

  // === CRM & Sales ===
  { id: "hubspot", name: "HubSpot", category: "CRM & Sales", icon: "🟠", color: "#ff7a59", baseUrl: "https://api.hubapi.com", docsUrl: "https://developers.hubspot.com/docs", keyLabel: "Private App Token / OAuth", keyPlaceholder: "pat-...", desc: "CRM, marketing, sales", isOAuth: true },
  { id: "airtable", name: "Airtable", category: "CRM & Sales", icon: "📋", color: "#18bfff", baseUrl: "https://api.airtable.com/v0", docsUrl: "https://airtable.com/developers/web/api", keyLabel: "Personal Access Token", keyPlaceholder: "pat...", desc: "Flexible database & views" },
  { id: "zoominfo", name: "ZoomInfo", category: "CRM & Sales", icon: "🎯", color: "#6439ff", baseUrl: "https://api.zoominfo.com", docsUrl: "https://api-docs.zoominfo.com", keyLabel: "API Key", keyPlaceholder: "...", desc: "B2B contact database" },
  { id: "apolloio", name: "Apollo.io", category: "CRM & Sales", icon: "🚀", color: "#6366f1", baseUrl: "https://api.apollo.io/api/v1", docsUrl: "https://apolloio.github.io/apollo-api-docs", keyLabel: "API Key", keyPlaceholder: "...", desc: "Sales intelligence" },
  { id: "linkedin", name: "LinkedIn", category: "CRM & Sales", icon: "💼", color: "#0a66c2", baseUrl: "https://api.linkedin.com/v2", docsUrl: "https://learn.microsoft.com/en-us/linkedin/", keyLabel: "Access Token", keyPlaceholder: "...", desc: "Professional network API" },

  // === XPS Internal ===
  { id: "xps_lead_sniper", name: "XPS Lead Sniper", category: "XPS Tools", icon: "🎯", color: "#d4af37", baseUrl: "", docsUrl: "", keyLabel: "Internal Token", keyPlaceholder: "xps_...", desc: "Proprietary lead discovery engine" },

  // === Construction Bid Platforms ===
  { id: "construct_connect", name: "ConstructConnect", category: "Construction", icon: "🏗️", color: "#2563eb", baseUrl: "https://api.constructconnect.com/v1", docsUrl: "https://www.constructconnect.com", keyLabel: "API Key", keyPlaceholder: "...", desc: "Construction project leads" },
  { id: "dodge_reports", name: "Dodge Construction", category: "Construction", icon: "🏢", color: "#16a34a", baseUrl: "https://api.construction.com/v1", docsUrl: "https://www.construction.com", keyLabel: "API Key", keyPlaceholder: "...", desc: "Dodge data & analytics" },
  { id: "planhub", name: "PlanHub", category: "Construction", icon: "📐", color: "#0891b2", baseUrl: "https://api.planhub.com/v1", docsUrl: "https://www.planhub.com", keyLabel: "API Key", keyPlaceholder: "...", desc: "Preconstruction platform" },
  { id: "building_connected", name: "BuildingConnected", category: "Construction", icon: "🔨", color: "#ea580c", baseUrl: "https://app.buildingconnected.com/api", docsUrl: "https://www.buildingconnected.com", keyLabel: "API Key", keyPlaceholder: "...", desc: "Bid management network" },
  { id: "isqft", name: "iSqFt / ConstructConnect", category: "Construction", icon: "📏", color: "#7c3aed", baseUrl: "https://api.isqft.com/v1", docsUrl: "https://www.isqft.com", keyLabel: "API Key", keyPlaceholder: "...", desc: "Subcontractor network" },
  { id: "bidclerk", name: "BidClerk", category: "Construction", icon: "📝", color: "#dc2626", baseUrl: "https://api.bidclerk.com/v1", docsUrl: "https://www.bidclerk.com", keyLabel: "API Key", keyPlaceholder: "...", desc: "Construction bid tracking" },
  { id: "the_blue_book", name: "The Blue Book", category: "Construction", icon: "📘", color: "#1d4ed8", baseUrl: "https://api.thebluebook.com/v1", docsUrl: "https://www.thebluebook.com", keyLabel: "API Key", keyPlaceholder: "...", desc: "Contractor network" },

  // === Government APIs ===
  { id: "sam_gov", name: "SAM.gov", category: "Government", icon: "🏛️", color: "#1e3a5f", baseUrl: "https://api.sam.gov/opportunities/v2", docsUrl: "https://open.gsa.gov/api/get-opportunities-public-api/", keyLabel: "API Key", keyPlaceholder: "...", desc: "Federal contract opportunities" },
  { id: "usaspending", name: "USASpending.gov", category: "Government", icon: "💰", color: "#1e3a5f", baseUrl: "https://api.usaspending.gov/api/v2", docsUrl: "https://api.usaspending.gov", keyLabel: "No Key Required", keyPlaceholder: "(open API)", desc: "Federal spending data" },
  { id: "fpds", name: "FPDS.gov", category: "Government", icon: "📜", color: "#1e3a5f", baseUrl: "https://www.fpds.gov/fpdsng_cms/index.php/en/", docsUrl: "https://www.fpds.gov", keyLabel: "API Key", keyPlaceholder: "...", desc: "Federal procurement data" },
  { id: "fbo_gov", name: "FBO / Contract Opps", category: "Government", icon: "📋", color: "#1e3a5f", baseUrl: "https://api.sam.gov/opportunities/v1", docsUrl: "https://open.gsa.gov", keyLabel: "API Key", keyPlaceholder: "...", desc: "Federal business opportunities" },
  { id: "gsa_ebuy", name: "GSA eBuy", category: "Government", icon: "🛒", color: "#1e3a5f", baseUrl: "https://www.ebuy.gsa.gov/ebuy/", docsUrl: "https://www.gsa.gov/technology", keyLabel: "API Key", keyPlaceholder: "...", desc: "GSA schedule purchasing" },
  { id: "beta_sam", name: "Beta.SAM.gov", category: "Government", icon: "🔍", color: "#1e3a5f", baseUrl: "https://api.sam.gov/entity-information/v3", docsUrl: "https://open.gsa.gov/api/entity-api/", keyLabel: "API Key", keyPlaceholder: "...", desc: "Entity & exclusion data" },
  { id: "grants_gov", name: "Grants.gov", category: "Government", icon: "🎓", color: "#1e3a5f", baseUrl: "https://www.grants.gov/grantsws/rest/opportunities", docsUrl: "https://www.grants.gov/web/grants/search-grants.html", keyLabel: "No Key Required", keyPlaceholder: "(open API)", desc: "Federal grant opportunities" },
  { id: "sbir_gov", name: "SBIR.gov", category: "Government", icon: "🔬", color: "#1e3a5f", baseUrl: "https://www.sbir.gov/api/solicitations.json", docsUrl: "https://www.sbir.gov", keyLabel: "No Key Required", keyPlaceholder: "(open API)", desc: "Small business innovation research" },
  { id: "census_gov", name: "Census.gov", category: "Government", icon: "📊", color: "#1e3a5f", baseUrl: "https://api.census.gov/data", docsUrl: "https://www.census.gov/data/developers.html", keyLabel: "API Key", keyPlaceholder: "...", desc: "US Census data" },
  { id: "data_gov", name: "Data.gov", category: "Government", icon: "📂", color: "#1e3a5f", baseUrl: "https://catalog.data.gov/api/3", docsUrl: "https://www.data.gov/developers/", keyLabel: "API Key", keyPlaceholder: "...", desc: "Federal open data catalog" },

  // === Payments & Other ===
  { id: "stripe", name: "Stripe", category: "Payments", icon: "💳", color: "#635bff", baseUrl: "https://api.stripe.com/v1", docsUrl: "https://stripe.com/docs/api", keyLabel: "Secret Key", keyPlaceholder: "sk_...", desc: "Payment processing" },
  { id: "zapier", name: "Zapier", category: "Automation", icon: "⚡", color: "#ff4a00", baseUrl: "https://hooks.zapier.com", docsUrl: "https://zapier.com/developer", keyLabel: "Webhook URL / API Key", keyPlaceholder: "...", desc: "Workflow automation" },
];

export const CATEGORIES = [...new Set(CONNECTOR_CATALOG.map(c => c.category))];

export const getCatalogEntry = (serviceType) => CONNECTOR_CATALOG.find(c => c.id === serviceType);