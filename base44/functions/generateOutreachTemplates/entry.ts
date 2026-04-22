import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const LOGO_URL = "https://media.base44.com/images/public/69db3269c791af3f48cfaee9/892bf7af9_cropped-Logo_XPRESS_Vector_07-06-23_1698535534-removebg-preview1.png";
const FROM_NAME = "Jeremy Bensen — Xtreme Polishing Systems";

function emailShell(innerHtml, preheader) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>
body{margin:0;padding:0;background:#0a0a12;font-family:'Helvetica Neue',Arial,sans-serif;color:#e0e0e0;}
.outer{max-width:640px;margin:0 auto;background:#0f0f1a;}
.header{background:linear-gradient(135deg,#0a0a12 0%,#1a1a2e 100%);padding:28px 32px;text-align:center;border-bottom:3px solid #d4af37;}
.logo-img{max-width:200px;height:auto;margin-bottom:8px;}
.gold{color:#d4af37;}
.body-content{padding:28px 32px;line-height:1.7;font-size:15px;color:#ccc;}
.body-content h2{color:#d4af37;font-size:20px;margin:20px 0 8px;}
.body-content h3{color:#fff;font-size:16px;margin:16px 0 6px;}
.cta-btn{display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#b8860b,#d4af37);color:#0a0a12;font-weight:800;font-size:15px;text-decoration:none;border-radius:8px;margin:16px 0;letter-spacing:0.5px;}
.highlight-box{background:rgba(212,175,55,0.08);border:1px solid rgba(212,175,55,0.25);border-radius:10px;padding:18px 20px;margin:16px 0;}
.footer{background:#080810;padding:24px 32px;text-align:center;border-top:2px solid #1a1a2e;font-size:11px;color:#555;}
.footer a{color:#d4af37;text-decoration:none;}
.divider{height:1px;background:linear-gradient(90deg,transparent,#d4af37,transparent);margin:20px 0;}
ul{padding-left:20px;} li{margin:4px 0;}
a{color:#d4af37;}
.pcu-badge{display:inline-block;background:linear-gradient(135deg,#1a1a2e,#2a1a3e);border:1px solid #8b5cf6;border-radius:8px;padding:12px 18px;margin:8px 0;}
.app-badge{display:inline-block;background:linear-gradient(135deg,#0a1a0a,#1a2e1a);border:1px solid #22c55e;border-radius:8px;padding:12px 18px;margin:8px 0;}
</style>
</head><body>
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>` : ""}
<div class="outer">
<div class="header">
  <img src="${LOGO_URL}" alt="XPS Xpress" class="logo-img" />
  <div style="font-size:10px;color:#888;letter-spacing:2px;text-transform:uppercase;margin-top:4px;">XTREME POLISHING SYSTEMS</div>
</div>
<div class="body-content">${innerHtml}</div>
<div class="footer">
  <img src="${LOGO_URL}" alt="XPS" style="width:80px;height:auto;margin-bottom:8px;display:block;margin-left:auto;margin-right:auto;" />
  <p style="margin:4px 0;color:#d4af37;font-weight:700;">Xtreme Polishing Systems — XPS Xpress</p>
  <p style="margin:2px 0;">"Floors For Life"</p>
  <p style="margin:8px 0;">
    <a href="tel:+17722090266">(772) 209-0266</a> &nbsp;|&nbsp;
    <a href="mailto:jeremy@shopxps.com">jeremy@shopxps.com</a> &nbsp;|&nbsp;
    <a href="https://www.xpsxpress.com">xpsxpress.com</a>
  </p>
  <p style="margin:2px 0;">60+ Locations Nationwide &nbsp;•&nbsp; <a href="https://www.polishedconcreteuniversity.com">Polished Concrete University</a></p>
  <p style="margin:10px 0 0;color:#444;font-size:10px;">© ${new Date().getFullYear()} Xtreme Polishing Systems. All rights reserved.</p>
</div>
</div></body></html>`;
}

function signatureBlock() {
  return `<div class="divider"></div>
<table width="100%" style="font-size:12px;color:#888;"><tr>
  <td>Jeremy Bensen</td><td style="text-align:right;">AI Marketing & Sales Director</td>
</tr><tr>
  <td><a href="mailto:jeremy@shopxps.com">jeremy@shopxps.com</a></td>
  <td style="text-align:right;"><a href="tel:+17722090266">(772) 209-0266</a></td>
</tr></table>`;
}

function statsBlock() {
  return `<table width="100%" cellpadding="0" cellspacing="8" style="margin:16px 0;"><tr>
  <td style="background:#111;border:1px solid #222;border-radius:8px;padding:12px;text-align:center;width:25%;"><div style="font-size:22px;font-weight:900;color:#d4af37;">60+</div><div style="font-size:9px;color:#888;text-transform:uppercase;letter-spacing:1px;">Locations</div></td>
  <td style="background:#111;border:1px solid #222;border-radius:8px;padding:12px;text-align:center;width:25%;"><div style="font-size:22px;font-weight:900;color:#22c55e;">50K+</div><div style="font-size:9px;color:#888;text-transform:uppercase;letter-spacing:1px;">Projects</div></td>
  <td style="background:#111;border:1px solid #222;border-radius:8px;padding:12px;text-align:center;width:25%;"><div style="font-size:22px;font-weight:900;color:#3b82f6;">10yr</div><div style="font-size:9px;color:#888;text-transform:uppercase;letter-spacing:1px;">Warranty</div></td>
  <td style="background:#111;border:1px solid #222;border-radius:8px;padding:12px;text-align:center;width:25%;"><div style="font-size:22px;font-weight:900;color:#8b5cf6;">5K+</div><div style="font-size:9px;color:#888;text-transform:uppercase;letter-spacing:1px;">Trained Pros</div></td>
</tr></table>`;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { batch, send_to } = await req.json();
  const recipientEmail = send_to || "jeremy@shopxps.com";
  const runBatch = batch || "xpress"; // "xpress" or "gc"
  const results = { batch: runBatch, templates_generated: 0, emails_sent: 0, errors: [] };

  if (runBatch === "xpress") {
    // ═══════════════════════════════════════
    // BATCH 1: 10 XPress Product/Training Outreach
    // ═══════════════════════════════════════
    const prompt = `You are Jeremy Bensen, AI Marketing & Sales Director at Xtreme Polishing Systems (XPS Xpress — "Floors For Life").

Generate EXACTLY 10 unique outreach email templates. Each targets a DIFFERENT flooring contractor niche.

BRAND FACTS:
- Company: Xtreme Polishing Systems (XPS) / XPS Xpress — "Floors For Life"
- 60+ nationwide franchise locations
- Training: Polished Concrete University (PCU) — industry-leading certification
- Products: Premium epoxy coatings, polyaspartic, metallic epoxy, polished concrete supplies, decorative concrete, grinding/polishing equipment, diamonds & tooling
- NEW: AI-powered industry app — leads, intelligence, automated workflows, invoicing, billing, auto-emailing — be FIRST to access
- Contractor discount programs
- xpsxpress.com | polishedconcreteuniversity.com

EACH EMAIL: unique subject line, niche-specific hook, 2-3 relevant products, mention PCU training, AI app early access, contractor discounts, 60+ locations, compelling CTA, P.S. with urgency. Tone: confident, founder-energy, NOT corporate. 250-400 words.

NICHES: 1.Epoxy installers 2.Decorative concrete 3.Polished concrete 4.Garage coatings 5.Industrial/warehouse 6.Polyaspartic 7.Metallic epoxy 8.Concrete staining 9.Multi-service flooring 10.Startup flooring businesses`;

    let templates = [];
    try {
      const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            templates: { type: "array", items: { type: "object", properties: {
              template_number: { type: "number" }, target_niche: { type: "string" },
              subject_line: { type: "string" }, email_body: { type: "string" },
              ps_line: { type: "string" }, key_products: { type: "string" }, cta: { type: "string" }
            }}}
          }
        },
        model: "gpt_5"
      });
      console.log("XPress LLM response keys:", Object.keys(res));
      templates = res.templates || [];
      if (templates.length === 0 && Array.isArray(res)) templates = res;
      results.templates_generated = templates.length;
      results.raw_keys = Object.keys(res);
    } catch (e) { results.errors.push("Generate: " + e.message); }

    // Save & send each
    for (let i = 0; i < templates.length; i++) {
      const t = templates[i];
      // Save to DB
      try {
        await base44.asServiceRole.entities.MessageTemplate.create({
          name: `[XPress] ${t.target_niche || "Outreach"} — ${(t.subject_line || "").substring(0, 60)}`,
          template_type: "email", category: "XPress Product Outreach",
          subject: t.subject_line || "", body: t.email_body || "",
          tags: `xpress,outreach,${(t.target_niche || "").toLowerCase().replace(/\s+/g, "-")}`,
          status: "active",
        });
      } catch (e) { results.errors.push(`Save #${i+1}: ${e.message}`); }

      // Send email
      try {
        const body = (t.email_body || "").replace(/\n/g, "<br/>");
        const ps = (t.ps_line || "").replace(/\n/g, "<br/>");
        const inner = `
          <div style="font-size:10px;color:#888;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;">XPRESS PRODUCT OUTREACH — TEMPLATE ${i+1}/10</div>
          <div style="background:#111;border-radius:8px;padding:4px 12px;display:inline-block;margin-bottom:16px;">
            <span style="color:#d4af37;font-size:11px;font-weight:700;">TARGET: ${t.target_niche || "Flooring Contractor"}</span>
          </div>
          <div style="font-size:15px;line-height:1.75;color:#ddd;">${body}</div>
          ${t.key_products ? `<div class="highlight-box"><h3 style="margin:0 0 6px;color:#d4af37;font-size:13px;">🏆 KEY PRODUCTS</h3><p style="margin:0;color:#fff;font-size:13px;">${t.key_products}</p></div>` : ""}
          <div class="pcu-badge"><span style="color:#c4b5fd;font-size:12px;font-weight:700;">🎓 Polished Concrete University — Industry-Leading Certification</span></div>
          <div class="app-badge"><span style="color:#86efac;font-size:12px;font-weight:700;">🤖 NEW AI App — Early Access for Select Contractors</span></div>
          <div style="text-align:center;margin:24px 0;"><a href="https://www.xpsxpress.com" class="cta-btn">${t.cta || "Explore XPS Products →"}</a></div>
          ${ps ? `<div class="divider"></div><p style="color:#999;font-size:13px;font-style:italic;"><strong style="color:#d4af37;">P.S.</strong> ${ps}</p>` : ""}
          ${signatureBlock()}`;
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: recipientEmail, from_name: FROM_NAME,
          subject: `[${i+1}/10 XPress] ${t.subject_line}`,
          body: emailShell(inner, `XPS — ${t.subject_line}`)
        });
        results.emails_sent++;
      } catch (e) { results.errors.push(`Send #${i+1}: ${e.message}`); }
    }

  } else if (runBatch === "gc") {
    // ═══════════════════════════════════════
    // BATCH 2: 10 GC/Contractor Bid List Intros
    // ═══════════════════════════════════════
    const prompt = `You are Jeremy Bensen, AI Marketing & Sales Director at Xtreme Polishing Systems (XPS Xpress — "Floors For Life").

Generate EXACTLY 10 introductory email templates for GENERAL CONTRACTORS / COMMERCIAL CONSTRUCTION COMPANIES. Goal: get XPS on their BIDDERS LIST for commercial floor installation.

BRAND ACCOMPLISHMENTS:
- Xtreme Polishing Systems / XPS Xpress — "Floors For Life"
- 60+ franchise locations nationwide
- 50,000+ commercial flooring projects completed
- Fortune 500 clients, GSA-approved, LEED-certified
- 24/7 emergency response, ISO 9001 certified
- 10-year warranty programs
- Polished Concrete University — 5,000+ professionals trained
- National accounts with major warehouse/retail chains
- Services: Epoxy, polished concrete, polyaspartic, decorative concrete, metallic epoxy, industrial coatings, moisture mitigation, surface prep, concrete repair
- Sectors: Warehouse, retail, food & bev, healthcare, automotive, fitness, education, government, data centers, manufacturing
- NEW: AI-driven project management — automated takeoffs, proposals, scheduling, invoicing

EACH EMAIL: strong professional subject line, introduce XPS as national specialty sub, 2-3 specific sectors, accomplishments, ASK for bid list, competitive pricing/reliability/nationwide, warranty/certifications, CTA for meeting/bid list, P.S. with capability highlight. Tone: professional, peer-to-peer. 250-400 words.

SEGMENTS: 1.Large national GCs 2.Regional commercial builders 3.Healthcare/hospital 4.Warehouse/distribution 5.Retail/restaurant 6.Government/military 7.Data center/tech 8.Food processing/industrial 9.Multi-family/mixed-use 10.Design-build firms`;

    let templates = [];
    try {
      const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            templates: { type: "array", items: { type: "object", properties: {
              template_number: { type: "number" }, target_segment: { type: "string" },
              subject_line: { type: "string" }, email_body: { type: "string" },
              ps_line: { type: "string" }, key_differentiators: { type: "string" }, cta: { type: "string" }
            }}}
          }
        },
        model: "gpt_5"
      });
      console.log("GC LLM response keys:", Object.keys(res));
      templates = res.templates || [];
      if (templates.length === 0 && Array.isArray(res)) templates = res;
      results.templates_generated = templates.length;
      results.raw_keys = Object.keys(res);
    } catch (e) { results.errors.push("Generate: " + e.message); }

    for (let i = 0; i < templates.length; i++) {
      const t = templates[i];
      try {
        await base44.asServiceRole.entities.MessageTemplate.create({
          name: `[GC Bid] ${t.target_segment || "Intro"} — ${(t.subject_line || "").substring(0, 60)}`,
          template_type: "email", category: "GC Bid List Intro",
          subject: t.subject_line || "", body: t.email_body || "",
          tags: `gc,bidlist,${(t.target_segment || "").toLowerCase().replace(/\s+/g, "-")}`,
          status: "active",
        });
      } catch (e) { results.errors.push(`Save #${i+1}: ${e.message}`); }

      try {
        const body = (t.email_body || "").replace(/\n/g, "<br/>");
        const ps = (t.ps_line || "").replace(/\n/g, "<br/>");
        const inner = `
          <div style="font-size:10px;color:#888;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;">GC BID LIST INTRODUCTION — TEMPLATE ${i+1}/10</div>
          <div style="background:#111;border-radius:8px;padding:4px 12px;display:inline-block;margin-bottom:16px;">
            <span style="color:#3b82f6;font-size:11px;font-weight:700;">TARGET: ${t.target_segment || "General Contractor"}</span>
          </div>
          ${statsBlock()}
          <div style="font-size:15px;line-height:1.75;color:#ddd;">${body}</div>
          ${t.key_differentiators ? `<div class="highlight-box"><h3 style="margin:0 0 6px;color:#d4af37;font-size:13px;">⚡ WHY XPS FOR YOUR PROJECTS</h3><p style="margin:0;color:#fff;font-size:13px;">${t.key_differentiators}</p></div>` : ""}
          <div style="text-align:center;margin:24px 0;"><a href="https://www.xpsxpress.com" class="cta-btn">${t.cta || "Add XPS to Your Bid List →"}</a></div>
          ${ps ? `<div class="divider"></div><p style="color:#999;font-size:13px;font-style:italic;"><strong style="color:#d4af37;">P.S.</strong> ${ps}</p>` : ""}
          ${signatureBlock()}`;
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: recipientEmail, from_name: FROM_NAME,
          subject: `[${i+1}/10 GC Bid] ${t.subject_line}`,
          body: emailShell(inner, `XPS Bid — ${t.subject_line}`)
        });
        results.emails_sent++;
      } catch (e) { results.errors.push(`Send #${i+1}: ${e.message}`); }
    }
  }

  return Response.json(results);
});