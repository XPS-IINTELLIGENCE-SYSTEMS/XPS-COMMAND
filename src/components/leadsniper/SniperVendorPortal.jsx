import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Truck, Plus, Loader2, X, Star, Send, CheckCircle2, Clock, DollarSign, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const STATUS_COLORS = {
  rfq_sent: "bg-blue-500/20 text-blue-400",
  quote_received: "bg-yellow-500/20 text-yellow-400",
  accepted: "bg-green-500/20 text-green-400",
  rejected: "bg-red-500/20 text-red-400",
  expired: "bg-secondary text-muted-foreground",
};

export default function SniperVendorPortal() {
  const [vendors, setVendors] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ company_name: "", contact_name: "", email: "", phone: "", product_categories: "" });
  const [tab, setTab] = useState("vendors");

  useEffect(() => {
    Promise.all([
      base44.entities.MaterialVendor.list("-created_date", 200).catch(() => []),
      base44.entities.VendorQuote.list("-created_date", 200).catch(() => []),
    ]).then(([v, q]) => { setVendors(v); setQuotes(q); setLoading(false); });
  }, []);

  const addVendor = async () => {
    if (!form.company_name.trim() || !form.email.trim()) return;
    setSaving(true);
    const cats = form.product_categories.split(",").map(s => s.trim()).filter(Boolean);
    const v = await base44.entities.MaterialVendor.create({
      company_name: form.company_name.trim(),
      contact_name: form.contact_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      product_categories: JSON.stringify(cats),
      pricing_tier: "mid_range",
      rating: 3,
      is_preferred: false,
    });
    setVendors(prev => [v, ...prev]);
    setForm({ company_name: "", contact_name: "", email: "", phone: "", product_categories: "" });
    setShowAdd(false);
    setSaving(false);
  };

  const deleteVendor = async (id) => {
    await base44.entities.MaterialVendor.delete(id);
    setVendors(prev => prev.filter(v => v.id !== id));
  };

  const togglePreferred = async (vendor) => {
    await base44.entities.MaterialVendor.update(vendor.id, { is_preferred: !vendor.is_preferred });
    setVendors(prev => prev.map(v => v.id === vendor.id ? { ...v, is_preferred: !v.is_preferred } : v));
  };

  // Price comparison chart
  const priceComparison = useMemo(() => {
    const byScope = {};
    quotes.filter(q => q.quoted_price > 0).forEach(q => {
      if (!byScope[q.scope_name]) byScope[q.scope_name] = [];
      byScope[q.scope_name].push({ vendor: q.vendor_name, price: q.quoted_price });
    });
    return Object.entries(byScope).map(([scope, vendors]) => ({
      scope: scope.length > 20 ? scope.slice(0, 20) + "…" : scope,
      ...Object.fromEntries(vendors.map(v => [v.vendor, v.price])),
    }));
  }, [quotes]);

  if (loading) return <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-primary" /></div>;

  return (
    <div className="glass-card rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 metallic-gold-icon" />
          <span className="text-xs font-bold metallic-gold">Vendor Portal</span>
          <span className="text-[10px] text-muted-foreground">{vendors.length} suppliers</span>
        </div>
        <div className="flex gap-1">
          <TabBtn active={tab === "vendors"} onClick={() => setTab("vendors")} label="Vendors" />
          <TabBtn active={tab === "quotes"} onClick={() => setTab("quotes")} label={`Quotes (${quotes.length})`} />
          <TabBtn active={tab === "compare"} onClick={() => setTab("compare")} label="Compare" />
        </div>
      </div>

      {/* VENDORS TAB */}
      {tab === "vendors" && (
        <>
          <div className="flex justify-end">
            <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => setShowAdd(!showAdd)}>
              {showAdd ? <X className="w-3 h-3 mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
              {showAdd ? "Cancel" : "Add Vendor"}
            </Button>
          </div>

          {showAdd && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <Input value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} placeholder="Company name *" className="h-8 text-xs glass-input" />
              <Input value={form.contact_name} onChange={e => setForm({ ...form, contact_name: e.target.value })} placeholder="Contact name" className="h-8 text-xs glass-input" />
              <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email *" className="h-8 text-xs glass-input" />
              <Input value={form.product_categories} onChange={e => setForm({ ...form, product_categories: e.target.value })} placeholder="Categories (comma sep)" className="h-8 text-xs glass-input" />
              <Button size="sm" onClick={addVendor} disabled={saving || !form.company_name || !form.email} className="h-8 text-xs metallic-gold-bg text-background">
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
              </Button>
            </div>
          )}

          <div className="overflow-x-auto max-h-[280px] overflow-y-auto">
            <table className="w-full text-[10px]">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-1.5 px-2">Company</th>
                  <th className="py-1.5 px-2">Contact</th>
                  <th className="py-1.5 px-2">Email</th>
                  <th className="py-1.5 px-2">Categories</th>
                  <th className="py-1.5 px-2">Tier</th>
                  <th className="py-1.5 px-2 w-16"></th>
                </tr>
              </thead>
              <tbody>
                {vendors.map(v => (
                  <tr key={v.id} className="border-b border-border/20 hover:bg-white/[0.03]">
                    <td className="py-1.5 px-2 font-medium text-foreground">{v.company_name}</td>
                    <td className="py-1.5 px-2 text-muted-foreground">{v.contact_name || "—"}</td>
                    <td className="py-1.5 px-2 text-muted-foreground">{v.email}</td>
                    <td className="py-1.5 px-2 text-muted-foreground truncate max-w-[120px]">
                      {(() => { try { return JSON.parse(v.product_categories || "[]").join(", "); } catch { return "—"; } })()}
                    </td>
                    <td className="py-1.5 px-2 capitalize text-muted-foreground">{(v.pricing_tier || "mid_range").replace(/_/g, " ")}</td>
                    <td className="py-1.5 px-2">
                      <div className="flex gap-1">
                        <button onClick={() => togglePreferred(v)} className="p-1 rounded hover:bg-primary/20">
                          <Star className={`w-3 h-3 ${v.is_preferred ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                        </button>
                        <button onClick={() => deleteVendor(v.id)} className="p-1 rounded hover:bg-red-500/20 text-muted-foreground hover:text-red-400">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* QUOTES TAB */}
      {tab === "quotes" && (
        <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
          {quotes.length === 0 ? (
            <p className="text-[10px] text-muted-foreground text-center py-6">No quotes yet — use "Request Quotes" from a scope detail</p>
          ) : (
            <table className="w-full text-[10px]">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-1.5 px-2">Vendor</th>
                  <th className="py-1.5 px-2">Project</th>
                  <th className="py-1.5 px-2">Status</th>
                  <th className="py-1.5 px-2">Quoted Price</th>
                  <th className="py-1.5 px-2">Lead Time</th>
                  <th className="py-1.5 px-2">Sent</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map(q => (
                  <tr key={q.id} className="border-b border-border/20 hover:bg-white/[0.03]">
                    <td className="py-1.5 px-2 font-medium text-foreground">{q.vendor_name}</td>
                    <td className="py-1.5 px-2 text-muted-foreground truncate max-w-[140px]">{q.scope_name}</td>
                    <td className="py-1.5 px-2">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${STATUS_COLORS[q.status] || STATUS_COLORS.rfq_sent}`}>
                        {(q.status || "rfq_sent").replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-1.5 px-2 text-foreground">{q.quoted_price ? `$${q.quoted_price.toLocaleString()}` : "—"}</td>
                    <td className="py-1.5 px-2 text-muted-foreground">{q.quoted_lead_time_days ? `${q.quoted_lead_time_days}d` : "—"}</td>
                    <td className="py-1.5 px-2 text-muted-foreground/60">{q.rfq_sent_date ? new Date(q.rfq_sent_date).toLocaleDateString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* COMPARE TAB */}
      {tab === "compare" && (
        priceComparison.length > 0 ? (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priceComparison}>
                <XAxis dataKey="scope" tick={{ fontSize: 9, fill: "#888" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "#888" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ background: "hsl(240 8% 7%)", border: "1px solid hsl(240 6% 14%)", borderRadius: 8, fontSize: 11 }} formatter={v => [`$${v.toLocaleString()}`, ""]} />
                {[...new Set(quotes.filter(q => q.quoted_price > 0).map(q => q.vendor_name))].slice(0, 5).map((name, i) => (
                  <Bar key={name} dataKey={name} fill={["#d4af37", "#06b6d4", "#22c55e", "#8b5cf6", "#f59e0b"][i % 5]} radius={[3, 3, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-[10px] text-muted-foreground text-center py-6">No price comparisons available yet</p>
        )
      )}
    </div>
  );
}

function TabBtn({ active, onClick, label }) {
  return (
    <button onClick={onClick} className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${active ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-white/[0.04]"}`}>
      {label}
    </button>
  );
}