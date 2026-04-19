import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Key, Plus, Send, Copy, Trash2, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ALL_TOOL_IDS, TOOL_LABELS, generateAccessCode, PACKAGES } from "@/lib/accessControl";

export default function AccessCodeManager() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(null);

  // Form state
  const [form, setForm] = useState({
    email: "", name: "", phone: "",
    user_type: "saas", access_level: "trial",
    package: "free", duration_days: 10,
    selectedTools: [],
    selectAll: true,
    sendMethod: "email",
  });

  useEffect(() => { loadCodes(); }, []);

  const loadCodes = async () => {
    const list = await base44.entities.AccessCode.list("-created_date", 100);
    setCodes(list);
    setLoading(false);
  };

  const handleCreate = async () => {
    setCreating(true);
    const code = generateAccessCode();
    const expiresAt = form.duration_days > 0
      ? new Date(Date.now() + form.duration_days * 86400000).toISOString()
      : null;

    const newCode = await base44.entities.AccessCode.create({
      code,
      user_type: form.user_type,
      assigned_email: form.email || "",
      assigned_name: form.name || "",
      allowed_tools: form.selectAll ? "[]" : JSON.stringify(form.selectedTools),
      access_level: form.access_level,
      package: form.package,
      expires_at: expiresAt,
      duration_days: form.duration_days,
      max_uses: 1,
      used_count: 0,
      status: "active",
    });

    // Send invite if email provided
    if (form.email) {
      await base44.functions.invoke("sendAccessInvite", {
        email: form.email,
        name: form.name,
        code,
        method: form.sendMethod,
        phone: form.phone,
      }).catch(() => {});
    }

    setForm({ ...form, email: "", name: "", phone: "" });
    await loadCodes();
    setCreating(false);
  };

  const handleRevoke = async (id) => {
    await base44.entities.AccessCode.update(id, { status: "revoked" });
    await loadCodes();
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleTool = (toolId) => {
    setForm(f => ({
      ...f,
      selectedTools: f.selectedTools.includes(toolId)
        ? f.selectedTools.filter(t => t !== toolId)
        : [...f.selectedTools, toolId],
    }));
  };

  const statusColors = {
    active: "text-green-400 bg-green-400/10",
    used: "text-blue-400 bg-blue-400/10",
    expired: "text-yellow-400 bg-yellow-400/10",
    revoked: "text-red-400 bg-red-400/10",
  };

  return (
    <div className="space-y-6">
      {/* Create Code Form */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Key className="w-4 h-4 text-primary" /> Generate Access Code
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <Input placeholder="Email (optional)" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="bg-secondary/50" />
          <Input placeholder="Name (optional)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-secondary/50" />
          <Input placeholder="Phone (optional)" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="bg-secondary/50" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          <Select value={form.user_type} onValueChange={v => setForm({ ...form, user_type: v })}>
            <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="company">Company (Internal)</SelectItem>
              <SelectItem value="saas">SaaS (External)</SelectItem>
            </SelectContent>
          </Select>
          <Select value={form.access_level} onValueChange={v => setForm({ ...form, access_level: v })}>
            <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="full">Full Access</SelectItem>
              <SelectItem value="limited">Limited</SelectItem>
              <SelectItem value="trial">Trial</SelectItem>
            </SelectContent>
          </Select>
          <Select value={form.package} onValueChange={v => setForm({ ...form, package: v })}>
            <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(PACKAGES).map(([k, p]) => (
                <SelectItem key={k} value={k}>{p.name} {p.price > 0 ? `($${p.price}/mo)` : ""}</SelectItem>
              ))}
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          <Select value={String(form.duration_days)} onValueChange={v => setForm({ ...form, duration_days: parseInt(v) })}>
            <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="0">No Expiration</SelectItem>
              <SelectItem value="1">1 Day</SelectItem>
              <SelectItem value="7">7 Days</SelectItem>
              <SelectItem value="10">10 Days</SelectItem>
              <SelectItem value="30">30 Days</SelectItem>
              <SelectItem value="90">90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={form.sendMethod} onValueChange={v => setForm({ ...form, sendMethod: v })}>
            <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Send via Email</SelectItem>
              <SelectItem value="sms">Send via SMS</SelectItem>
              <SelectItem value="both">Email + SMS</SelectItem>
              <SelectItem value="none">Don't Send</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tool Selection */}
        {form.access_level === "limited" && (
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              <label className="text-xs font-medium text-muted-foreground">Tool Access:</label>
              <button
                onClick={() => setForm(f => ({ ...f, selectAll: !f.selectAll, selectedTools: f.selectAll ? [] : ALL_TOOL_IDS }))}
                className="text-xs text-primary hover:underline"
              >
                {form.selectAll ? "Manually Select" : "Select All"}
              </button>
            </div>
            {!form.selectAll && (
              <div className="flex flex-wrap gap-1.5">
                {ALL_TOOL_IDS.filter(id => id !== "admin" && id !== "settings").map(id => (
                  <button
                    key={id}
                    onClick={() => toggleTool(id)}
                    className={`px-2 py-1 text-[10px] rounded-md border transition-colors ${
                      form.selectedTools.includes(id)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {TOOL_LABELS[id] || id}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <Button onClick={handleCreate} disabled={creating} className="gap-2">
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Generate Code {form.email && "& Send Invite"}
        </Button>
      </div>

      {/* Existing Codes */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <span className="text-sm font-semibold">{codes.length} Access Codes</span>
        </div>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : codes.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">No access codes created yet</div>
        ) : (
          <div className="divide-y divide-border">
            {codes.map(c => (
              <div key={c.id} className="px-5 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-primary">{c.code}</span>
                    <button onClick={() => copyCode(c.code)} className="p-1 hover:bg-secondary rounded">
                      {copied === c.code ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
                    </button>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {c.assigned_name || c.assigned_email || "Unassigned"} • {c.user_type} • {c.package || "free"}
                    {c.expires_at && ` • Expires ${new Date(c.expires_at).toLocaleDateString()}`}
                  </div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[c.status] || ""}`}>
                  {c.status}
                </span>
                {c.status === "active" && (
                  <button onClick={() => handleRevoke(c.id)} className="p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}