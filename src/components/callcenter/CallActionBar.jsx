import { useState } from "react";
import { Phone, Mail, MessageCircle, Share2, FileText, Brain, Send, Calendar, Bot, CheckCircle2, X, Clock, Star, Loader2, PhoneCall } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PowerToolsBar from "../shared/PowerToolsBar";

const OUTCOMES = [
  { id: "Sold", label: "SOLD ✅", color: "#22c55e", icon: CheckCircle2 },
  { id: "Best Lead", label: "BEST LEAD ⭐", color: "#d4af37", icon: Star },
  { id: "Callback", label: "CALL BACK 📞", color: "#3b82f6", icon: Clock },
  { id: "No", label: "NO ❌", color: "#ef4444", icon: X },
  { id: "No Answer", label: "NO ANSWER", color: "#6b7280", icon: Phone },
  { id: "Voicemail", label: "VOICEMAIL", color: "#8b5cf6", icon: PhoneCall },
];

export default function CallActionBar({ contact, onOutcome, intel }) {
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [sendingSMS, setSendingSMS] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [aiCalling, setAiCalling] = useState(false);

  const logOutcome = async (outcome) => {
    setSaving(true);
    await base44.entities.CallLog.create({
      contact_name: contact.contact_name,
      company_name: contact.company_name,
      phone: contact.phone,
      email: contact.email,
      source_type: contact.source_type,
      source_id: contact.source_id,
      call_outcome: outcome,
      priority: contact.priority,
      notes,
      location: contact.location,
      website: contact.website,
      vertical: contact.vertical,
      employee_count: contact.employee_count,
      years_in_business: contact.years_in_business,
      existing_products: contact.existing_products,
      ai_pitch: intel?.pitch_recommendation || "",
      business_summary: intel?.business_summary || "",
    });
    setSaving(false);
    onOutcome?.(contact, outcome);
  };

  const sendSMS = async () => {
    if (!contact.phone) return;
    setSendingSMS(true);
    try {
      await base44.functions.invoke("twilioMessenger", {
        action: "send_sms",
        to: contact.phone,
        message: `Hi ${contact.contact_name || "there"}! This is XPS — America's #1 epoxy & polished concrete supplier. We have exclusive deals for contractors like you. Check out our products: xpsxpress.com — Reply YES for a free 7-day trial of our app!`,
      });
    } catch (err) { console.error(err); }
    setSendingSMS(false);
  };

  const sendInfoEmail = async () => {
    if (!contact.email) return;
    setSendingEmail(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: contact.email,
        subject: `XPS Xpress — Premium Flooring Products for ${contact.company_name}`,
        body: `
Hi ${contact.contact_name || "there"},

Thank you for your time! I'm reaching out from XPS — the nation's leading supplier of epoxy, polyaspartic, and polished concrete coatings.

${intel?.pitch_recommendation ? `Based on your business, we recommend: ${intel.pitch_recommendation}` : "We'd love to discuss how our products can help your business grow."}

🔗 Products: https://xpsxpress.com/products
📍 Find your nearest location: https://xpsxpress.com/locations
📱 Download our app for contractor pricing and exclusive deals

We offer:
✅ Contractor-exclusive pricing
✅ Free training and certification
✅ Same-day shipping from 60+ locations

${intel?.deal_recommendation ? `Special offer: ${intel.deal_recommendation}` : "Ask about our new contractor welcome package!"}

Best regards,
XPS Sales Team
        `.trim(),
      });
    } catch (err) { console.error(err); }
    setSendingEmail(false);
  };

  const shareDigitalCard = () => {
    const card = `XPS XPRESS — America's Flooring Solution
📞 Sales: (833) XPS-XPRESS
🌐 xpsxpress.com
📍 60+ locations nationwide
✅ Epoxy, Polyaspartic, Metallic, Polished Concrete
🏗️ Contractor training & certification available`;
    navigator.clipboard.writeText(card);
  };

  const triggerAICall = async () => {
    if (!contact.phone) return;
    setAiCalling(true);
    try {
      await base44.functions.invoke("makeAiCall", {
        phone: contact.phone,
        contact_name: contact.contact_name,
        company_name: contact.company_name,
        pitch: intel?.pitch_recommendation || "XPS epoxy and polished concrete products",
        script: intel?.opening_script || "",
      });
    } catch (err) { console.error(err); }
    setAiCalling(false);
  };

  return (
    <div className="space-y-2">
      {/* Communication actions */}
      <div className="flex flex-wrap gap-1.5">
        {contact.phone && (
          <a href={`tel:${contact.phone}`} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-[10px] font-bold hover:bg-green-500/20">
            <Phone className="w-3 h-3" /> Call
          </a>
        )}
        <button onClick={sendSMS} disabled={!contact.phone || sendingSMS} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 text-[10px] font-bold hover:bg-purple-500/20 disabled:opacity-40">
          {sendingSMS ? <Loader2 className="w-3 h-3 animate-spin" /> : <MessageCircle className="w-3 h-3" />} SMS + Trial
        </button>
        <button onClick={sendInfoEmail} disabled={!contact.email || sendingEmail} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-bold hover:bg-blue-500/20 disabled:opacity-40">
          {sendingEmail ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mail className="w-3 h-3" />} Email Info
        </button>
        <button onClick={shareDigitalCard} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary text-[10px] font-bold hover:bg-primary/20">
          <Share2 className="w-3 h-3" /> Biz Card
        </button>
        <button onClick={triggerAICall} disabled={!contact.phone || aiCalling} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-[10px] font-bold hover:bg-red-500/20 disabled:opacity-40">
          {aiCalling ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bot className="w-3 h-3" />} AI Call
        </button>
        <a href="https://xpsxpress.com/products" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-secondary text-foreground text-[10px] font-bold hover:bg-secondary/80">
          <FileText className="w-3 h-3" /> Products
        </a>
      </div>

      {/* Notes */}
      <button onClick={() => setShowNotes(!showNotes)} className="text-[10px] text-muted-foreground hover:text-foreground">
        {showNotes ? "Hide notes" : "+ Add call notes"}
      </button>
      {showNotes && (
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Call notes..."
          className="w-full glass-input rounded-lg p-2 text-xs text-foreground min-h-[60px] resize-none"
        />
      )}

      {/* Power Tools */}
      <PowerToolsBar contact={contact} compact={true} />

      {/* Outcome buttons */}
      <div className="flex flex-wrap gap-1.5">
        {OUTCOMES.map(o => {
          const Icon = o.icon;
          return (
            <button
              key={o.id}
              onClick={() => logOutcome(o.id)}
              disabled={saving}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-[10px] font-black transition-all hover:scale-105"
              style={{ backgroundColor: `${o.color}15`, color: o.color, border: `1px solid ${o.color}30` }}
            >
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Icon className="w-3 h-3" />}
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}