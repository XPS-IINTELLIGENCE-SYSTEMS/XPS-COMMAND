import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { proposal_id, lead_id, client_name, client_email, line_items, tax_rate, payment_terms, due_days, notes } = await req.json();

    // Try to get info from proposal or lead
    let clientInfo = { name: client_name || "TBD", email: client_email || "" };
    let items = line_items || [];
    
    if (proposal_id) {
      const proposal = await base44.entities.Proposal.get(proposal_id);
      clientInfo.name = proposal.client_name;
      clientInfo.email = proposal.client_email;
      if (!items.length) {
        items = [{ 
          description: `${proposal.service_type} - ${proposal.square_footage} sq ft`, 
          qty: 1, 
          unit_price: proposal.total_value, 
          total: proposal.total_value 
        }];
      }
    } else if (lead_id) {
      const lead = await base44.entities.Lead.get(lead_id);
      clientInfo.name = lead.company;
      clientInfo.email = lead.email || "";
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.total || item.unit_price * (item.qty || 1)), 0);
    const taxRateVal = tax_rate || 0;
    const taxAmount = subtotal * (taxRateVal / 100);
    const total = subtotal + taxAmount;

    // Generate invoice number
    const existing = await base44.entities.Invoice.filter({});
    const nextNum = (existing?.length || 0) + 1;
    const invoiceNumber = `INV-${String(nextNum).padStart(4, '0')}`;

    // Calculate due date
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (due_days || 30));

    const invoice = await base44.entities.Invoice.create({
      invoice_number: invoiceNumber,
      client_name: clientInfo.name,
      client_email: clientInfo.email,
      line_items: JSON.stringify(items),
      subtotal,
      tax_rate: taxRateVal,
      tax_amount: taxAmount,
      total,
      status: "Draft",
      due_date: dueDate.toISOString(),
      payment_terms: payment_terms || "Net 30",
      notes: notes || "",
      proposal_id: proposal_id || "",
      lead_id: lead_id || ""
    });

    return Response.json({ 
      success: true, 
      message: `Invoice ${invoiceNumber} created for $${total.toFixed(2)}`,
      invoice_id: invoice.id,
      invoice
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});