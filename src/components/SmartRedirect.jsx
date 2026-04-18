import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";

/**
 * SmartRedirect — routes authenticated users to the right dashboard
 * based on whether they've completed onboarding and their role.
 */
export default function SmartRedirect() {
  const { user } = useAuth();
  const [target, setTarget] = useState(null);

  useEffect(() => {
    if (!user) return;
    // All users go to the CRM (Home)
    setTarget("/");
  }, [user]);

  if (!target) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-3" style={{ backgroundColor: 'hsl(240, 10%, 4%)' }}>
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <p className="text-xs text-muted-foreground">Loading your workspace...</p>
      </div>
    );
  }

  return <Navigate to={target} replace />;
}