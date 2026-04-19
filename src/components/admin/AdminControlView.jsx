import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Shield, UserPlus, Key, Link2, Users, Loader2, Trash2, Copy, Eye, EyeOff, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminControlView() {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Admin Control</h1>
        <p className="text-sm text-muted-foreground">Manage users, API keys, integrations, and promo codes</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border">
        {[
          { id: "users", label: "User Management", icon: Users },
          { id: "api_keys", label: "API Keys", icon: Key },
          { id: "integrations", label: "Integrations", icon: Link2 },
          { id: "promo", label: "Promo Codes", icon: Tag },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "users" && <UserManagementTab />}
      {activeTab === "api_keys" && <APIKeysTab />}
      {activeTab === "integrations" && <IntegrationsTab />}
      {activeTab === "promo" && <PromoCodesTab />}
    </div>
  );
}

function UserManagementTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [tempPassword, setTempPassword] = useState("");
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const list = await base44.entities.User.list("-created_date", 100);
    setUsers(list);
    setLoading(false);
  };

  const handleInvite = async () => {
    if (!email) return;
    setInviting(true);
    await base44.users.inviteUser(email, role);
    // Store the temp password and name in UserProfile
    await base44.entities.UserProfile.create({
      user_email: email,
      full_name: name,
      ai_preferences: JSON.stringify({ temp_password: tempPassword }),
    });
    setName(""); setEmail(""); setTempPassword("");
    await loadUsers();
    setInviting(false);
  };

  return (
    <div className="space-y-6">
      {/* Invite Form */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-primary" /> Add New User
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <Input placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className="bg-secondary/50" />
          <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="bg-secondary/50" />
          <Input placeholder="Temporary Password" value={tempPassword} onChange={e => setTempPassword(e.target.value)} className="bg-secondary/50" />
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleInvite} disabled={inviting} className="gap-2">
            {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            Invite User
          </Button>
        </div>
      </div>

      {/* User List */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <span className="text-sm font-semibold">{users.length} Users</span>
        </div>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="divide-y divide-border">
            {users.map(u => (
              <div key={u.id} className="px-5 py-3 flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {(u.full_name || u.email || "?")[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{u.full_name || "—"}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === "admin" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function APIKeysTab() {
  const [connectors, setConnectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("custom");
  const [newKey, setNewKey] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [showKeys, setShowKeys] = useState({});

  useEffect(() => {
    loadConnectors();
  }, []);

  const loadConnectors = async () => {
    const list = await base44.entities.APIConnector.list("-created_date", 50);
    setConnectors(list);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newName || !newKey) return;
    await base44.entities.APIConnector.create({
      name: newName,
      service_type: newType,
      api_key: newKey,
      base_url: newUrl,
      is_enabled: true,
      connection_status: "pending",
    });
    setNewName(""); setNewKey(""); setNewUrl("");
    await loadConnectors();
  };

  const toggleShow = (id) => setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Key className="w-4 h-4 text-primary" /> Add API Key
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <Input placeholder="Name (e.g., OpenAI)" value={newName} onChange={e => setNewName(e.target.value)} className="bg-secondary/50" />
          <Select value={newType} onValueChange={setNewType}>
            <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["custom","openai","anthropic","groq","stripe","hubspot","airtable","github","vercel","slack","sendgrid","apolloio","apify","zoominfo"].map(t => (
                <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input placeholder="API Key" value={newKey} onChange={e => setNewKey(e.target.value)} type="password" className="bg-secondary/50" />
          <Input placeholder="Base URL (optional)" value={newUrl} onChange={e => setNewUrl(e.target.value)} className="bg-secondary/50" />
          <Button onClick={handleAdd} className="gap-2"><Key className="w-4 h-4" /> Add Key</Button>
        </div>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <span className="text-sm font-semibold">{connectors.length} API Keys</span>
        </div>
        <div className="divide-y divide-border">
          {connectors.map(c => (
            <div key={c.id} className="px-5 py-3 flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                <Key className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.service_type} • {c.connection_status || "pending"}</div>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                {showKeys[c.id] ? (c.api_key || "").slice(0, 20) + "..." : "••••••••••••"}
                <button onClick={() => toggleShow(c.id)} className="p-1 hover:bg-secondary rounded">
                  {showKeys[c.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
              </div>
              <span className={`w-2 h-2 rounded-full ${c.connection_status === "connected" ? "bg-green-500" : c.connection_status === "error" ? "bg-red-500" : "bg-yellow-500"}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function IntegrationsTab() {
  const integrations = [
    { name: "HubSpot CRM", desc: "Sync leads, contacts, and deals", status: "connected", category: "CRM" },
    { name: "Gmail / Google Workspace", desc: "Email sending, tracking, and calendar sync", status: "connected", category: "EMAIL" },
    { name: "Twilio SMS", desc: "SMS outreach and automated messaging", status: "configured", category: "SMS" },
    { name: "Google Calendar", desc: "Schedule meetings, reminders, and follow-ups", status: "configured", category: "CALENDAR" },
    { name: "Google Drive", desc: "Document storage and sharing", status: "connected", category: "STORAGE" },
    { name: "Google Sheets", desc: "Spreadsheet data sync", status: "configured", category: "DATA" },
    { name: "Google Docs", desc: "Document creation and editing", status: "configured", category: "DOCS" },
    { name: "Google Tasks", desc: "Task management", status: "configured", category: "TASKS" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {integrations.map(i => (
        <div key={i.name} className="glass-card rounded-xl p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Link2 className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
              i.status === "connected" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"
            }`}>
              {i.status === "connected" ? "● Connected" : "● Configured"}
            </span>
          </div>
          <h4 className="font-semibold text-sm">{i.name}</h4>
          <p className="text-xs text-muted-foreground mt-1">{i.desc}</p>
          <div className="text-[10px] text-muted-foreground mt-2 tracking-wider">{i.category}</div>
        </div>
      ))}
    </div>
  );
}

function PromoCodesTab() {
  const [codes, setCodes] = useState([]);
  const [newCode, setNewCode] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = async () => {
    const all = await base44.entities.SiteSettings.filter({ category: "custom" }, "-created_date", 50);
    setCodes(all.filter(s => s.setting_key.startsWith("promo_")));
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newCode) return;
    await base44.entities.SiteSettings.create({
      setting_key: `promo_${newCode.toLowerCase().replace(/\s/g, "_")}`,
      setting_value: newCode,
      category: "custom",
      description: newDesc || "Promo code",
      is_active: true,
    });
    setNewCode(""); setNewDesc("");
    await loadCodes();
  };

  const handleDelete = async (id) => {
    await base44.entities.SiteSettings.delete(id);
    await loadCodes();
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Tag className="w-4 h-4 text-primary" /> Create Promo Code
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input placeholder="Promo Code" value={newCode} onChange={e => setNewCode(e.target.value)} className="bg-secondary/50" />
          <Input placeholder="Description" value={newDesc} onChange={e => setNewDesc(e.target.value)} className="bg-secondary/50" />
          <Button onClick={handleAdd} className="gap-2"><Tag className="w-4 h-4" /> Create Code</Button>
        </div>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <span className="text-sm font-semibold">{codes.length} Promo Codes</span>
        </div>
        <div className="divide-y divide-border">
          {codes.map(c => (
            <div key={c.id} className="px-5 py-3 flex items-center gap-4">
              <Tag className="w-4 h-4 text-primary" />
              <div className="flex-1">
                <div className="font-mono font-bold text-sm">{c.setting_value}</div>
                <div className="text-xs text-muted-foreground">{c.description}</div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${c.is_active ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                {c.is_active ? "Active" : "Inactive"}
              </span>
              <button onClick={() => handleDelete(c.id)} className="p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-destructive">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {codes.length === 0 && !loading && (
            <div className="px-5 py-6 text-center text-sm text-muted-foreground">No promo codes yet</div>
          )}
        </div>
      </div>
    </div>
  );
}