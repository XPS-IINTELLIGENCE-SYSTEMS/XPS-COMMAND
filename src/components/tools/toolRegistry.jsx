/**
 * Central registry mapping tool IDs to their visual components.
 * Each tool has: label, description, Icon, Component (lazy), workflowId.
 */
import {
  Mail, Send, Phone, MessageSquare, Clock, CalendarCheck,
  Search, MapPin, Users, Target, TrendingUp, Database, Share2, ListChecks, GitBranch,
  Bell, Trophy, FileText, DollarSign, Swords, PenLine, Stamp,
  HardHat, CalendarClock, ShoppingCart, Camera, MessageCircle, CheckSquare, Flag,
  Receipt, CreditCard, BookOpen, Heart, Star, BarChart3, RefreshCcw
} from "lucide-react";

import EmailWriterTool from "./modules/EmailWriterTool";
import CallPrepTool from "./modules/CallPrepTool";
import SMSTool from "./modules/SMSTool";
import SchedulerTool from "./modules/SchedulerTool";
import AutoSendTool from "./modules/AutoSendTool";
import FollowUpTool from "./modules/FollowUpTool";
import TerritoryTool from "./modules/TerritoryTool";
import LeadScraperTool from "./modules/LeadScraperTool";
import ContactEnricherTool from "./modules/ContactEnricherTool";
import DeepResearchTool from "./modules/DeepResearchTool";
import LeadScorerTool from "./modules/LeadScorerTool";
import ProposalTool from "./modules/ProposalTool";
import BidCalcTool from "./modules/BidCalcTool";
import InvoiceTool from "./modules/InvoiceTool";
import JobSchedulerTool from "./modules/JobSchedulerTool";
import GenericAITool from "./modules/GenericAITool";

const REGISTRY = {
  // === CONTACT / GET_WORK ===
  email: { label: "AI Email Writer", description: "Compose & send outreach emails via Gmail", Icon: Mail, Component: EmailWriterTool, workflowId: "get_work" },
  send: { label: "AI Auto-Send", description: "Bulk send emails to top leads", Icon: Send, Component: AutoSendTool, workflowId: "get_work" },
  call: { label: "AI Call Prep", description: "Generate call scripts & talking points", Icon: Phone, Component: CallPrepTool, workflowId: "get_work" },
  sms: { label: "AI SMS Outreach", description: "Send SMS messages via Twilio", Icon: MessageSquare, Component: SMSTool, workflowId: "get_work" },
  followup_contact: { label: "AI Follow-Up Engine", description: "Automated follow-up sequences", Icon: Clock, Component: FollowUpTool, workflowId: "get_work" },
  scheduler: { label: "AI Meeting Scheduler", description: "Schedule meetings via Google Calendar", Icon: CalendarCheck, Component: SchedulerTool, workflowId: "get_work" },

  // === DISCOVERY / FIND_WORK ===
  territory: { label: "AI Territory Analyzer", description: "Analyze territory for high-value areas", Icon: MapPin, Component: TerritoryTool, workflowId: "find_work" },
  scraper: { label: "AI Lead Scraper", description: "Find new leads by location & industry", Icon: Search, Component: LeadScraperTool, workflowId: "find_work" },
  enricher: { label: "AI Contact Enricher", description: "Enrich leads with contact details", Icon: Users, Component: ContactEnricherTool, workflowId: "find_work" },
  research: { label: "AI Deep Research", description: "Deep business intelligence research", Icon: Target, Component: DeepResearchTool, workflowId: "find_work" },
  scorer: { label: "AI Lead Scorer", description: "Score & rank all leads", Icon: TrendingUp, Component: LeadScorerTool, workflowId: "find_work" },
  autoentry: { label: "AI Auto-Entry", description: "Automatic lead data entry", Icon: Database, Component: (props) => <GenericAITool {...props} toolName="Auto-Entry" prompt="Show me all leads sorted by score" />, workflowId: "find_work" },
  content: { label: "AI Content Creator", description: "Create social media & marketing content", Icon: Share2, Component: (props) => <GenericAITool {...props} toolName="Content Creator" prompt="Create a social media post about our epoxy services" />, workflowId: "find_work" },
  logger: { label: "AI Conversation Log", description: "View & search conversation history", Icon: ListChecks, Component: (props) => <GenericAITool {...props} toolName="Conversation Log" prompt="Show conversation history for my top lead" />, workflowId: "find_work" },
  pipeline: { label: "AI Pipeline Manager", description: "Pipeline status & recommendations", Icon: GitBranch, Component: (props) => <GenericAITool {...props} toolName="Pipeline Manager" prompt="Show my pipeline status and recommendations" />, workflowId: "find_work" },

  // === FOLLOW-UP ===
  drip: { label: "AI Follow-Up Sequences", description: "Automated drip campaign sequences", Icon: Clock, Component: FollowUpTool, workflowId: "follow_up" },
  reminder: { label: "AI Reminder Engine", description: "Smart reminder notifications", Icon: Bell, Component: (props) => <GenericAITool {...props} toolName="Reminder Engine" prompt="Send reminders to all leads that haven't responded in 3 days" />, workflowId: "follow_up" },
  email_followup: { label: "AI Email Follow-Up", description: "Compose follow-up emails", Icon: Mail, Component: EmailWriterTool, workflowId: "follow_up" },
  call_followup: { label: "AI Call Follow-Up", description: "Follow-up call scripts", Icon: Phone, Component: CallPrepTool, workflowId: "follow_up" },
  sms_followup: { label: "AI SMS Follow-Up", description: "SMS follow-up messages", Icon: MessageSquare, Component: SMSTool, workflowId: "follow_up" },
  schedule: { label: "AI Re-Schedule", description: "Reschedule missed meetings", Icon: CalendarCheck, Component: SchedulerTool, workflowId: "follow_up" },

  // === CLOSE / WIN_WORK ===
  proposal: { label: "AI Proposal Generator", description: "Generate professional proposals", Icon: FileText, Component: ProposalTool, workflowId: "win_work" },
  bid: { label: "AI Bid Calculator", description: "Calculate pricing bids", Icon: DollarSign, Component: BidCalcTool, workflowId: "win_work" },
  deliver: { label: "AI Proposal Delivery", description: "Send proposals to clients", Icon: Send, Component: (props) => <GenericAITool {...props} toolName="Proposal Delivery" prompt="Send the latest proposal to the client" />, workflowId: "win_work" },
  followup_proposal: { label: "AI Proposal Follow-Up", description: "Follow up on sent proposals", Icon: Clock, Component: FollowUpTool, workflowId: "win_work" },
  negotiate: { label: "AI Negotiation Coach", description: "Handle objections & negotiations", Icon: Swords, Component: (props) => <GenericAITool {...props} toolName="Negotiation Coach" prompt="Help me handle price objections" />, workflowId: "win_work" },
  revise: { label: "AI Quick Revise", description: "Revise proposals quickly", Icon: PenLine, Component: (props) => <GenericAITool {...props} toolName="Quick Revise" prompt="Revise the latest proposal" />, workflowId: "win_work" },
  esign: { label: "AI E-Sign", description: "Send e-signature requests", Icon: Stamp, Component: (props) => <GenericAITool {...props} toolName="E-Sign" prompt="Send e-sign request for latest proposal" />, workflowId: "win_work" },

  // === EXECUTE / DO_WORK ===
  job_schedule: { label: "AI Job Scheduler", description: "Schedule jobs by crew availability", Icon: CalendarClock, Component: JobSchedulerTool, workflowId: "do_work" },
  procure: { label: "AI Procurement", description: "Generate purchase orders", Icon: ShoppingCart, Component: (props) => <GenericAITool {...props} toolName="Procurement" prompt="Generate a purchase order for my latest approved proposal" />, workflowId: "do_work" },
  crew: { label: "AI Crew Manager", description: "Assign & manage crews", Icon: Users, Component: (props) => <GenericAITool {...props} toolName="Crew Manager" prompt="Assign crew for my next scheduled job" />, workflowId: "do_work" },
  brief: { label: "AI Job Brief", description: "Create job briefing documents", Icon: FileText, Component: (props) => <GenericAITool {...props} toolName="Job Brief" prompt="Create a job brief for the next scheduled project" />, workflowId: "do_work" },
  photo: { label: "AI Photo Logger", description: "Log & organize job photos", Icon: Camera, Component: (props) => <GenericAITool {...props} toolName="Photo Logger" prompt="Show me today's job progress logs" />, workflowId: "do_work" },
  client_update: { label: "AI Client Updates", description: "Send progress updates", Icon: MessageCircle, Component: (props) => <GenericAITool {...props} toolName="Client Updates" prompt="Send a progress update to the client" />, workflowId: "do_work" },
  cost: { label: "AI Cost Tracker", description: "Track job costs & expenses", Icon: DollarSign, Component: (props) => <GenericAITool {...props} toolName="Cost Tracker" prompt="Show cost tracking for all active jobs" />, workflowId: "do_work" },
  qc: { label: "AI Quality Check", description: "Quality inspection checklists", Icon: CheckSquare, Component: (props) => <GenericAITool {...props} toolName="Quality Check" prompt="Create a quality checklist for the latest completed job" />, workflowId: "do_work" },
  complete: { label: "AI Job Completion", description: "Mark jobs complete & trigger invoicing", Icon: Flag, Component: (props) => <GenericAITool {...props} toolName="Job Completion" prompt="Mark the active job as complete and trigger invoicing" />, workflowId: "do_work" },

  // === COLLECT / GET_PAID ===
  invoice: { label: "AI Final Invoice", description: "Generate professional invoices", Icon: Receipt, Component: InvoiceTool, workflowId: "get_paid" },
  invoice_deliver: { label: "AI Invoice Delivery", description: "Send invoices to clients", Icon: Send, Component: (props) => <GenericAITool {...props} toolName="Invoice Delivery" prompt="Send the latest invoice to the client" />, workflowId: "get_paid" },
  payment_followup: { label: "AI Payment Follow-Up", description: "Follow up on overdue invoices", Icon: Bell, Component: FollowUpTool, workflowId: "get_paid" },
  payment: { label: "AI Payment Processing", description: "Track & process payments", Icon: CreditCard, Component: (props) => <GenericAITool {...props} toolName="Payment Processing" prompt="Show me all unpaid invoices and their status" />, workflowId: "get_paid" },
  books: { label: "AI Bookkeeping Sync", description: "Financial summaries & sync", Icon: BookOpen, Component: (props) => <GenericAITool {...props} toolName="Bookkeeping Sync" prompt="Show me a financial summary of all paid invoices" />, workflowId: "get_paid" },
  thanks: { label: "AI Thank You", description: "Send appreciation emails", Icon: Heart, Component: EmailWriterTool, workflowId: "get_paid" },
  review: { label: "AI Review Request", description: "Request client reviews", Icon: Star, Component: (props) => <GenericAITool {...props} toolName="Review Request" prompt="Send a review request to our last paid client" />, workflowId: "get_paid" },
  pnl: { label: "AI Job P&L", description: "Profit & loss analysis", Icon: BarChart3, Component: (props) => <GenericAITool {...props} toolName="Job P&L" prompt="Calculate profit/loss for all completed jobs" />, workflowId: "get_paid" },
  referral: { label: "AI Referral Engine", description: "Identify referral opportunities", Icon: RefreshCcw, Component: (props) => <GenericAITool {...props} toolName="Referral Engine" prompt="Identify past clients for referral outreach" />, workflowId: "get_paid" },
};

export function getToolById(id) {
  return REGISTRY[id] || null;
}

export function getToolsForWorkflow(workflowId) {
  return Object.entries(REGISTRY)
    .filter(([, t]) => t.workflowId === workflowId)
    .map(([id, t]) => ({ id, ...t }));
}

export default REGISTRY;