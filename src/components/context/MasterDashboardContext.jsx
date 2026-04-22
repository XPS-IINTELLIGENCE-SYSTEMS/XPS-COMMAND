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

  // ─── Derived/filtered data (always computed from shared state) ────────────
  const filteredLeads = data.leads.filter(l => {
    if (filters.leadStage !== "all" && l.stage !== filters.leadStage) return false;
    return true;
  });

  const filteredJobs = data.jobs.filter(j => {
    if (filters.jobPhase !== "all" && j.project_phase !== filters.jobPhase) return false;
    return true;
  });

  const filteredBids = data.bids.filter(b => {
    if (filters.bidStatus !== "all" && b.send_status !== filters.bidStatus) return false;
    return true;
  });

  const filteredProposals = data.proposals.filter(p => {
    if (filters.emailStatus !== "all" && p.status !== filters.emailStatus) return false;
    return true;
  });

  const followUps = data.callLogs.filter(l => ["Callback", "No Answer", "Voicemail"].includes(l.call_outcome));
  const closedDeals = data.callLogs.filter(l => l.call_outcome === "Sold");

  // ─── Unified actions that update ALL related state ──────────────────────
  const actions = {
    // Lead actions trigger CRM update + queue rebuild + linking
    updateLead: async (id, updates) => {
      await base44.entities.Lead.update(id, updates);
      const updated = data.leads.map(l => l.id === id ? { ...l, ...updates } : l);
      setData(prev => ({ ...prev, leads: updated }));
      setStats(computeStats({ ...data, leads: updated }));
      setQueue(buildQueue({ ...data, leads: updated }, data.callLogs));
      setSelectedLead(updated.find(l => l.id === id));
      // Auto-advance phase if lead is qualified
      if (updates.stage === "Qualified") setActivePhase("call_center");
    },

    selectLead: (lead) => {
      setSelectedLead(lead);
      setActivePhase("crm");
    },

    // Call log actions cascade through entire pipeline
    logCall: async (call) => {
      const created = await base44.entities.CallLog.create(call);
      const newLogs = [created, ...data.callLogs];
      setData(prev => ({ ...prev, callLogs: newLogs }));
      setStats(computeStats({ ...data, callLogs: newLogs }));
      setQueue(buildQueue(data, newLogs));
      
      // Auto-trigger workflow based on outcome
      if (call.call_outcome === "Sold") {
        setActivePhase("bidding"); // Move to proposal/bid
      } else if (["Callback", "No Answer"].includes(call.call_outcome)) {
        setActivePhase("followup");
      }
      
      // Mark lead as contacted
      if (call.source_type === "Lead" && call.source_id) {
        const lead = data.leads.find(l => l.id === call.source_id);
        if (lead) await actions.updateLead(call.source_id, { stage: "Contacted" });
      }
      
      return created;
    },

    // Job actions trigger bid pipeline + proposal generation
    updateJob: async (id, updates) => {
      await base44.entities.CommercialJob.update(id, updates);
      const updated = data.jobs.map(j => j.id === id ? { ...j, ...updates } : j);
      setData(prev => ({ ...prev, jobs: updated }));
      setStats(computeStats({ ...data, jobs: updated }));
      setSelectedJob(updated.find(j => j.id === id));
      
      // Auto-create bid when job phase changes to pre_bid
      if (updates.project_phase === "pre_bid" && !data.bids.find(b => b.job_id === id)) {
        const newBid = await base44.entities.BidDocument.create({
          job_id: id,
          project_name: updated.find(j => j.id === id)?.job_name,
          send_status: "draft",
        });
        setData(prev => ({ ...prev, bids: [newBid, ...prev.bids] }));
      }
    },

    selectJob: (job) => {
      setSelectedJob(job);
      setActivePhase("bidding");
    },

    // Bid actions cascade to approvals + invoices
    updateBid: async (id, updates) => {
      await base44.entities.BidDocument.update(id, updates);
      const updated = data.bids.map(b => b.id === id ? { ...b, ...updates } : b);
      setData(prev => ({ ...prev, bids: updated }));
      setStats(computeStats({ ...data, bids: updated }));
      setSelectedBid(updated.find(b => b.id === id));
      
      // Cascade: send_status=sent → add to approvals
      if (updates.send_status === "sent") {
        setActivePhase("approvals");
        // Create proposal from bid
        const bid = updated.find(b => b.id === id);
        if (bid && !data.proposals.find(p => p.lead_id === bid.job_id)) {
          const newProp = await base44.entities.Proposal.create({
            title: `Proposal for ${bid.project_name}`,
            client_name: bid.recipient_company || "Client",
            service_type: "Epoxy Floor Coating",
            total_value: bid.total_bid_value || 0,
            status: "Draft",
            lead_id: bid.job_id,
          });
          setData(prev => ({ ...prev, proposals: [newProp, ...prev.proposals] }));
        }
      }
    },

    selectBid: (bid) => {
      setSelectedBid(bid);
      setActivePhase("bidding");
    },

    // Proposal actions drive invoice generation + revenue tracking
    createProposal: async (proposal) => {
      const created = await base44.entities.Proposal.create(proposal);
      const updated = [created, ...data.proposals];
      setData(prev => ({ ...prev, proposals: updated }));
      setStats(computeStats({ ...data, proposals: updated }));
      setActivePhase("approvals");
      
      // Auto-create invoice when proposal is approved
      if (proposal.status === "Approved") {
        const inv = await base44.entities.Invoice.create({
          proposal_id: created.id,
          client_name: created.client_name,
          total: created.total_value,
          status: "Draft",
        });
        setData(prev => ({ ...prev, invoices: [inv, ...prev.invoices] }));
      }
      
      return created;
    },

    updateProposal: async (id, updates) => {
      await base44.entities.Proposal.update(id, updates);
      const updated = data.proposals.map(p => p.id === id ? { ...p, ...updates } : p);
      setData(prev => ({ ...prev, proposals: updated }));
      setStats(computeStats({ ...data, proposals: updated }));
      
      // If approved, cascade to invoice
      if (updates.status === "Approved") {
        const prop = updated.find(p => p.id === id);
        if (prop && !data.invoices.find(i => i.proposal_id === id)) {
          const inv = await base44.entities.Invoice.create({
            proposal_id: id,
            client_name: prop.client_name,
            total: prop.total_value,
            status: "Draft",
          });
          setData(prev => ({ ...prev, invoices: [inv, ...prev.invoices] }));
          setStats(prev => ({ ...prev, invoices: prev.invoices + 1 }));
        }
      }
    },

    // Email actions link to outreach tracking
    sendEmail: async (email) => {
      const created = await base44.entities.OutreachEmail.create(email);
      const updated = [created, ...data.outreachEmails];
      setData(prev => ({ ...prev, outreachEmails: updated }));
      return created;
    },

    // Prospect actions feed cold call queue
    updateProspect: async (id, updates) => {
      await base44.entities.ProspectCompany.update(id, updates);
      const updated = data.prospects.map(p => p.id === id ? { ...p, ...updates } : p);
      setData(prev => ({ ...prev, prospects: updated }));
      setQueue(buildQueue({ ...data, prospects: updated }, data.callLogs));
    },

    selectProspect: (prospect) => {
      setQueue(prev => [
        { ...prospect, source_type: "Prospect", source_id: prospect.id, priority: prospect.cold_call_priority || 5, score: 0 },
        ...prev.filter(q => q.source_id !== prospect.id),
      ]);
      setActivePhase("call_center");
    },

    // Workflow actions
    updateWorkflow: async (id, updates) => {
      await base44.entities.Workflow.update(id, updates);
      const updated = data.workflows.map(w => w.id === id ? { ...w, ...updates } : w);
      setData(prev => ({ ...prev, workflows: updated }));
    },

    // Bulk invoice generation
    generateInvoices: async (proposalIds) => {
      const invoices = proposalIds.map(pid => {
        const prop = data.proposals.find(p => p.id === pid);
        return {
          proposal_id: pid,
          client_name: prop?.client_name || "Client",
          total: prop?.total_value || 0,
          status: "Draft",
        };
      });
      const created = await Promise.all(invoices.map(inv => base44.entities.Invoice.create(inv)));
      const updated = [...created, ...data.invoices];
      setData(prev => ({ ...prev, invoices: updated }));
      setStats(computeStats({ ...data, invoices: updated }));
    },

    // Filter actions
    setFilter: (filterKey, value) => {
      setFilters(prev => ({ ...prev, [filterKey]: value }));
    },

    // Phase navigation with auto-data-sync
    goToPhase: async (phase) => {
      setActivePhase(phase);
      if (phase === "crm") setSelectedLead(null);
      if (phase === "bidding") {
        const updated = await base44.entities.CommercialJob.list("-urgency_score", 50).catch(() => []);
        setData(prev => ({ ...prev, jobs: updated }));
      }
      if (phase === "approvals") {
        const updated = await base44.entities.Proposal.list("-created_date", 100).catch(() => []);
        setData(prev => ({ ...prev, proposals: updated }));
      }
      if (phase === "call_center") {
        const logs = await base44.entities.CallLog.list("-created_date", 200).catch(() => []);
        setData(prev => ({ ...prev, callLogs: logs }));
        setQueue(buildQueue(data, logs));
      }
    },

    // Compile & dedup from Orchestrator
    compileAndDedup: async (queue) => {
      setQueue(queue);
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
      // Raw data
      data,
      // Filtered data (derived from state + filters)
      filteredLeads,
      filteredJobs,
      filteredBids,
      filteredProposals,
      followUps,
      closedDeals,
      // UI state
      stats,
      filters,
      queue,
      loading,
      lastRefresh,
      selectedLead,
      selectedJob,
      selectedBid,
      activePhase,
      // Actions (all cascading + linking)
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