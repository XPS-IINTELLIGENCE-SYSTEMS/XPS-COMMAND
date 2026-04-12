import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const { password } = await req.json();

    const ownerPassword = Deno.env.get("OWNER_PASSWORD");
    const operatorPassword = Deno.env.get("OPERATOR_PASSWORD");

    if (password === ownerPassword) {
      return Response.json({ success: true, role: "owner" });
    } else if (password === operatorPassword) {
      return Response.json({ success: true, role: "operator" });
    } else {
      return Response.json({ success: false, message: "Invalid password" }, { status: 401 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});