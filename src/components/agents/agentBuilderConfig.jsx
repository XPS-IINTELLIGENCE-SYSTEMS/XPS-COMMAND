// All capability categories for the agent builder

export const BRAIN_MODELS = [
  { id: "gpt_5_mini", label: "GPT-5 Mini", desc: "Fast, affordable" },
  { id: "gpt_5", label: "GPT-5", desc: "High quality" },
  { id: "gpt_5_4", label: "GPT-5.4", desc: "Premium quality" },
  { id: "gemini_3_flash", label: "Gemini 3 Flash", desc: "Fast + web search" },
  { id: "gemini_3_1_pro", label: "Gemini 3.1 Pro", desc: "Pro + web search" },
  { id: "claude_sonnet_4_6", label: "Claude Sonnet 4.6", desc: "Strong reasoning" },
  { id: "claude_opus_4_6", label: "Claude Opus 4.6", desc: "Max capability" },
  { id: "claude_opus_4_7", label: "Claude Opus 4.7", desc: "Latest Opus" },
  { id: "groq_llama", label: "Groq LLaMA", desc: "Ultra-fast inference" },
  { id: "ollama_local", label: "Ollama Local", desc: "Self-hosted models" },
];

export const CAPABILITY_CATEGORIES = [
  {
    category: "Core Intelligence",
    items: [
      { id: "browser", label: "Browser", desc: "Web browsing & navigation" },
      { id: "headless", label: "Headless Browser", desc: "Headless Chrome automation" },
      { id: "shadow_scraper", label: "Shadow Scraper", desc: "Stealth scraping engine" },
      { id: "scraper", label: "Web Scraper", desc: "Data extraction from sites" },
      { id: "memory", label: "Persistent Memory", desc: "Long-term context recall" },
      { id: "knowledge_base", label: "Knowledge Base", desc: "Access uploaded knowledge" },
    ],
  },
  {
    category: "Automation & Workflow",
    items: [
      { id: "ui_automation", label: "UI/UX Automation", desc: "Automate UI interactions" },
      { id: "workflow_access", label: "Workflow Access", desc: "Run & create workflows" },
      { id: "scheduler", label: "Scheduler", desc: "Time-based task scheduling" },
      { id: "integrations", label: "Integrations", desc: "3rd party service access" },
      { id: "connectors", label: "Connectors", desc: "OAuth connector access" },
    ],
  },
  {
    category: "Data & LLM",
    items: [
      { id: "llm_access", label: "LLM Access", desc: "Call any LLM model" },
      { id: "data_bank", label: "Data Bank", desc: "Read/write to data bank" },
      { id: "all_tools", label: "All System Tools", desc: "Access every tool" },
      { id: "model_access", label: "Model Access", desc: "Switch between AI models" },
    ],
  },
  {
    category: "Creation & Code",
    items: [
      { id: "video_creation", label: "Video Creation", desc: "AI video generation" },
      { id: "image_creation", label: "Image Creation", desc: "AI image generation" },
      { id: "frontend_creation", label: "Frontend Creation", desc: "Generate UI components" },
      { id: "backend_creation", label: "Backend Creation", desc: "Generate backend functions" },
      { id: "nl_coding", label: "Natural Language Coding", desc: "Code from plain English" },
    ],
  },
  {
    category: "Advanced Execution",
    items: [
      { id: "parallel", label: "Parallel Execution", desc: "Run tasks in parallel" },
      { id: "async", label: "Async Operations", desc: "Non-blocking async tasks" },
      { id: "full_autonomous", label: "Full Autonomous", desc: "Operate without approval" },
      { id: "semi_autonomous", label: "Semi-Autonomous", desc: "Operate with checkpoints" },
      { id: "chatbot", label: "Chatbot", desc: "Conversational interface" },
    ],
  },
];

export const ALL_CAPABILITY_IDS = CAPABILITY_CATEGORIES.flatMap(c => c.items.map(i => i.id));