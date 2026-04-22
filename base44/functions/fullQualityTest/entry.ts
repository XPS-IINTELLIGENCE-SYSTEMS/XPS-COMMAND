import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { lead_id } = await req.json();
  const myEmail = "jeremy@shopxps.com";
  const myPhone = user.data?.phone || Deno.env.get("ADMIN_PHONE") || "";
  const myName = user.full_name || "Jeremy";

  // Fetch the lead
  let targetLead = null;
  if (lead_id) {
    const leads = await base44.asServiceRole.entities.Lead.filter({ id: lead_id });
    targetLead = leads[0] || null;
  }
  if (!targetLead) {
    const allLeads = await base44.asServiceRole.entities.Lead.list("-score", 200);
    targetLead = allLeads.find(l => l.score >= 80 && l.email && l.contact_name) || allLeads[0];
  }
  if (!targetLead) return Response.json({ error: "No suitable lead found" }, { status: 404 });

  const results = { lead: targetLead.company, stages: [], errors: [] };
  const log = (stage, status, detail) => {
    results.stages.push({ stage, status, detail: typeof detail === "object" ? JSON.stringify(detail).substring(0, 800) : (detail || "").substring(0, 800) });
    if (status === "failed") results.errors.push(`${stage}: ${detail}`);
  };

  const company = targetLead.company || "Unknown Company";
  const contactName = targetLead.contact_name || "Edwin";
  const vertical = targetLead.vertical || "Flooring";
  const location = targetLead.location || "Chandler, AZ";
  const existingProducts = targetLead.existing_material || "concrete coatings";
  const employeeCount = targetLead.employee_count || 10;
  const yearsInBusiness = targetLead.years_in_business || 5;
  const aiInsight = targetLead.ai_insight || "";
  const aiRec = targetLead.ai_recommendation || "";

  // ═══════════════════════════════════════
  // 1. AUTO TAKEOFF
  // ═══════════════════════════════════════
  let takeoff = null;
  try {
    takeoff = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are an XPS commercial flooring estimator. Generate a detailed takeoff for:
Company: ${company} | Industry: ${vertical} | Location: ${location} | Employees: ${employeeCount} | Years: ${yearsInBusiness}
Current materials: ${existingProducts}
AI Insight: ${aiInsight}

Return a realistic, detailed estimate with multiple zones.`,
      response_json_schema: {
        type: "object",
        properties: {
          estimated_sqft: { type: "number" },
          zones: { type: "array", items: { type: "object", properties: { name: { type: "string" }, sqft: { type: "number" }, system: { type: "string" }, price_per_sqft: { type: "number" }, total: { type: "number" } } } },
          total_estimate: { type: "number" },
          materials: { type: "string" },
          timeline_days: { type: "number" },
          confidence: { type: "number" }
        }
      }
    });
    log("1. Auto Takeoff", "success", takeoff);
  } catch (e) { log("1. Auto Takeoff", "failed", e.message); }

  // ═══════════════════════════════════════
  // 2. FORMAL PROPOSAL
  // ═══════════════════════════════════════
  let proposal = null;
  try {
    proposal = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Generate a professional XPS sales proposal for ${company} (${contactName}).
Location: ${location} | Industry: ${vertical}
Takeoff: ${takeoff ? JSON.stringify(takeoff) : "3000 sqft commercial epoxy"}
AI Recommendation: ${aiRec}

Create a COMPLETE proposal with cover letter, scope, 3-tier pricing, materials, timeline, terms, and value proposition. Make it compelling and specific to their business.`,
      response_json_schema: {
        type: "object",
        properties: {
          cover_letter: { type: "string" },
          scope_of_work: { type: "string" },
          pricing_economy: { type: "number" },
          pricing_standard: { type: "number" },
          pricing_premium: { type: "number" },
          materials_list: { type: "string" },
          timeline: { type: "string" },
          terms: { type: "string" },
          value_proposition: { type: "string" },
          warranty: { type: "string" }
        }
      }
    });
    log("2. Formal Proposal", "success", proposal);
  } catch (e) { log("2. Formal Proposal", "failed", e.message); }

  // ═══════════════════════════════════════
  // 3. DIGITAL BUSINESS CARD
  // ═══════════════════════════════════════
  let businessCard = null;
  try {
    businessCard = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Create a digital business card for an XPS sales representative reaching out to ${company}.

XPS Company Info:
- Company: Xtreme Polishing Systems (XPS)
- Tagline: "America's #1 Epoxy & Polished Concrete Supplier"
- Website: https://www.xpsxpress.com
- Rep Name: Jeremy Bensen
- Title: AI Marketing & Sales Director
- Email: j.xpsxpress@gmail.com
- Phone: (772) 209-0266
- Address: Pompano Beach, FL 33069
- Services: Epoxy Flooring, Polished Concrete, Polyaspartic, Metallic Epoxy, Training, Equipment, Supplies
- 60+ Locations Nationwide
- Social: @xpsxpress on Instagram, Facebook, YouTube

Generate a clean, professional HTML business card that could be emailed. Include:
1. Full HTML with inline CSS (dark theme, gold accents #d4af37)
2. All contact info with clickable links (tel:, mailto:, https://)
3. Service highlights relevant to ${company}'s industry (${vertical})
4. A personalized tagline for ${contactName}
5. QR code placeholder text
6. Make it mobile-responsive and visually premium`,
      response_json_schema: {
        type: "object",
        properties: {
          html: { type: "string" },
          personalized_tagline: { type: "string" },
          services_highlighted: { type: "string" }
        }
      }
    });
    log("3. Digital Business Card", "success", { tagline: businessCard.personalized_tagline, services: businessCard.services_highlighted });
  } catch (e) { log("3. Digital Business Card", "failed", e.message); }

  // ═══════════════════════════════════════
  // 4. INTRO STORY EMAIL
  // ═══════════════════════════════════════
  let introEmail = null;
  try {
    introEmail = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Write a compelling "origin story" introduction email from Jeremy Bensen at XPS to ${contactName} at ${company}.

Context about ${company}:
- Industry: ${vertical}
- Location: ${location}
- Employees: ${employeeCount}
- Years in business: ${yearsInBusiness}
- Current materials: ${existingProducts}
- AI Insight: ${aiInsight}
- AI Recommendation: ${aiRec}

The email should:
1. Open with a genuine, personal hook — mention something specific about their business
2. Tell the XPS origin story briefly (started from the ground up, now 60+ locations, driven by innovation)
3. Connect XPS's journey to their business challenges
4. Reference specific products/equipment that would help THEM based on their current setup
5. Include a soft but compelling CTA — "I'd love to show you what we've built"
6. Tone: authentic, founder-energy, NOT corporate or salesy
7. Sign off as Jeremy Bensen, AI Marketing & Sales, XPS
8. Include a P.S. that adds urgency or value

Return full HTML email with inline styling (professional, dark theme with gold #d4af37 accents).`,
      response_json_schema: {
        type: "object",
        properties: {
          subject_line: { type: "string" },
          email_html: { type: "string" },
          preview_text: { type: "string" }
        }
      }
    });
    log("4. Intro Story Email", "success", { subject: introEmail.subject_line, preview: introEmail.preview_text });
  } catch (e) { log("4. Intro Story Email", "failed", e.message); }

  // ═══════════════════════════════════════
  // 5. SMS MESSAGE
  // ═══════════════════════════════════════
  let smsMessage = null;
  try {
    smsMessage = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Write a SHORT SMS message (under 160 chars) from Jeremy at XPS to ${contactName} at ${company}.
They do: ${vertical} in ${location}. They use: ${existingProducts}.
Sound like a real person. Casual but professional. Include a soft CTA. Sign as Jeremy.`,
    });
    log("5. SMS Generation", "success", smsMessage);
  } catch (e) { log("5. SMS Generation", "failed", e.message); }

  // Actually send SMS to admin's phone for quality check
  if (myPhone && smsMessage) {
    try {
      const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
      const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
      const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER");
      if (accountSid && authToken && fromNumber) {
        const cleanPhone = myPhone.replace(/[^+\d]/g, "");
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
        const formData = new URLSearchParams();
        formData.append("To", cleanPhone);
        formData.append("From", fromNumber);
        formData.append("Body", typeof smsMessage === "string" ? smsMessage : JSON.stringify(smsMessage));
        const resp = await fetch(twilioUrl, {
          method: "POST",
          headers: { "Authorization": `Basic ${btoa(`${accountSid}:${authToken}`)}`, "Content-Type": "application/x-www-form-urlencoded" },
          body: formData.toString()
        });
        const smsResult = await resp.json();
        log("5b. SMS Sent to You", resp.ok ? "success" : "failed", resp.ok ? `Sent to ${cleanPhone}` : smsResult.message);
      }
    } catch (e) { log("5b. SMS Send", "failed", e.message); }
  }

  // ═══════════════════════════════════════
  // 6. FOLLOW-UP WORKFLOW
  // ═══════════════════════════════════════
  let workflow = null;
  try {
    workflow = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Create a 7-step follow-up workflow for ${company} (${contactName}).
Industry: ${vertical} | Location: ${location} | Score: ${targetLead.score}
Current products: ${existingProducts}

Design an aggressive but professional multi-channel sequence with exact timing, message summaries, and expected outcomes per step.`,
      response_json_schema: {
        type: "object",
        properties: {
          workflow_name: { type: "string" },
          steps: { type: "array", items: { type: "object", properties: { step: { type: "number" }, action: { type: "string" }, channel: { type: "string" }, timing: { type: "string" }, message: { type: "string" }, expected_outcome: { type: "string" } } } },
          conversion_probability: { type: "string" },
          total_touchpoints: { type: "number" }
        }
      }
    });
    await base44.asServiceRole.entities.Workflow.create({
      name: workflow.workflow_name || `Quality Test: ${company}`,
      description: `Full quality test workflow for ${company}`,
      steps: JSON.stringify(workflow.steps || []),
      status: "Active",
      trigger: "manual",
      category: "Sales",
      projected_result: workflow.conversion_probability || "High"
    });
    log("6. Follow-Up Workflow", "success", workflow);
  } catch (e) { log("6. Follow-Up Workflow", "failed", e.message); }

  // ═══════════════════════════════════════
  // 7. WEBSITE SHARE RECOMMENDATION
  // ═══════════════════════════════════════
  let websiteShare = null;
  try {
    websiteShare = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `For ${company} (${vertical} in ${location}), recommend the best XPS website pages:
xpsxpress.com pages: /products, /epoxy-flooring, /polished-concrete, /polyaspartic, /metallic-epoxy, /training, /locations, /about
They use: ${existingProducts}
Return primary URL, secondary URLs, personalized share message, and product highlights.`,
      response_json_schema: {
        type: "object",
        properties: {
          primary_url: { type: "string" },
          secondary_urls: { type: "array", items: { type: "string" } },
          share_message: { type: "string" },
          products: { type: "array", items: { type: "string" } }
        }
      }
    });
    log("7. Website Share", "success", websiteShare);
  } catch (e) { log("7. Website Share", "failed", e.message); }

  // ═══════════════════════════════════════
  // 8. PROJECT FOLDER
  // ═══════════════════════════════════════
  try {
    const folder = await base44.asServiceRole.entities.Project.create({
      name: `[QA Test] ${company}`,
      type: "folder",
      description: `Quality test project folder for ${company}`,
      color: "#d4af37",
      tags: "quality-test,auto-generated",
      linked_lead_id: targetLead.id
    });
    await base44.asServiceRole.entities.Project.bulkCreate([
      { name: "Proposals", type: "folder", parent_id: folder.id, color: "#22c55e" },
      { name: "Takeoffs", type: "folder", parent_id: folder.id, color: "#3b82f6" },
      { name: "Communications", type: "folder", parent_id: folder.id, color: "#8b5cf6" },
      { name: "Contact Notes", type: "document", parent_id: folder.id, content: `Lead: ${company}\nContact: ${contactName}\nEmail: ${targetLead.email}\nPhone: ${targetLead.phone}\nScore: ${targetLead.score}\nInsight: ${aiInsight}` }
    ]);
    log("8. Project Folder", "success", `Created: ${folder.id}`);
  } catch (e) { log("8. Project Folder", "failed", e.message); }

  // ═══════════════════════════════════════
  // SEND MASTER EMAIL REPORT TO YOU
  // ═══════════════════════════════════════
  const passCount = results.stages.filter(s => s.status === "success").length;
  const failCount = results.stages.filter(s => s.status === "failed").length;

  // Build proposal section
  const proposalSection = proposal ? `
<div style="background:#111;border:1px solid #333;border-radius:12px;padding:20px;margin:16px 0;">
  <h3 style="color:#d4af37;margin:0 0 12px;">📋 FORMAL PROPOSAL</h3>
  <div style="color:#ccc;font-size:13px;line-height:1.6;">
    <p><strong>Cover Letter:</strong><br/>${(proposal.cover_letter || "").replace(/\n/g, "<br/>")}</p>
    <p><strong>Scope:</strong><br/>${(proposal.scope_of_work || "").replace(/\n/g, "<br/>")}</p>
    <table style="width:100%;border-collapse:collapse;margin:12px 0;">
      <tr style="background:#1a1a1a;"><td style="padding:8px;color:#888;">Economy</td><td style="padding:8px;color:#22c55e;font-weight:bold;">$${(proposal.pricing_economy || 0).toLocaleString()}</td></tr>
      <tr><td style="padding:8px;color:#888;">Standard</td><td style="padding:8px;color:#d4af37;font-weight:bold;">$${(proposal.pricing_standard || 0).toLocaleString()}</td></tr>
      <tr style="background:#1a1a1a;"><td style="padding:8px;color:#888;">Premium</td><td style="padding:8px;color:#f59e0b;font-weight:bold;">$${(proposal.pricing_premium || 0).toLocaleString()}</td></tr>
    </table>
    <p><strong>Materials:</strong> ${proposal.materials_list || "N/A"}</p>
    <p><strong>Timeline:</strong> ${proposal.timeline || "N/A"}</p>
    <p><strong>Terms:</strong> ${proposal.terms || "N/A"}</p>
    <p><strong>Warranty:</strong> ${proposal.warranty || "N/A"}</p>
    <p style="color:#d4af37;"><strong>Value Proposition:</strong> ${proposal.value_proposition || "N/A"}</p>
  </div>
</div>` : "";

  // Build takeoff section
  const takeoffSection = takeoff ? `
<div style="background:#111;border:1px solid #333;border-radius:12px;padding:20px;margin:16px 0;">
  <h3 style="color:#d4af37;margin:0 0 12px;">📐 AUTO TAKEOFF</h3>
  <div style="color:#ccc;font-size:13px;">
    <p>Estimated: <strong style="color:#fff;">${(takeoff.estimated_sqft || 0).toLocaleString()} sqft</strong> | Total: <strong style="color:#22c55e;">$${(takeoff.total_estimate || 0).toLocaleString()}</strong> | Timeline: ${takeoff.timeline_days || "?"} days | Confidence: ${takeoff.confidence || "?"}%</p>
    <table style="width:100%;border-collapse:collapse;margin:8px 0;">
      <tr style="background:#1a1a1a;color:#d4af37;font-size:11px;"><td style="padding:6px;">Zone</td><td>SqFt</td><td>System</td><td>$/SqFt</td><td>Total</td></tr>
      ${(takeoff.zones || []).map((z, i) => `<tr style="${i % 2 === 0 ? 'background:#0a0a0a;' : ''}color:#ccc;font-size:12px;"><td style="padding:6px;">${z.name}</td><td>${z.sqft}</td><td>${z.system}</td><td>$${z.price_per_sqft}</td><td style="color:#22c55e;">$${(z.total || 0).toLocaleString()}</td></tr>`).join("")}
    </table>
    <p>Materials: ${takeoff.materials || "N/A"}</p>
  </div>
</div>` : "";

  // SMS section
  const smsSection = smsMessage ? `
<div style="background:#111;border:1px solid #333;border-radius:12px;padding:20px;margin:16px 0;">
  <h3 style="color:#d4af37;margin:0 0 12px;">💬 SMS MESSAGE</h3>
  <div style="background:#1a1a1a;border-radius:16px 16px 4px 16px;padding:14px 18px;color:#fff;font-size:14px;max-width:320px;">
    ${typeof smsMessage === "string" ? smsMessage : JSON.stringify(smsMessage)}
  </div>
  <p style="color:#666;font-size:11px;margin-top:8px;">${myPhone ? `Also sent to your phone: ${myPhone}` : "No phone on file — SMS not sent"}</p>
</div>` : "";

  // Workflow section
  const workflowSection = workflow ? `
<div style="background:#111;border:1px solid #333;border-radius:12px;padding:20px;margin:16px 0;">
  <h3 style="color:#d4af37;margin:0 0 12px;">🔄 FOLLOW-UP WORKFLOW: ${workflow.workflow_name || ""}</h3>
  <p style="color:#888;font-size:12px;">Conversion probability: <strong style="color:#22c55e;">${workflow.conversion_probability || "?"}</strong> | Touchpoints: ${workflow.total_touchpoints || workflow.steps?.length || 0}</p>
  <table style="width:100%;border-collapse:collapse;margin:8px 0;">
    ${(workflow.steps || []).map((s, i) => `<tr style="${i % 2 === 0 ? 'background:#0a0a0a;' : ''}color:#ccc;font-size:12px;">
      <td style="padding:8px;color:#d4af37;font-weight:bold;">Step ${s.step || i + 1}</td>
      <td style="padding:8px;">${s.channel || ""}</td>
      <td style="padding:8px;">${s.timing || ""}</td>
      <td style="padding:8px;color:#fff;">${s.action || ""}</td>
    </tr>`).join("")}
  </table>
</div>` : "";

  // Website share section
  const websiteSection = websiteShare ? `
<div style="background:#111;border:1px solid #333;border-radius:12px;padding:20px;margin:16px 0;">
  <h3 style="color:#d4af37;margin:0 0 12px;">🌐 WEBSITE SHARE</h3>
  <p style="color:#fff;font-size:13px;">Primary: <a href="${websiteShare.primary_url}" style="color:#3b82f6;">${websiteShare.primary_url}</a></p>
  <p style="color:#888;font-size:12px;">Also: ${(websiteShare.secondary_urls || []).join(", ")}</p>
  <p style="color:#ccc;font-size:13px;margin-top:8px;background:#1a1a1a;padding:12px;border-radius:8px;">"${websiteShare.share_message || ""}"</p>
  <p style="color:#888;font-size:11px;">Products: ${(websiteShare.products || []).join(", ")}</p>
</div>` : "";

  const masterEmailBody = `
<div style="font-family:Inter,Helvetica,Arial,sans-serif;background:#0a0a0f;color:#fff;max-width:700px;margin:0 auto;padding:0;">
  
  <!-- Header -->
  <div style="background:linear-gradient(135deg,#0a0a0f,#1a1a2e);padding:32px;text-align:center;border-bottom:2px solid #d4af37;">
    <h1 style="margin:0;font-size:24px;letter-spacing:2px;color:#d4af37;">⚡ XPS FULL QUALITY TEST</h1>
    <p style="margin:8px 0 0;color:#888;font-size:13px;">End-to-End Pipeline Test Report</p>
  </div>

  <div style="padding:24px;">
  
  <!-- Lead Info -->
  <div style="background:#111;border:1px solid #d4af37;border-radius:12px;padding:20px;margin-bottom:20px;">
    <h2 style="color:#d4af37;margin:0 0 8px;font-size:18px;">${company}</h2>
    <p style="color:#ccc;margin:0;font-size:13px;">Contact: ${contactName} | ${vertical} | ${location}</p>
    <p style="color:#888;margin:4px 0 0;font-size:12px;">Score: ${targetLead.score}/100 | Employees: ${employeeCount} | Years: ${yearsInBusiness} | Revenue: $${(targetLead.estimated_revenue || 0).toLocaleString()}</p>
  </div>

  <!-- Score Card -->
  <div style="display:flex;gap:12px;margin-bottom:20px;">
    <div style="flex:1;background:#111;border:1px solid #333;border-radius:12px;padding:16px;text-align:center;">
      <div style="font-size:28px;font-weight:900;color:${failCount === 0 ? '#22c55e' : '#ef4444'};">${passCount}/${passCount + failCount}</div>
      <div style="font-size:11px;color:#888;margin-top:4px;">Stages Passed</div>
    </div>
  </div>

  <!-- Stage Results -->
  <div style="background:#111;border:1px solid #333;border-radius:12px;padding:20px;margin-bottom:20px;">
    <h3 style="color:#d4af37;margin:0 0 12px;">📊 STAGE RESULTS</h3>
    ${results.stages.map(s => `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #222;">
      <span style="font-size:16px;">${s.status === "success" ? "✅" : "❌"}</span>
      <span style="color:#fff;font-size:13px;font-weight:600;">${s.stage}</span>
      <span style="color:${s.status === "success" ? "#22c55e" : "#ef4444"};font-size:11px;margin-left:auto;">${s.status.toUpperCase()}</span>
    </div>`).join("")}
  </div>

  ${takeoffSection}
  ${proposalSection}
  ${smsSection}
  ${workflowSection}
  ${websiteSection}

  <!-- Business Card -->
  ${businessCard ? `
  <div style="background:#111;border:1px solid #333;border-radius:12px;padding:20px;margin:16px 0;">
    <h3 style="color:#d4af37;margin:0 0 12px;">💳 DIGITAL BUSINESS CARD</h3>
    <p style="color:#ccc;font-size:12px;margin-bottom:12px;">${businessCard.personalized_tagline || ""}</p>
    ${businessCard.html || "<p style='color:#888;'>Card HTML generated — see inline below</p>"}
  </div>` : ""}

  <!-- Intro Story Email Preview -->
  ${introEmail ? `
  <div style="background:#111;border:1px solid #333;border-radius:12px;padding:20px;margin:16px 0;">
    <h3 style="color:#d4af37;margin:0 0 4px;">📧 INTRO STORY EMAIL</h3>
    <p style="color:#888;font-size:11px;margin:0 0 12px;">Subject: ${introEmail.subject_line || ""}</p>
    <div style="background:#0a0a0f;border:1px solid #222;border-radius:8px;padding:16px;">
      ${introEmail.email_html || ""}
    </div>
  </div>` : ""}

  <!-- Footer -->
  <div style="text-align:center;padding:24px 0;border-top:1px solid #222;margin-top:24px;">
    <p style="color:#888;font-size:11px;margin:0;">XPS Intelligence Platform — Full Quality Test</p>
    <p style="color:#555;font-size:10px;margin:4px 0 0;">${new Date().toISOString()}</p>
  </div>

  </div>
</div>`;

  // Send the master email
  try {
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: myEmail,
      from_name: "Jeremy Bensen — Xtreme Polishing Systems",
      subject: `⚡ Xtreme Polishing Systems Quality Test — ${company} — ${passCount}/${passCount + failCount} Passed ${failCount === 0 ? "✅" : "⚠️"}`,
      body: masterEmailBody
    });
    log("MASTER EMAIL", "success", `Sent to ${myEmail}`);
  } catch (e) { log("MASTER EMAIL", "failed", e.message); }

  // Also send the intro story email separately so you can see it as a standalone email
  if (introEmail) {
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: myEmail,
        from_name: "Jeremy Bensen — Xtreme Polishing Systems",
        subject: introEmail.subject_line || `Introduction from Xtreme Polishing Systems — ${company}`,
        body: introEmail.email_html || ""
      });
      log("INTRO EMAIL SENT", "success", `Standalone intro email sent to ${myEmail}`);
    } catch (e) { log("INTRO EMAIL SENT", "failed", e.message); }
  }

  // Send business card as standalone email
  if (businessCard) {
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: myEmail,
        from_name: "Jeremy Bensen — Xtreme Polishing Systems",
        subject: `Digital Business Card — Jeremy Bensen, Xtreme Polishing Systems`,
        body: businessCard.html || ""
      });
      log("BUSINESS CARD SENT", "success", `Standalone business card sent to ${myEmail}`);
    } catch (e) { log("BUSINESS CARD SENT", "failed", e.message); }
  }

  results.summary = { passed: passCount, failed: failCount, total: passCount + failCount, email: myEmail, phone: myPhone };
  return Response.json(results);
});