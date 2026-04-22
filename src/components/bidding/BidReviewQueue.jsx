import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Eye, Send, Trash2, Loader2, DollarSign, MapPin, Calendar } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function BidReviewQueue() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [bidDetails, setBidDetails] = useState(null);
  const [approving, setApproving] = useState(null);

  useEffect(() => {
    loadReviewQueue();
    const interval = setInterval(loadReviewQueue, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const loadReviewQueue = async () => {
    try {
      const result = await base44.entities.AgentTask.filter({
        task_type: 'bid_review',
        status: 'pending',
      });
      setTasks(result || []);
    } catch (e) {
      console.error("Failed to load review queue:", e);
    }
    setLoading(false);
  };

  const viewBid = async (task) => {
    setSelectedTask(task);
    try {
      const metadata = JSON.parse(task.metadata || '{}');
      const bidDoc = await base44.entities.BidDocument.read(metadata.bidDocId);
      const job = await base44.entities.CommercialJob.read(metadata.jobId);
      setBidDetails({ bidDoc, job, metadata });
    } catch (e) {
      console.error("Failed to load bid details:", e);
    }
  };

  const approveBid = async (task) => {
    setApproving(task.id);
    try {
      const metadata = JSON.parse(task.metadata || '{}');
      
      // Update bid document status
      await base44.entities.BidDocument.update(metadata.bidDocId, {
        send_status: 'ready_to_send',
        validation_passed: true,
        outcome: 'pending',
      });

      // Update job status
      await base44.entities.CommercialJob.update(metadata.jobId, {
        bid_status: 'bid_generated',
      });

      // Complete the review task
      await base44.entities.AgentTask.update(task.id, {
        status: 'completed',
        result: 'approved',
      });

      setSelectedTask(null);
      await loadReviewQueue();
    } catch (e) {
      console.error("Failed to approve bid:", e);
    }
    setApproving(null);
  };

  const rejectBid = async (task) => {
    setApproving(task.id);
    try {
      const metadata = JSON.parse(task.metadata || '{}');
      
      // Update bid document status
      await base44.entities.BidDocument.update(metadata.bidDocId, {
        send_status: 'draft',
        outcome: 'pending',
      });

      // Complete the review task
      await base44.entities.AgentTask.update(task.id, {
        status: 'completed',
        result: 'rejected',
      });

      setSelectedTask(null);
      await loadReviewQueue();
    } catch (e) {
      console.error("Failed to reject bid:", e);
    }
    setApproving(null);
  };

  const sendBid = async (task) => {
    setApproving(task.id);
    try {
      const metadata = JSON.parse(task.metadata || '{}');
      
      // Update bid document - mark as sent
      await base44.entities.BidDocument.update(metadata.bidDocId, {
        send_status: 'sent',
        sent_time: new Date().toISOString(),
      });

      // Trigger email send
      await base44.functions.invoke("sendOutreachEmail", {
        email_id: metadata.bidDocId,
        humanize: true,
      });

      setSelectedTask(null);
      await loadReviewQueue();
    } catch (e) {
      console.error("Failed to send bid:", e);
    }
    setApproving(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Bid Review Queue</h2>
          <p className="text-xs text-muted-foreground">{tasks.length} bids pending approval</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadReviewQueue}>
          Refresh
        </Button>
      </div>

      {/* Queue List */}
      {tasks.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No pending bids for review
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => {
            const metadata = JSON.parse(task.metadata || '{}');
            return (
              <div
                key={task.id}
                className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                  selectedTask?.id === task.id
                    ? "bg-primary/10 border-primary"
                    : "bg-card hover:bg-secondary"
                }`}
                onClick={() => viewBid(task)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">
                      {task.task_description.split(' - ')[0]}
                    </h3>
                    <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                      {metadata.estimatedValue && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          ${metadata.estimatedValue.toLocaleString()}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(task.created_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        viewBid(task);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-green-600 hover:bg-green-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        approveBid(task);
                      }}
                      disabled={approving === task.id}
                    >
                      {approving === task.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        rejectBid(task);
                      }}
                      disabled={approving === task.id}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bid Details Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bid Review & Approval</DialogTitle>
          </DialogHeader>

          {bidDetails && (
            <div className="space-y-4">
              {/* Job Info */}
              <div className="border-b pb-3">
                <h3 className="font-semibold text-sm mb-2">{bidDetails.job.job_name}</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Location:</span>
                    <p className="font-medium">{bidDetails.job.city}, {bidDetails.job.state}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <p className="font-medium">{bidDetails.job.project_type}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Flooring Sqft:</span>
                    <p className="font-medium">{bidDetails.job.flooring_sqft?.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">GC:</span>
                    <p className="font-medium">{bidDetails.job.gc_name}</p>
                  </div>
                </div>
              </div>

              {/* Bid Summary */}
              <div className="border-b pb-3">
                <h4 className="font-semibold text-sm mb-2">Bid Summary</h4>
                <div className="bg-secondary/30 rounded p-2 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Materials:</span>
                    <span>${bidDetails.bidDoc.total_material_cost?.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Labor:</span>
                    <span>${bidDetails.bidDoc.total_labor_cost?.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overhead:</span>
                    <span>${bidDetails.bidDoc.overhead_markup?.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-1 mt-1">
                    <span>Total Bid:</span>
                    <span className="text-primary">${bidDetails.bidDoc.total_bid_value?.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                  </div>
                </div>
              </div>

              {/* Scope of Work */}
              <div className="border-b pb-3">
                <h4 className="font-semibold text-sm mb-1">Scope of Work</h4>
                <p className="text-xs text-muted-foreground">{bidDetails.bidDoc.scope_of_work}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setSelectedTask(null);
                    rejectBid(selectedTask);
                  }}
                  disabled={approving}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => approveBid(selectedTask)}
                  disabled={approving}
                >
                  {approving ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  )}
                  Approve
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    approveBid(selectedTask);
                    setTimeout(() => sendBid(selectedTask), 500);
                  }}
                  disabled={approving}
                >
                  {approving ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Approve & Send
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}