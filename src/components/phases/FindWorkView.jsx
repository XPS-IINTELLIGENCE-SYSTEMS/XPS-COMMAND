import { MapPin, Search, Users, Target, TrendingUp, Database, Mail, Send, Phone, MessageSquare, Share2, Clock, ListChecks, CalendarCheck, GitBranch } from "lucide-react";
import WorkflowToolCard from "../shared/WorkflowToolCard";
import WorkflowSection from "../shared/WorkflowSection";
import NavIcon from "../shared/NavIcon";
import ScraperConfigModule from "../pipeline/ScraperConfigModule";

export default function FindWorkView({ onChatCommand }) {
  const fire = (cmd) => {
    if (onChatCommand) onChatCommand(cmd);
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8">
      {/* Phase Header */}
      <div className="text-center pt-4 md:pt-8 pb-8 md:pb-12">
        <div className="shimmer-card inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-primary/30 bg-primary/5 mb-6">
          <NavIcon id="find_work" size="sm" active />
          <span className="text-sm font-semibold text-white">Phase 1 · 15 Tools</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold leading-none xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          FIND WORK
        </h1>
        <p className="mt-4 text-sm md:text-base text-white/60 max-w-xl mx-auto leading-relaxed">
          Click any tool to run it via AI. Your agent will execute immediately.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-10 pb-12">
        <WorkflowSection title="TERRITORY & INTELLIGENCE" subtitle="Discover high-value markets and research prospects before making contact.">
          <WorkflowToolCard num="1.1" label="AI Territory Analyzer" Icon={MapPin} statusBadge="Intel"
            description="Scrapes census data, building permits, and commercial development data by zip code."
            onAction={fire} chatCommand="Analyze the territory for Tampa, FL — find high-value commercial areas" />
          <WorkflowToolCard num="1.2" label="AI Lead Scraper" Icon={Search} statusBadge="Active"
            description="Scrapes Google Maps, Yelp, permit databases, LinkedIn, and industry directories."
            onAction={fire} chatCommand="Find me 25 leads in Tampa, FL" />
          <WorkflowToolCard num="1.3" label="AI Contact Enricher" Icon={Users} statusBadge="Enrichment"
            description="Auto-pulls decision maker names, emails, phones, and LinkedIn profiles."
            onAction={fire} chatCommand="Enrich my top 10 leads with contact details" />
          <WorkflowToolCard num="1.4" label="AI Deep Research" Icon={Target} statusBadge="Research"
            description="Scrapes their website, reviews, social media, recent news, and existing floor photos."
            onAction={fire} chatCommand="Do deep research on my highest scored lead" />
        </WorkflowSection>

        <WorkflowSection title="SCRAPER CONFIGURATION" subtitle="Configure and manage your timed lead scraper jobs.">
          <div className="col-span-full">
            <ScraperConfigModule />
          </div>
        </WorkflowSection>

        <WorkflowSection title="SCORING & ORGANIZATION" subtitle="Let AI rank and organize your leads.">
          <WorkflowToolCard num="1.5" label="AI Lead Scorer" Icon={TrendingUp} statusBadge="Scoring"
            description="Ranks leads by budget indicators, timeline urgency, decision-maker access, and industry fit."
            onAction={fire} chatCommand="Score all my leads" />
          <WorkflowToolCard num="1.6" label="AI Auto-Entry" Icon={Database} statusBadge="Auto"
            description="Leads automatically created in CRM with all enriched data — zero manual entry."
            onAction={fire} chatCommand="Show me all leads sorted by score" />
        </WorkflowSection>

        <WorkflowSection title="OUTREACH & COMMUNICATION" subtitle="Engage leads across every channel with AI-personalized messaging.">
          <WorkflowToolCard num="1.7" label="AI Email Writer" Icon={Mail} statusBadge="Content"
            description="Generates personalized email using lead research and proven templates."
            onAction={fire} chatCommand="Write an outreach email for my top lead" />
          <WorkflowToolCard num="1.8" label="AI Auto-Send" Icon={Send} statusBadge="Delivery"
            description="Sends via integrated email with open/click tracking."
            onAction={fire} chatCommand="Send outreach emails to my top 5 leads" />
          <WorkflowToolCard num="1.9" label="AI Call Prep" Icon={Phone} statusBadge="Voice"
            description="Generates call script with talking points and objection responses."
            onAction={fire} chatCommand="Prepare a call script for my highest scored lead" />
          <WorkflowToolCard num="1.10" label="AI SMS Outreach" Icon={MessageSquare} statusBadge="SMS"
            description="Personalized text from business number with delivery tracking."
            onAction={fire} chatCommand="Send a follow-up SMS to my most recent lead" />
          <WorkflowToolCard num="1.11" label="AI Content Creator" Icon={Share2} statusBadge="Social"
            description="Generates platform-specific posts for Instagram/Facebook/LinkedIn/TikTok."
            onAction={fire} chatCommand="Create a social media post about our epoxy flooring services" />
        </WorkflowSection>

        <WorkflowSection title="FOLLOW-UP & PIPELINE" subtitle="AI manages your sequences, logs conversations, and moves leads forward.">
          <WorkflowToolCard num="1.12" label="AI Follow-Up Engine" Icon={Clock} statusBadge="Automation"
            description="Automated drip sequences across email/text/call with escalation logic."
            onAction={fire} chatCommand="Set up follow-up sequences for all contacted leads" />
          <WorkflowToolCard num="1.13" label="AI Conversation Logger" Icon={ListChecks} statusBadge="Tracking"
            description="All touchpoints auto-logged to lead timeline."
            onAction={fire} chatCommand="Show me the conversation history for my top lead" />
          <WorkflowToolCard num="1.14" label="AI Scheduler" Icon={CalendarCheck} statusBadge="Booking"
            description="Sends booking link synced to your calendar, auto-confirms, sends reminders."
            onAction={fire} chatCommand="Schedule a meeting with my highest scored lead" />
          <WorkflowToolCard num="1.15" label="AI Pipeline Manager" Icon={GitBranch} statusBadge="CRM"
            description="Auto-advances pipeline stage based on activity."
            onAction={fire} chatCommand="Show me my pipeline status and recommendations" />
        </WorkflowSection>
      </div>
    </div>
  );
}