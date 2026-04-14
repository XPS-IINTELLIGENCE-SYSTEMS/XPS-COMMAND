import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";

const AGENT_TYPES = [
  "Research", "Outreach", "Scraper", "Proposal", "Call", "Content",
  "Analysis", "SEO", "Social", "Shadow Browser", "Site Builder",
  "Crawler Network", "Property Builder"
];

export default function AgentJobCreator({ onJobCreated }) {
  const [agentType, setAgentType] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("5");
  const [loading, setLoading] = useState(false);

  const createJob = async () => {
    if (!agentType || !description.trim()) return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke('agentRunner', {
        action: 'create',
        agent_type: agentType,
        job_description: description.trim(),
        priority: parseInt(priority),
        trigger_source: 'manual'
      });
      toast({ title: "Agent job created", description: `${agentType} agent job queued.` });
      setDescription("");
      if (onJobCreated) onJobCreated(res.data?.job);
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const createAndRun = async () => {
    if (!agentType || !description.trim()) return;
    setLoading(true);
    try {
      const createRes = await base44.functions.invoke('agentRunner', {
        action: 'create',
        agent_type: agentType,
        job_description: description.trim(),
        priority: parseInt(priority),
        trigger_source: 'manual'
      });
      const jobId = createRes.data?.job?.id;
      if (jobId) {
        await base44.functions.invoke('agentRunner', { action: 'run', job_id: jobId });
        toast({ title: "Agent executed", description: `${agentType} agent completed.` });
      }
      setDescription("");
      if (onJobCreated) onJobCreated();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Zap className="w-4 h-4 text-primary" />
        <span className="text-sm font-bold text-foreground">Deploy Agent</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Select value={agentType} onValueChange={setAgentType}>
          <SelectTrigger className="glass-input text-xs">
            <SelectValue placeholder="Select agent type..." />
          </SelectTrigger>
          <SelectContent>
            {AGENT_TYPES.map(t => (
              <SelectItem key={t} value={t}>{t} Agent</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="glass-input text-xs">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            {[10,9,8,7,6,5,4,3,2,1].map(p => (
              <SelectItem key={p} value={String(p)}>Priority {p}{p === 10 ? ' (Urgent)' : p === 1 ? ' (Low)' : ''}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Textarea
        placeholder='Describe the task... e.g. "Research all polished concrete companies in Arizona and score them against XPS ideal client profile"'
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="glass-input text-sm min-h-[80px]"
      />
      <div className="flex gap-2">
        <Button
          onClick={createJob}
          disabled={!agentType || !description.trim() || loading}
          variant="outline"
          className="flex-1 text-xs"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
          Queue Job
        </Button>
        <Button
          onClick={createAndRun}
          disabled={!agentType || !description.trim() || loading}
          className="flex-1 text-xs bg-primary hover:bg-primary/90"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Zap className="w-3 h-3 mr-1" />}
          Run Now
        </Button>
      </div>
    </div>
  );
}