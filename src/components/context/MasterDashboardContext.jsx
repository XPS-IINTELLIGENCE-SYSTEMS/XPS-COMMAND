import { createContext, useState, useCallback, useEffect } from "react";
import { base44 } from "@/api/base44Client";

export const MasterDashboardContext = createContext();

export function MasterDashboardProvider({ children }) {
  // ─── Centralized State ──────────────────────────────────────────────────
  const [data, setData] = useState({
    leads: [],
    prospects: [],
    contractors: [],
    jobs: [],
    callLogs: [],
    proposals: [],
    invoices: [],
    bids: [],
    workflows: [],
    templates: [],
    outreachEmails: [],
  });

  const [stats, setStats] = useState({
    leads: 0, prospects: 0, contractors: 0, jobs: 0, callLogs: 0,
    proposals: 0, invoices: 0, bids: 0, totalRevenue: 0,
  });

  const [filters, setFilters] = useState({
    leadStage: "all", prospectStatus: "all", jobPhase: "all",
    bidStatus: "all", callOutcome: "all", emailStatus: "all",
  });

  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedBid, setSelectedBid] = useState(null);
  const [activePhase, setActivePhase] = useState(null);

  // ─── Computed values (always derive from shared state) ──────────────────
  const computeStats = useCallback((d) => {
    const callLogsWithOutcome = d.callLogs || [];
    const sold = callLogsWithOutcome.filter(l => l.call_outcome === "Sold");
    return {
      leads: d.leads?.length || 0,
      prospects: d.prospects?.length || 0,
      contractors: d.contractors?.length || 0,
      jobs: d.jobs?.length || 0,
      callLogs: callLogsWithOutcome.length,
      proposals: d.proposals?.length || 0,
      invoices: d.invoices?.filter(i => i.status !== "Paid")?.length || 0,
      bids: d.bids?.length || 0,
      totalRevenue: sold.reduce((s, l) => s + (l.deal_value || 0), 0),
    };
  }, []);

  const buildQueue = useCallback((d, logs) => {
    const loggedIds = new Set((logs || []).map(l => l.source_id));
    const q = [];
    (d.leads || []).forEach(l => {
      if (!l.phone && !l.email) return;
      q.push({
        id: l.id,
        company_name: l.company || "Unknown",
        contact_name: l.contact_name || "",
        phone: l.phone || "",
        email: l.email || "",
        priority: l.priority || 5,
        score: l.score || 0,
        source_type: "Lead",
        source_id: l.id,
        logged: loggedIds.has(l.id),
        lastLog: (logs || []).find(log => log.source_id === l.id),
      });
    });
    q.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    return q;
  }, []);

  // ─── Load all data from entities ────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    const [leadsList, prospectList, contractors, jobs, logs, proposals, invoices, bids, workflows, templates, outreachEmails] = await Promise.all([
      base44.entities.Lead.list("-score", 1000).catch(() => []),
      base44.entities.ProspectCompany.list("-cold_call_priority", 500).catch(() => []),
      base44.entities.Contractor.list("-score", 200).catch(() => []),
      base44.entities.CommercialJob.list("-urgency_score", 200).catch(() => []),
      base44.entities.CallLog.list("-created_date", 500).catch(() => []),
      base44.entities.Proposal.list("-created_date", 100).catch(() => []),
      base44.entities.Invoice.list("-created_date", 100).catch(() => []),
      base44.entities.BidDocument.list("-created_date", 100).catch(() => []),
      base44.entities.Workflow.list("-created_date", 100).catch(() => []),
      base44.entities.MessageTemplate.list("-created_date", 50).catch(() => []),
      base44.entities.OutreachEmail.list("-created_date", 200).catch(() => []),
    ]);

    const newData = {
      leads: leadsList,
      prospects: prospectList,
      contractors,
      jobs,
      callLogs: logs,
      proposals,
      invoices,
      bids,
      workflows,
      templates,
      outreachEmails,
    };

    setData(newData);
    setStats(computeStats(newData));
    setQueue(buildQueue(newData, logs));
    setLastRefresh(new Date());
    setLoading(false);
  }, [computeStats, buildQueue]);

  // ─── Unified actions that update ALL related state ──────────────────────
  const actions = {
    // Lead actions trigger CRM update + queue rebuild
    updateLead: async (id, updates) => {
      await base44.entities.Lead.update(id, updates);
      const updated = data.leads.map(l => l.id === id ? { ...l, ...updates } : l);
      setData(prev => ({ ...prev, leads: updated }));
      setStats(computeStats({ ...data, leads: updated }));
      setQueue(buildQueue({ ...data, leads: updated }, data.callLogs));
    },

    // Call log actions trigger follow-up tracking + queue updates
    logCall: async (call) => {
      const created = await base44.entities.CallLog.create(call);
      const newLogs = [created, ...data.callLogs];
      setData(prev => ({ ...prev, callLogs: newLogs }));
      setStats(computeStats({ ...data, callLogs: newLogs }));
      setQueue(buildQueue(data, newLogs));
      setActivePhase("followup");
      return created;
    },

    // Job actions trigger bid pipeline update
    updateJob: async (id, updates) => {
      await base44.entities.CommercialJob.update(id, updates);
      const updated = data.jobs.map(j => j.id === id ? { ...j, ...updates } : j);
      setData(prev => ({ ...prev, jobs: updated }));
      setStats(computeStats({ ...data, jobs: updated }));
      setSelectedJob(updated.find(j => j.id === id));
    },

    // Bid actions trigger proposal generation + approval queue
    updateBid: async (id, updates) => {
      await base44.entities.BidDocument.update(id, updates);
      const updated = data.bids.map(b => b.id === id ? { ...b, ...updates } : b);
      setData(prev => ({ ...prev, bids: updated }));
      setStats(computeStats({ ...data, bids: updated }));
      if (updates.send_status === "sent") setActivePhase("approvals");
      setSelectedBid(updated.find(b => b.id === id));
    },

    // Proposal actions trigger invoice generation
    createProposal: async (proposal) => {
      const created = await base44.entities.Proposal.create(proposal);
      const updated = [created, ...data.proposals];
      setData(prev => ({ ...prev, proposals: updated }));
      setStats(computeStats({ ...data, proposals: updated }));
      setActivePhase("approvals");
      return created;
    },

    // Email actions trigger outreach tracking
    sendEmail: async (email) => {
      const created = await base44.entities.OutreachEmail.create(email);
      const updated = [created, ...data.outreachEmails];
      setData(prev => ({ ...prev, outreachEmails: updated }));
      return created;
    },

    // Prospect actions trigger cold call queue
    updateProspect: async (id, updates) => {
      await base44.entities.ProspectCompany.update(id, updates);
      const updated = data.prospects.map(p => p.id === id ? { ...p, ...updates } : p);
      setData(prev => ({ ...prev, prospects: updated }));
      setQueue(buildQueue({ ...data, prospects: updated }, data.callLogs));
    },

    // Workflow actions update automation state
    updateWorkflow: async (id, updates) => {
      await base44.entities.Workflow.update(id, updates);
      const updated = data.workflows.map(w => w.id === id ? { ...w, ...updates } : w);
      setData(prev => ({ ...prev, workflows: updated }));
    },

    // Bulk invoice generation from proposals
    generateInvoices: async (proposalIds) => {
      const invoices = proposalIds.map(pid => ({
        proposal_id: pid,
        status: "Draft",
        total: 0,
      }));
      const created = await Promise.all(invoices.map(inv => base44.entities.Invoice.create(inv)));
      const updated = [...created, ...data.invoices];
      setData(prev => ({ ...prev, invoices: updated }));
      setStats(computeStats({ ...data, invoices: updated }));
    },

    // Filter actions
    setFilter: (filterKey, value) => {
      setFilters(prev => ({ ...prev, [filterKey]: value }));
    },

    // Phase navigation with data sync
    goToPhase: async (phase) => {
      setActivePhase(phase);
      if (phase === "crm") setSelectedLead(null);
      if (phase === "bidding") setSelectedJob(null);
      if (phase === "approvals") {
        // Refresh proposals when going to approvals
        const updated = await base44.entities.Proposal.list("-created_date", 100).catch(() => []);
        setData(prev => ({ ...prev, proposals: updated }));
      }
    },

    // Compile & dedup (from Orchestrator)
    compileAndDedup: async (queue) => {
      setQueue(queue);
      // Merge into leads
      if (queue.length > 0) {
        const deduped = Array.from(new Map(queue.map(q => [q.company_name, q])).values());
        setQueue(deduped);
      }
    },
  };

  // ─── Initial load ───────────────────────────────────────────────────────
  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return (
    <MasterDashboardContext.Provider value={{
      data,
      stats,
      filters,
      queue,
      loading,
      lastRefresh,
      selectedLead,
      selectedJob,
      selectedBid,
      activePhase,
      actions,
      loadAll,
      setSelectedLead,
      setSelectedJob,
      setSelectedBid,
      setActivePhase,
    }}>
      {children}
    </MasterDashboardContext.Provider>
  );
}