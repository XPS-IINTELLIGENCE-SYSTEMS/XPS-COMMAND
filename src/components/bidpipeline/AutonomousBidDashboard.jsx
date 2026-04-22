import { useState, useEffect } from 'react';
import { Play, Pause, RefreshCw, CheckCircle2, AlertCircle, Clock, FileText, Zap, TrendingUp, Download } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

export default function AutonomousBidDashboard() {
  const [opportunities, setOpportunities] = useState([]);
  const [bidDocs, setBidDocs] = useState([]);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, generated: 0, pending: 0, inProgress: 0 });
  const [selectedOpp, setSelectedOpp] = useState(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      // Load opportunities (jobs in pre-bid phase)
      const jobs = await base44.entities.CommercialJob.filter(
        { project_phase: 'pre_bid' },
        '-discovery_date',
        50
      );

      const opps = jobs.map(j => ({
        id: j.id,
        name: j.job_name,
        gc: j.gc_name,
        value: j.estimated_flooring_value,
        status: j.bid_status,
        url: j.source_url,
        discovered: j.discovery_date,
      }));

      setOpportunities(opps);

      // Load bid documents
      const bids = await base44.entities.BidDocument.filter(
        { send_status: { $ne: 'cancelled' } },
        '-bid_date',
        20
      );

      setBidDocs(bids);

      // Calculate stats
      const total = opps.length;
      const generated = opps.filter(o => o.status === 'bid_generated').length;
      const pending = opps.filter(o => o.status === 'not_started').length;
      const inProgress = opps.filter(o => ['takeoff_complete', 'in_progress'].includes(o.status)).length;

      setStats({ total, generated, pending, inProgress });
      setLoading(false);
    } catch (err) {
      console.error('Load error:', err);
      toast({ title: 'Failed to load data', variant: 'destructive' });
    }
  };

  const handleMonitor = async () => {
    setLoading(true);
    try {
      const result = await base44.functions.invoke('autonomousBidPipeline', {
        action: 'monitor',
      });
      setOpportunities(result.opportunities);
      toast({ title: `Found ${result.count} opportunities` });
    } catch (err) {
      toast({ title: 'Monitor failed', variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleExtract = async (jobId, url) => {
    try {
      const result = await base44.functions.invoke('autonomousBidPipeline', {
        action: 'extract',
        jobId,
        opportunityUrl: url,
      });
      toast({ title: 'Scope extracted successfully' });
      loadData();
    } catch (err) {
      toast({ title: 'Extraction failed', variant: 'destructive' });
    }
  };

  const handleGenerate = async (jobId) => {
    try {
      const result = await base44.functions.invoke('autonomousBidPipeline', {
        action: 'generate',
        jobId,
      });
      toast({ title: 'Bid proposal generated', description: result.googleDocUrl ? 'View in Google Docs' : '' });
      loadData();
    } catch (err) {
      toast({ title: 'Generation failed', variant: 'destructive' });
    }
  };

  const handleOrchestrate = async () => {
    setRunning(true);
    try {
      const result = await base44.functions.invoke('autonomousBidPipeline', {
        action: 'orchestrate',
      });
      toast({
        title: `Pipeline Complete`,
        description: `Generated ${result.generated} of ${result.processed} proposals`,
      });
      loadData();
    } catch (err) {
      toast({ title: 'Pipeline failed', variant: 'destructive' });
    }
    setRunning(false);
  };

  const statusColor = (status) => {
    const colors = {
      not_started: 'bg-gray-100 text-gray-700',
      takeoff_complete: 'bg-blue-100 text-blue-700',
      bid_generated: 'bg-green-100 text-green-700',
      sent: 'bg-purple-100 text-purple-700',
      won: 'bg-emerald-100 text-emerald-700',
      lost: 'bg-red-100 text-red-700',
    };
    return colors[status] || colors.not_started;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Autonomous Bid Pipeline</h2>
          <p className="text-sm text-muted-foreground">Monitor opportunities → Extract scopes → Generate proposals</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleMonitor}
            variant="outline"
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Monitor
          </Button>
          <Button
            onClick={handleOrchestrate}
            disabled={running || loading || opportunities.length === 0}
            className="gap-2 bg-primary"
          >
            <Zap className="w-4 h-4" /> {running ? 'Running...' : 'Orchestrate Pipeline'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Total Opportunities</div>
          <div className="text-3xl font-bold text-foreground mt-1">{stats.total}</div>
        </div>
        <div className="glass-card rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Proposals Generated</div>
          <div className="text-3xl font-bold text-green-500 mt-1">{stats.generated}</div>
        </div>
        <div className="glass-card rounded-lg p-4">
          <div className="text-sm text-muted-foreground">In Progress</div>
          <div className="text-3xl font-bold text-blue-500 mt-1">{stats.inProgress}</div>
        </div>
        <div className="glass-card rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Pending Action</div>
          <div className="text-3xl font-bold text-amber-500 mt-1">{stats.pending}</div>
        </div>
      </div>

      {/* Opportunities Table */}
      <div className="glass-card rounded-lg p-4">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4" /> Bid Opportunities ({opportunities.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3">Project</th>
                <th className="text-left py-2 px-3">GC</th>
                <th className="text-right py-2 px-3">Est. Value</th>
                <th className="text-center py-2 px-3">Status</th>
                <th className="text-center py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map(opp => (
                <tr key={opp.id} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3">
                    <button
                      onClick={() => setSelectedOpp(opp)}
                      className="text-primary hover:underline font-medium"
                    >
                      {opp.name}
                    </button>
                  </td>
                  <td className="py-3 px-3 text-muted-foreground">{opp.gc}</td>
                  <td className="py-3 px-3 text-right font-semibold">${(opp.value || 0).toLocaleString()}</td>
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusColor(opp.status)}`}>
                      {opp.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center space-x-1">
                    {opp.status === 'not_started' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleExtract(opp.id, opp.url)}
                        className="h-6 text-xs"
                      >
                        Extract
                      </Button>
                    )}
                    {['not_started', 'takeoff_complete'].includes(opp.status) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleGenerate(opp.id)}
                        className="h-6 text-xs"
                      >
                        Generate
                      </Button>
                    )}
                    {opp.status === 'bid_generated' && (
                      <CheckCircle2 className="w-4 h-4 text-green-500 inline" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Bid Documents */}
      <div className="glass-card rounded-lg p-4">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> Recent Proposals ({bidDocs.length})
        </h3>
        <div className="space-y-2">
          {bidDocs.slice(0, 5).map(doc => (
            <div key={doc.id} className="flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors">
              <div>
                <div className="font-medium text-foreground">{doc.project_name}</div>
                <div className="text-xs text-muted-foreground">{doc.recipient_company || 'N/A'}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">${(doc.total_bid_value || 0).toLocaleString()}</div>
                <div className={`text-xs ${doc.send_status === 'sent' ? 'text-green-500' : 'text-amber-500'}`}>
                  {doc.send_status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail View */}
      {selectedOpp && (
        <div className="glass-card rounded-lg p-4 border border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">{selectedOpp.name}</h3>
            <button onClick={() => setSelectedOpp(null)} className="text-muted-foreground">✕</button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">General Contractor</div>
              <div className="font-medium">{selectedOpp.gc}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Estimated Value</div>
              <div className="font-medium">${(selectedOpp.value || 0).toLocaleString()}</div>
            </div>
            <div className="col-span-2">
              <div className="text-muted-foreground">Scope URL</div>
              <a
                href={selectedOpp.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline break-all text-xs"
              >
                {selectedOpp.url}
              </a>
            </div>
            <div className="col-span-2">
              <div className="text-muted-foreground mb-2">Discovered</div>
              <div className="font-medium">{new Date(selectedOpp.discovered).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}