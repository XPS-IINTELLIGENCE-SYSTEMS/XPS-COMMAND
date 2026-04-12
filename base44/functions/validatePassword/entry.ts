import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const { password } = await req.json();

    const ownerPassword = Deno.env.get("OWNER_PASSWORD");
    const operatorPassword = Deno.env.get("OPERATOR_PASSWORD");

    console.log("Owner password exists:", !!ownerPassword, "length:", ownerPassword?.length);
    console.log("Operator password exists:", !!operatorPassword, "length:", operatorPassword?.length);
    console.log("Input password length:", password?.length);

    if (!password) {
      return Response.json({ success: false, message: "No password provided" }, { status: 400 });
    }

    if (ownerPassword && password.trim() === ownerPassword.trim()) {
      return Response.json({ success: true, role: "owner" });
    } else if (operatorPassword && password.trim() === operatorPassword.trim()) {
      return Response.json({ success: true, role: "operator" });
    } else {
      return Response.json({ success: false, message: "Invalid password" }, { status: 401 });
    }
  } catch (error) {
    console.error("validatePassword error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});