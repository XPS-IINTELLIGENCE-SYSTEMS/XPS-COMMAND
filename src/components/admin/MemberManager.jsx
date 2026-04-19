import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, Loader2, Shield, Ban, Check, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ALL_TOOL_IDS, TOOL_LABELS, PACKAGES } from "@/lib/accessControl";

export default function MemberManager({ filterType }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => { loadMembers(); }, [filterType]);

  const loadMembers = async () => {
    setLoading(true);
    const all = await base44.entities.MemberProfile.list("-created_date", 200);
    const filtered = filterType ? all.filter(m => m.user_type === filterType) : all;
    setMembers(filtered);
    setLoading(false);
  };

  const startEdit = (member) => {
    let tools = [];
    try { tools = JSON.parse(member.allowed_tools || "[]"); } catch {}
    setEditingId(member.id);
    setEditForm({
      status: member.status,
      package: member.package,
      allowed_tools: tools,
      selectAll: tools.length === 0,
      can_download: member.can_download,
      can_export: member.can_export,
    });
  };

  const saveEdit = async (id) => {
    await base44.entities.MemberProfile.update(id, {
      status: editForm.status,
      package: editForm.package,
      allowed_tools: editForm.selectAll ? "[]" : JSON.stringify(editForm.allowed_tools),
      can_download: editForm.can_download,
      can_export: editForm.can_export,
    });
    setEditingId(null);
    await loadMembers();
  };

  const revokeMember = async (id) => {
    await base44.entities.MemberProfile.update(id, { status: "suspended" });
    await loadMembers();
  };

  const toggleTool = (toolId) => {
    setEditForm(f => ({
      ...f,
      allowed_tools: f.allowed_tools.includes(toolId)
        ? f.allowed_tools.filter(t => t !== toolId)
        : [...f.allowed_tools, toolId],
    }));
  };

  const statusColors = {
    active: "text-green-400 bg-green-400/10",
    trial: "text-yellow-400 bg-yellow-400/10",
    suspended: "text-red-400 bg-red-400/10",
    expired: "text-orange-400 bg-orange-400/10",
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-3 border-b border-border flex items-center gap-2">
        <Users className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold">{members.length} {filterType === "company" ? "Company" : filterType === "saas" ? "SaaS" : "All"} Members</span>
      </div>
      {members.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">No members in this category</div>
      ) : (
        <div className="divide-y divide-border">
          {members.map(m => (
            <div key={m.id} className="px-5 py-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                  {(m.name || m.email || "?")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{m.name || "—"}</div>
                  <div className="text-[11px] text-muted-foreground">{m.email} • {m.package || "free"}</div>
                  {m.trial_end && (
                    <div className="text-[10px] text-muted-foreground">
                      Trial ends: {new Date(m.trial_end).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[m.status] || ""}`}>
                  {m.status}
                </span>
                <div className="flex items-center gap-1">
                  {m.privacy_accepted && <Shield className="w-3 h-3 text-green-400" title="Privacy accepted" />}
                  {m.data_sharing_consent && <Check className="w-3 h-3 text-blue-400" title="Data sharing consented" />}
                </div>
                <button onClick={() => startEdit(m)} className="p-1.5 hover:bg-secondary rounded text-muted-foreground">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                {m.status !== "suspended" && (
                  <button onClick={() => revokeMember(m.id)} className="p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-destructive" title="Revoke access">
                    <Ban className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Inline Edit */}
              {editingId === m.id && (
                <div className="mt-3 p-3 rounded-lg bg-secondary/30 border border-border space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Select value={editForm.status} onValueChange={v => setEditForm({ ...editForm, status: v })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="trial">Trial</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={editForm.package} onValueChange={v => setEditForm({ ...editForm, package: v })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(PACKAGES).map(([k, p]) => (
                          <SelectItem key={k} value={k}>{p.name}</SelectItem>
                        ))}
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <label className="flex items-center gap-2 text-xs">
                      <input type="checkbox" checked={editForm.can_download} onChange={e => setEditForm({ ...editForm, can_download: e.target.checked })} />
                      Can Download
                    </label>
                    <label className="flex items-center gap-2 text-xs">
                      <input type="checkbox" checked={editForm.can_export} onChange={e => setEditForm({ ...editForm, can_export: e.target.checked })} />
                      Can Export
                    </label>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-medium text-muted-foreground">Tool Access:</span>
                      <button onClick={() => setEditForm(f => ({ ...f, selectAll: !f.selectAll, allowed_tools: f.selectAll ? [] : ALL_TOOL_IDS }))} className="text-[10px] text-primary hover:underline">
                        {editForm.selectAll ? "Manually Select" : "Select All"}
                      </button>
                    </div>
                    {!editForm.selectAll && (
                      <div className="flex flex-wrap gap-1">
                        {ALL_TOOL_IDS.filter(id => id !== "admin").map(id => (
                          <button
                            key={id}
                            onClick={() => toggleTool(id)}
                            className={`px-1.5 py-0.5 text-[9px] rounded border transition-colors ${
                              editForm.allowed_tools.includes(id)
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border text-muted-foreground"
                            }`}
                          >
                            {TOOL_LABELS[id] || id}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => saveEdit(m.id)} className="h-7 gap-1 text-xs">
                      <Check className="w-3 h-3" /> Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)} className="h-7 gap-1 text-xs">
                      <X className="w-3 h-3" /> Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}