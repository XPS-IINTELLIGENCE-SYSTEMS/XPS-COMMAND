import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { action, contact, admin_email: provided_email } = await req.json();
  const admin_email = provided_email || user.email;

  const results = { stages: [], errors: [], success: true };
  const log = (stage, status, detail) => results.stages.push({ stage, status, detail, timestamp: new Date().toISOString() });

  // TAKEOFF — generate AI cost takeoff for a contact's potential project
  if (action === "auto_takeoff" || action === "full_pipeline") {
    try {
      const takeoff = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are an XPS commercial flooring estimator. Generate a takeoff estimate for this potential client:
Company: ${contact.company_name || contact.company}
Industry: ${contact.vertical || "commercial"}
Location: ${contact.location || ""}
Employees: ${contact.employee_count || "unknown"}
Specialty needs: ${contact.specialty || contact.existing_products || "epoxy flooring"}

Estimate the likely flooring project scope based on their business type and size. Return:
- estimated_sqft: realistic square footage estimate
- zones: array of {name, sqft, system_recommended, price_per_sqft, total}
- total_estimate: total project value
- materials_needed: string list of XPS products
- timeline_days: estimated project duration
- confidence: 0-100 confidence in estimate`,
        response_json_schema: {
          type: "object",
          properties: {
            estimated_sqft: { type: "number" },
            zones: { type: "array", items: { type: "object", properties: { name: { type: "string" }, sqft: { type: "number" }, system_recommended: { type: "string" }, price_per_sqft: { type: "number" }, total: { type: "number" } } } },
            total_estimate: { type: "number" },
            materials_needed: { type: "string" },
            timeline_days: { type: "number" },
            confidence: { type: "number" },
          },
        },
      });
      log("Auto Takeoff", "success", takeoff);
      results.takeoff = takeoff;
    } catch (e) {
      log("Auto Takeoff", "failed", e.message);
      results.errors.push(e.message);
    }
  }

  // PROPOSAL — generate a proposal from contact + takeoff data
  if (action === "auto_proposal" || action === "full_pipeline") {
    const takeoff = results.takeoff || contact.takeoff;
    try {
      const proposal = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Generate a professional XPS sales proposal for:
Company: ${contact.company_name || contact.company}
Contact: ${contact.contact_name || ""}
Email: ${contact.email || ""}
Industry: ${contact.vertical || ""}
Location: ${contact.location || ""}
${takeoff ? `Takeoff Data: ${JSON.stringify(takeoff)}` : "Estimated scope: standard commercial epoxy flooring project"}

Create a compelling proposal with:
1. cover_letter: personalized intro letter
2. scope_summary: concise scope of work
3. pricing_aggressive: win-the-deal price
4. pricing_optimal: balanced price
5. pricing_premium: premium full-service price
6. materials_list: XPS product recommendations
7. timeline: project schedule
8. value_proposition: why choose XPS`,
        response_json_schema: {
          type: "object",
          properties: {
            cover_letter: { type: "string" },
            scope_summary: { type: "string" },
            pricing_aggressive: { type: "number" },
            pricing_optimal: { type: "number" },
            pricing_premium: { type: "number" },
            materials_list: { type: "string" },
            timeline: { type: "string" },
            value_proposition: { type: "string" },
          },
        },
      });
      log("Auto Proposal", "success", proposal);
      results.proposal = proposal;
    } catch (e) {
      log("Auto Proposal", "failed", e.message);
      results.errors.push(e.message);
    }
  }

  // WEBSITE SHARE — generate a personalized landing page link / product page recommendation
  if (action === "website_share" || action === "full_pipeline") {
    try {
      const site = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `For this contact, recommend the best XPS website pages to share:
Company: ${contact.company_name || contact.company}
Industry: ${contact.vertical || ""}
Specialty: ${contact.specialty || ""}
Current products: ${contact.existing_products || "unknown"}

XPS website: xpsxpress.com
Available pages: /products, /epoxy-flooring, /polished-concrete, /polyaspartic, /metallic-epoxy, /training, /locations, /about

Return:
- primary_url: the single best page to share
- secondary_urls: array of 2-3 additional relevant pages
- personalized_message: a short text/email message to send with the link
- product_recommendations: array of specific XPS products to highlight`,
        response_json_schema: {
          type: "object",
          properties: {
            primary_url: { type: "string" },
            secondary_urls: { type: "array", items: { type: "string" } },
            personalized_message: { type: "string" },
            product_recommendations: { type: "array", items: { type: "string" } },
          },
        },
      });
      log("Website Share", "success", site);
      results.website = site;
    } catch (e) {
      log("Website Share", "failed", e.message);
      results.errors.push(e.message);
    }
  }

  // AUTO WORKFLOW — generate a follow-up workflow for this contact
  if (action === "auto_workflow" || action === "full_pipeline") {
    try {
      const workflow = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Create a 5-step follow-up workflow for this sales contact:
Company: ${contact.company_name || contact.company}
Contact: ${contact.contact_name || ""}
Industry: ${contact.vertical || ""}
Current Stage: ${contact.stage || "Incoming"}
Score: ${contact.score || 50}

Design an intelligent workflow sequence with timing, channels, and content for each step.`,
        response_json_schema: {
          type: "object",
          properties: {
            workflow_name: { type: "string" },
            steps: { type: "array", items: { type: "object", properties: { step_number: { type: "number" }, action: { type: "string" }, channel: { type: "string" }, timing: { type: "string" }, content_summary: { type: "string" } } } },
            estimated_conversion_rate: { type: "string" },
            priority: { type: "string" },
          },
        },
      });

      // Save workflow to DB
      await base44.asServiceRole.entities.Workflow.create({
        name: workflow.workflow_name || `Follow-up: ${contact.company_name || contact.company}`,
        description: `Auto-generated workflow for ${contact.company_name || contact.company}`,
        steps: JSON.stringify(workflow.steps || []),
        status: "Active",
        trigger: "manual",
        category: "Sales",
        projected_result: workflow.estimated_conversion_rate || "Unknown",
      });

      log("Auto Workflow", "success", workflow);
      results.workflow = workflow;
    } catch (e) {
      log("Auto Workflow", "failed", e.message);
      results.errors.push(e.message);
    }
  }

  // PROJECT FOLDER — create a project folder in the Project entity
  if (action === "create_project" || action === "full_pipeline") {
    try {
      const companyName = contact.company_name || contact.company || "Unknown";
      const folder = await base44.asServiceRole.entities.Project.create({
        name: companyName,
        type: "folder",
        description: `Project folder for ${companyName} — ${contact.vertical || ""} — ${contact.location || ""}`,
        color: "#d4af37",
        tags: [contact.vertical, contact.specialty, "CRM", "auto-generated"].filter(Boolean).join(","),
        linked_lead_id: contact.id || contact.source_id || "",
      });

      // Create sub-documents
      const subDocs = [
        { name: "Proposals", type: "folder", parent_id: folder.id, color: "#22c55e" },
        { name: "Takeoffs", type: "folder", parent_id: folder.id, color: "#3b82f6" },
        { name: "Communications", type: "folder", parent_id: folder.id, color: "#8b5cf6" },
        { name: "Contact Notes", type: "document", parent_id: folder.id, content: `Contact: ${contact.contact_name || ""}\nEmail: ${contact.email || ""}\nPhone: ${contact.phone || ""}\nIndustry: ${contact.vertical || ""}\nNotes: ${contact.notes || ""}` },
      ];
      await base44.asServiceRole.entities.Project.bulkCreate(subDocs);

      log("Project Folder", "success", { folder_id: folder.id, name: companyName, sub_items: subDocs.length });
      results.project = { folder_id: folder.id, name: companyName };
    } catch (e) {
      log("Project Folder", "failed", e.message);
      results.errors.push(e.message);
    }
  }

  // EMAIL RESULTS — send test results to admin
  if (admin_email) {
    try {
      const stagesSummary = results.stages.map(s => `• ${s.stage}: ${s.status.toUpperCase()}`).join("\n");
      const detailBlocks = results.stages.map(s =>
        `=== ${s.stage} (${s.status}) ===\n${typeof s.detail === "object" ? JSON.stringify(s.detail, null, 2).substring(0, 500) : s.detail || "OK"}`
      ).join("\n\n");

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: admin_email,
        from_name: "XPS Power Tools",
        subject: `[XPS] Power Tools Run — ${action} — ${contact.company_name || contact.company} — ${results.errors.length === 0 ? "ALL PASSED ✅" : `${results.errors.length} ERRORS ❌`}`,
        body: `XPS Power Tools Execution Report
════════════════════════════════

Action: ${action}
Company: ${contact.company_name || contact.company}
Contact: ${contact.contact_name || "N/A"}
Run Time: ${new Date().toISOString()}

STAGE RESULTS:
${stagesSummary}

DETAILED OUTPUT:
${detailBlocks}

${results.errors.length > 0 ? `\nERRORS:\n${results.errors.join("\n")}` : "\nAll stages completed successfully."}

—
XPS Intelligence Platform`,
      });
      log("Email Report", "success", `Sent to ${admin_email}`);
    } catch (e) {
      log("Email Report", "failed", e.message);
    }
  }

  results.success = results.errors.length === 0;
  return Response.json(results);
});