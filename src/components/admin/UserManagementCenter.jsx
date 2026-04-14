import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, UserPlus, Shield, Search, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getRoleLabel, getRoleColor, ROLE_LIMITS } from "@/lib/permissions";

export default function UserManagementCenter() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("team_member");
  const [inviting, setInviting] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.User.list("-created_date", 100);
    setUsers(data);
    setLoading(false);
  };

  const inviteUser = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      // Check role limits
      const roleCount = users.filter(u => u.role === inviteRole).length;
      const limit = ROLE_LIMITS[inviteRole];
      if (roleCount >= limit) {
        alert(`Maximum ${limit} ${getRoleLabel(inviteRole)} accounts allowed.`);
        setInviting(false);
        return;
      }
      await base44.users.inviteUser(inviteEmail.trim(), inviteRole === "owner" || inviteRole === "admin" ? "admin" : "user");
      setInviteEmail("");
      setShowInvite(false);
      load();
    } catch (e) {
      alert("Error inviting user: " + e.message);
    }
    setInviting(false);
  };

  const updateRole = async (userId, newRole) => {
    await base44.entities.User.update(userId, { role: newRole });
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };

  const filtered = users.filter(u =>
    !search || (u.email?.toLowerCase().includes(search.toLowerCase()) || u.full_name?.toLowerCase().includes(search.toLowerCase()))
  );

  // Role counts
  const roleCounts = { owner: 0, admin: 0, manager: 0, team_member: 0 };
  users.forEach(u => { const r = u.role || "team_member"; if (roleCounts[r] !== undefined) roleCounts[r]++; });

  if (loading) return <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>;

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="text-base font-bold text-foreground">User Management</h3>
        </div>
        <Dialog open={showInvite} onOpenChange={setShowInvite}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><UserPlus className="w-3.5 h-3.5" /> Invite</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Invite Team Member</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-2">
              <Input placeholder="Email address" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="team_member">Team Member (max {ROLE_LIMITS.team_member})</SelectItem>
                  <SelectItem value="manager">Manager (max {ROLE_LIMITS.manager})</SelectItem>
                  <SelectItem value="admin">Admin (max {ROLE_LIMITS.admin})</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={inviteUser} disabled={inviting} className="w-full">
                {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Invitation"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Role counts */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {Object.entries(roleCounts).map(([role, count]) => (
          <div key={role} className="rounded-lg p-2 text-center bg-secondary/30">
            <div className="text-sm font-bold" style={{ color: getRoleColor(role) }}>{count}/{ROLE_LIMITS[role]}</div>
            <div className="text-[10px] text-muted-foreground">{getRoleLabel(role)}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-transparent h-8 text-xs" />
      </div>

      {/* User list */}
      <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
        {filtered.map(u => (
          <div key={u.id} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-foreground truncate">{u.full_name || u.email}</div>
              <div className="text-[10px] text-muted-foreground truncate">{u.email}</div>
            </div>
            <div className="flex items-center gap-2 ml-2">
              <Badge className="text-[10px] px-1.5 py-0" style={{ background: `${getRoleColor(u.role)}20`, color: getRoleColor(u.role), border: "none" }}>
                {getRoleLabel(u.role || "team_member")}
              </Badge>
              <Select value={u.role || "team_member"} onValueChange={(v) => updateRole(u.id, v)}>
                <SelectTrigger className="h-6 w-6 p-0 border-0 bg-transparent">
                  <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="team_member">Team Member</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}