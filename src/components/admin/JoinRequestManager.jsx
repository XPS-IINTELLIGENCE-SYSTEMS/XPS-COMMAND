import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { UserPlus, Check, X, Loader2, Clock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateAccessCode } from "@/lib/accessControl";

export default function JoinRequestManager() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => { loadRequests(); }, []);

  const loadRequests = async () => {
    const list = await base44.entities.JoinRequest.list("-created_date", 100);
    setRequests(list);
    setLoading(false);
  };

  const handleApprove = async (request) => {
    setProcessing(request.id);
    
    // Generate access code
    const code = generateAccessCode();
    await base44.entities.AccessCode.create({
      code,
      user_type: request.requested_type || "saas",
      assigned_email: request.email,
      assigned_name: request.name,
      allowed_tools: "[]",
      access_level: "trial",
      package: "free",
      expires_at: new Date(Date.now() + 10 * 86400000).toISOString(),
      duration_days: 10,
      max_uses: 1,
      status: "active",
    });

    // Send invite
    await base44.functions.invoke("sendAccessInvite", {
      email: request.email,
      name: request.name,
      code,
      method: "email",
    }).catch(() => {});

    // Update request status
    await base44.entities.JoinRequest.update(request.id, {
      status: "approved",
      reviewed_at: new Date().toISOString(),
    });

    await loadRequests();
    setProcessing(null);
  };

  const handleDeny = async (id) => {
    setProcessing(id);
    await base44.entities.JoinRequest.update(id, {
      status: "denied",
      reviewed_at: new Date().toISOString(),
    });
    await loadRequests();
    setProcessing(null);
  };

  const pending = requests.filter(r => r.status === "pending");
  const reviewed = requests.filter(r => r.status !== "pending");

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center gap-2">
          <Clock className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-semibold">Pending Requests ({pending.length})</span>
        </div>
        {pending.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">No pending requests</div>
        ) : (
          <div className="divide-y divide-border">
            {pending.map(r => (
              <div key={r.id} className="px-5 py-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-yellow-400/10 flex items-center justify-center text-yellow-400 font-bold text-sm flex-shrink-0">
                  {(r.name || "?")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.email}</div>
                  {r.company && <div className="text-xs text-muted-foreground">{r.company}</div>}
                  {r.message && <div className="text-xs text-foreground/70 mt-1 italic">"{r.message}"</div>}
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {r.requested_type === "company" ? "Company" : "SaaS"} • {new Date(r.created_date).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(r)}
                    disabled={processing === r.id}
                    className="gap-1 h-8"
                  >
                    {processing === r.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeny(r.id)}
                    disabled={processing === r.id}
                    className="gap-1 h-8"
                  >
                    <X className="w-3 h-3" /> Deny
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reviewed History */}
      {reviewed.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <span className="text-sm font-semibold text-muted-foreground">History ({reviewed.length})</span>
          </div>
          <div className="divide-y divide-border">
            {reviewed.slice(0, 20).map(r => (
              <div key={r.id} className="px-5 py-3 flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground">
                  {(r.name || "?")[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium">{r.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">{r.email}</span>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  r.status === "approved" ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10"
                }`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}