import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import PageHexGlow from "../components/PageHexGlow";
import { base44 } from "@/api/base44Client";
import { ArrowRight, Lock } from "lucide-react";

export default function CustomLogin() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    try {
      const response = await base44.functions.invoke("validatePassword", { password });
      const { success, role } = response.data;

      if (success) {
        sessionStorage.setItem("xps-role", role);
        toast({ title: "Access Granted", description: `Welcome, ${role}.` });

        if (role === "owner") {
          navigate("/admin-panel", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      } else {
        toast({
          title: "Access Denied",
          description: "Invalid password. Try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      // The function returns 401 for wrong passwords which throws an error
      const msg = error?.response?.data?.message || error?.message || "";
      if (msg.includes("Invalid password") || error?.response?.status === 401) {
        toast({
          title: "Access Denied",
          description: "Invalid password. Try again.",
          variant: "destructive",
        });
      } else {
        console.error("Login error:", error);
        toast({
          title: "Connection Error",
          description: "Could not reach server: " + msg,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hex-bg min-h-screen bg-background text-foreground relative flex items-center justify-center px-4">
      <PageHexGlow />
      <div className="relative z-[1] w-full max-w-md p-8 rounded-xl bg-card/80 backdrop-blur-md border border-border animated-silver-border">
        <div className="text-center mb-8">
          <img
            src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg"
            alt="XPS"
            className="w-20 h-20 mx-auto mb-4 object-contain"
          />
          <h1
            className="text-3xl font-extrabold metallic-gold-silver-text tracking-wider"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            XPS Intelligence
          </h1>
          <p className="text-sm text-muted-foreground mt-2">Enter your access code</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <Input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-12 text-base bg-secondary/50 border-input/50 focus:border-ring chat-input-metallic"
          />
          <Button
            type="submit"
            className="w-full h-12 rounded-lg text-lg font-bold metallic-gold-bg text-background hover:brightness-110 transition-all duration-300"
            disabled={loading}
          >
            {loading ? (
              "Verifying..."
            ) : (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Access System
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}