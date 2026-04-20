import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, Send, CheckCircle2, Loader2, LogOut } from "lucide-react";

export default function UserNotRegisteredError() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleRequestAccess = async () => {
    if (!name.trim() || !email.trim()) return;
    setSubmitting(true);
    await base44.entities.JoinRequest.create({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      company: company.trim(),
      message: message.trim(),
      requested_type: "saas",
      status: "pending",
    });

    // Notify admin
    await base44.integrations.Core.SendEmail({
      to: "jeremy@shopxps.com",
      subject: `[ACCESS REQUEST] ${name} — ${company || "N/A"}`,
      body: `New access request submitted:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || "N/A"}\nCompany: ${company || "N/A"}\nMessage: ${message || "N/A"}\n\nReview and approve in the Admin Control panel.`,
      from_name: "XPS Intelligence",
    }).catch(() => {});

    setSubmitted(true);
    setSubmitting(false);
  };

  const handleLogout = () => {
    base44.auth.logout(window.location.origin);
  };

  return (
    <div className="min-h-screen bg-background hex-bg flex flex-col items-center justify-center px-4 relative">
      {/* Hex pattern overlay */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100' viewBox='0 0 56 100'%3E%3Cpath d='M28 66L0 50L0 16L28 0L56 16L56 50L28 66ZM28 100L0 84L0 50L28 34L56 50L56 84L28 100Z' fill='none' stroke='rgba(192,192,192,0.08)' stroke-width='0.8'/%3E%3C/svg%3E\")",
        backgroundSize: "56px 100px"
      }} />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <img
            src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg"
            alt="XPS"
            className="w-12 h-12 object-contain"
          />
          <div>
            <div className="text-lg font-extrabold metallic-gold tracking-wider">XPS INTELLIGENCE</div>
            <div className="text-[9px] text-muted-foreground tracking-widest">CONTRACTOR ASSIST</div>
          </div>
        </div>

        {!submitted ? (
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <div className="text-center">
              <div className="w-14 h-14 rounded-xl bg-orange-500/10 flex items-center justify-center mx-auto mb-3">
                <Shield className="w-7 h-7 text-orange-400" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Access Required</h1>
              <p className="text-sm text-muted-foreground mt-1">
                You're not yet registered for XPS Intelligence. All users must be approved by an administrator.
              </p>
            </div>

            <div className="space-y-3">
              <Input placeholder="Full Name *" value={name} onChange={e => setName(e.target.value)} className="h-11 glass-input" />
              <Input placeholder="Email *" value={email} onChange={e => setEmail(e.target.value)} className="h-11 glass-input" />
              <Input placeholder="Phone (optional)" value={phone} onChange={e => setPhone(e.target.value)} className="h-11 glass-input" />
              <Input placeholder="Company (optional)" value={company} onChange={e => setCompany(e.target.value)} className="h-11 glass-input" />
              <textarea
                placeholder="Why do you need access? (optional)"
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={2}
                className="w-full rounded-md px-3 py-2 text-sm glass-input resize-none"
              />
            </div>

            <Button
              onClick={handleRequestAccess}
              disabled={submitting || !name.trim() || !email.trim()}
              className="w-full h-11 metallic-gold-bg text-background font-bold gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {submitting ? "Submitting..." : "Request Access"}
            </Button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign out and try a different account
            </button>
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-6 text-center">
            <div className="w-14 h-14 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-7 h-7 text-green-400" />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">Request Submitted</h1>
            <p className="text-sm text-muted-foreground">
              Your access request has been sent to the XPS admin team. You'll receive an email once approved.
            </p>
            <button
              onClick={handleLogout}
              className="mt-6 flex items-center justify-center gap-2 mx-auto py-2 px-4 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}