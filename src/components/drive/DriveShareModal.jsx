import { useState } from "react";
import { X, UserPlus, Copy, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function DriveShareModal({ item, onClose, onUpdate }) {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState(item.share_permission || "view");
  const [copied, setCopied] = useState(false);

  const existingShares = (() => {
    try { return JSON.parse(item.shared_with || "[]"); } catch { return []; }
  })();
  const [shares, setShares] = useState(existingShares);

  const handleAddEmail = () => {
    if (!email.trim() || shares.includes(email.trim())) return;
    const updated = [...shares, email.trim()];
    setShares(updated);
    onUpdate({ shared_with: JSON.stringify(updated), share_permission: permission });
    setEmail("");
  };

  const handleRemoveEmail = (e) => {
    const updated = shares.filter(s => s !== e);
    setShares(updated);
    onUpdate({ shared_with: JSON.stringify(updated) });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/projects?item=${item.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[420px] bg-background border border-border rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-bold text-foreground">Share "{item.name}"</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-secondary"><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Add people */}
          <div className="flex gap-2">
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Add email..."
              className="flex-1"
              onKeyDown={(e) => { if (e.key === "Enter") handleAddEmail(); }}
            />
            <Select value={permission} onValueChange={setPermission}>
              <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="view">View</SelectItem>
                <SelectItem value="edit">Edit</SelectItem>
                <SelectItem value="comment">Comment</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={handleAddEmail} disabled={!email.trim()}>
              <UserPlus className="w-4 h-4" />
            </Button>
          </div>

          {/* Shared with list */}
          {shares.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-semibold text-muted-foreground mb-1">Shared with</div>
              {shares.map((s) => (
                <div key={s} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/[0.03]">
                  <span className="text-sm text-foreground">{s}</span>
                  <button onClick={() => handleRemoveEmail(s)} className="text-xs text-destructive hover:underline">Remove</button>
                </div>
              ))}
            </div>
          )}

          {/* Copy link */}
          <Button variant="outline" className="w-full gap-2" onClick={handleCopyLink}>
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {copied ? "Link Copied!" : "Copy Link"}
          </Button>
        </div>
      </div>
    </>
  );
}