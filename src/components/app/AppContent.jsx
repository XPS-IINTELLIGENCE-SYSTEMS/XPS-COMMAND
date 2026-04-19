import LeadPipelineView from "../pipeline/LeadPipelineView";
import CRMView from "../dashboard/CRMView";
import FindJobsView from "../scraper/FindJobsView";
import FindCompaniesView from "../scraper/FindCompaniesView";
import ContactView from "../phases/ContactView";
import CloseView from "../phases/CloseView";
import AnalyticsView from "../dashboard/AnalyticsView";
import KnowledgeView from "../knowledge/KnowledgeView";
import KnowledgeUploadView from "../knowledge/KnowledgeUploadView";
import AdminControlView from "../admin/AdminControlView";
import CompetitiveIntelCenter from "../owner/CompetitiveIntelCenter";
import CompetitorComparisonView from "../competitor/CompetitorComparisonView";
import ConnectorHub from "../settings/ConnectorHub";
import SettingsView from "../dashboard/SettingsView";
import ScraperSchedulerView from "../scheduler/ScraperSchedulerView";
import WorkflowCreatorView from "../workflow/WorkflowCreatorView";
import DataBankView from "../databank/DataBankView";
import SocialScrapeView from "../scraper/SocialScrapeView";
import TrendsScrapeView from "../scraper/TrendsScrapeView";
import AlgorithmTuningView from "../settings/AlgorithmTuningView";
import SeedsSourcesView from "../scraper/SeedsSourcesView";

export default function AppContent({ activeView, onChatCommand, onNavigate }) {
  switch (activeView) {
    case "xpress_leads": return <LeadPipelineView forcedTab="XPress" />;
    case "job_leads": return <LeadPipelineView forcedTab="Jobs" />;
    case "crm": return <CRMView />;
    case "data_bank": return <DataBankView />;
    case "find_jobs": return <FindJobsView />;
    case "find_companies": return <FindCompaniesView />;
    case "scrape_social": return <SocialScrapeView />;
    case "scrape_trends": return <TrendsScrapeView />;
    case "get_work": return <ContactView />;
    case "win_work": return <CloseView />;
    case "analytics": return <AnalyticsView />;
    case "ai_assistant": return <KnowledgeView />;
    case "research": return <KnowledgeView />;
    case "knowledge": return <KnowledgeView />;
    case "knowledge_upload": return <KnowledgeUploadView />;
    case "seeds_sources": return <SeedsSourcesView />;
    case "algorithm": return <AlgorithmTuningView />;
    case "admin": return <AdminControlView />;
    case "competition": return <CompetitiveIntelCenter />;
    case "competitor_comparison": return <CompetitorComparisonView />;
    case "connectors": return <ConnectorHub />;
    case "settings": return <SettingsView />;
    case "scheduler": return <ScraperSchedulerView />;
    case "workflows": return <WorkflowCreatorView />;
    default: return <div className="text-center py-20 text-muted-foreground">View not found</div>;
  }
}