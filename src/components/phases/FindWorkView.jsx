import { MapPin, Search, Users, Target, TrendingUp, Database, Mail, Send, Phone, MessageSquare, Share2, Clock, ListChecks, CalendarCheck, GitBranch } from "lucide-react";
import WorkflowToolCard from "../shared/WorkflowToolCard";
import WorkflowSection from "../shared/WorkflowSection";
import NavIcon from "../shared/NavIcon";

export default function FindWorkView() {
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
          Your AI-powered prospecting engine. These tools work together to identify, research, score, and engage high-value leads — automatically.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-10 pb-12">
        {/* Section 1: Territory & Intelligence */}
        <WorkflowSection title="TERRITORY & INTELLIGENCE" subtitle="Discover high-value markets and research prospects before making contact.">
          <WorkflowToolCard num="1.1" label="AI Territory Analyzer" Icon={MapPin} statusBadge="Intel"
            description="Scrapes census data, building permits, and commercial development data by zip code to identify high-value territories." />
          <WorkflowToolCard num="1.2" label="AI Lead Scraper" Icon={Search} statusBadge="Active"
            description="Scrapes Google Maps, Yelp, permit databases, LinkedIn, and industry directories by region and keywords." />
          <WorkflowToolCard num="1.3" label="AI Contact Enricher" Icon={Users} statusBadge="Enrichment"
            description="Auto-pulls decision maker names, emails, phones, and LinkedIn profiles from multiple data sources." />
          <WorkflowToolCard num="1.4" label="AI Deep Research" Icon={Target} statusBadge="Research"
            description="Scrapes their website, reviews, social media, recent news, building permits, and existing floor photos." />
        </WorkflowSection>

        {/* Section 2: Scoring & Organization */}
        <WorkflowSection title="SCORING & ORGANIZATION" subtitle="Let AI rank and organize your leads so you always work the best opportunities first.">
          <WorkflowToolCard num="1.5" label="AI Lead Scorer" Icon={TrendingUp} statusBadge="Scoring"
            description="Ranks leads by budget indicators, timeline urgency, decision-maker access, square footage, and industry fit." />
          <WorkflowToolCard num="1.6" label="AI Auto-Entry" Icon={Database} statusBadge="Auto"
            description="Leads automatically created in CRM with all enriched data, tagged and scored — zero manual entry." />
        </WorkflowSection>

        {/* Section 3: Outreach & Communication */}
        <WorkflowSection title="OUTREACH & COMMUNICATION" subtitle="Engage leads across every channel with AI-personalized messaging.">
          <WorkflowToolCard num="1.7" label="AI Email Writer" Icon={Mail} statusBadge="Content"
            description="Generates personalized email using lead research, your brand voice, and proven high-conversion templates." />
          <WorkflowToolCard num="1.8" label="AI Auto-Send" Icon={Send} statusBadge="Delivery"
            description="Sends via integrated email with open/click tracking, delivery confirmation, and smart send-time optimization." />
          <WorkflowToolCard num="1.9" label="AI Call Prep" Icon={Phone} statusBadge="Voice"
            description="Generates call script with talking points, company intel, and objection responses. Auto-logs call notes." />
          <WorkflowToolCard num="1.10" label="AI SMS Outreach" Icon={MessageSquare} statusBadge="SMS"
            description="Personalized text from business number with delivery tracking and response management." />
          <WorkflowToolCard num="1.11" label="AI Content Creator" Icon={Share2} statusBadge="Social"
            description="Generates platform-specific posts, schedules across Instagram/Facebook/LinkedIn/TikTok with analytics." />
        </WorkflowSection>

        {/* Section 4: Follow-Up & Pipeline */}
        <WorkflowSection title="FOLLOW-UP & PIPELINE" subtitle="Never miss a beat. AI manages your sequences, logs conversations, and moves leads forward.">
          <WorkflowToolCard num="1.12" label="AI Follow-Up Engine" Icon={Clock} statusBadge="Automation"
            description="Automated drip sequences across email/text/call with escalation logic — never miss a follow-up." />
          <WorkflowToolCard num="1.13" label="AI Conversation Logger" Icon={ListChecks} statusBadge="Tracking"
            description="All touchpoints auto-logged to lead timeline — emails, calls, texts, meetings in one unified view." />
          <WorkflowToolCard num="1.14" label="AI Scheduler" Icon={CalendarCheck} statusBadge="Booking"
            description="Sends booking link synced to your calendar, auto-confirms, sends reminders, handles rescheduling." />
          <WorkflowToolCard num="1.15" label="AI Pipeline Manager" Icon={GitBranch} statusBadge="CRM"
            description="Auto-advances pipeline stage based on activity — email opened → replied → meeting booked → proposal sent." />
        </WorkflowSection>
      </div>
    </div>
  );
}