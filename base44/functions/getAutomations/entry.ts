import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return the known automations for the calendar display
    // These are hardcoded from our actual automation setup since there's no
    // automation list API from the frontend
    const automations = [
      {
        id: "lead_scraper",
        name: "Daily Lead Scraper",
        description: "Scrapes 2 random target markets for commercial leads via Browserless + Groq",
        automation_type: "scheduled",
        function_name: "dailyLeadScraper",
        is_active: true,
        is_archived: false,
        repeat_interval: 1,
        repeat_unit: "days",
        start_time: "10:00",
      },
      {
        id: "pipeline_optimizer",
        name: "Daily Pipeline Optimizer",
        description: "Scores leads, auto-advances pipeline stages, flags hot/stale opportunities",
        automation_type: "scheduled",
        function_name: "dailyPipelineOptimizer",
        is_active: true,
        is_archived: false,
        repeat_interval: 1,
        repeat_unit: "days",
        start_time: "11:00",
      },
      {
        id: "contractor_builder",
        name: "Contractor Database Builder",
        description: "Discovers and catalogs top general contractors for bidder list outreach",
        automation_type: "scheduled",
        function_name: "contractorDatabaseBuilder",
        is_active: true,
        is_archived: false,
        repeat_interval: 1,
        repeat_unit: "days",
        start_time: "12:00",
      },
      {
        id: "auto_outreach",
        name: "Auto Outreach Engine",
        description: "Auto-sends SMS to hot leads, follows up on stale bids, delivers queued emails",
        automation_type: "scheduled",
        function_name: "autoOutreachEngine",
        is_active: true,
        is_archived: false,
        repeat_interval: 1,
        repeat_unit: "days",
        start_time: "13:00",
      },
      {
        id: "nightly_enhancer",
        name: "Nightly System Enhancer",
        description: "AI analyzes all metrics, generates recommendations, texts nightly summary",
        automation_type: "scheduled",
        function_name: "nightlySystemEnhancer",
        is_active: true,
        is_archived: false,
        repeat_interval: 1,
        repeat_unit: "days",
        start_time: "02:00",
      },
      {
        id: "follow_up_scanner",
        name: "Daily Follow-Up Scanner",
        description: "Scans for bids sent 5+ days ago and generates follow-up emails",
        automation_type: "scheduled",
        function_name: "outreachFollowUp",
        is_active: true,
        is_archived: false,
        repeat_interval: 1,
        repeat_unit: "days",
        start_time: "13:00",
      },
      {
        id: "health_check",
        name: "Hourly System Health Check",
        description: "Runs auto-diagnose every hour using Groq AI",
        automation_type: "scheduled",
        function_name: "autoHealSystem",
        is_active: true,
        is_archived: false,
        repeat_interval: 1,
        repeat_unit: "hours",
      },
      {
        id: "registry_scraper",
        name: "Weekly Registry Scraper",
        description: "Scrapes state business registries for new flooring companies every Monday",
        automation_type: "scheduled",
        function_name: "registryScraper",
        is_active: true,
        is_archived: false,
        repeat_interval: 1,
        repeat_unit: "weeks",
        repeat_on_days: [1],
        start_time: "05:00",
      },
      {
        id: "join_request_notify",
        name: "Notify Admin on Join Request",
        description: "Sends email and SMS to admin when a new join request is submitted",
        automation_type: "entity",
        function_name: "onJoinRequest",
        entity_name: "JoinRequest",
        event_types: ["create"],
        is_active: true,
        is_archived: false,
      },
    ];

    return Response.json({ automations });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});