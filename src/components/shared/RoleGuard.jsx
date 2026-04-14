import { useAuth } from "@/lib/AuthContext";
import { hasMinRole, hasFeature } from "@/lib/permissions";
import { Shield } from "lucide-react";

export default function RoleGuard({ minRole, feature, children, fallback }) {
  const { user } = useAuth();

  if (minRole && !hasMinRole(user, minRole)) {
    return fallback || <AccessDenied />;
  }
  if (feature && !hasFeature(user, feature)) {
    return fallback || <AccessDenied />;
  }
  return children;
}

function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
      <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
        <Shield className="w-8 h-8 text-destructive" />
      </div>
      <h2 className="text-xl font-bold text-foreground">Access Restricted</h2>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        You don't have permission to view this page. Contact your administrator for access.
      </p>
      <a href="/dashboard" className="text-sm text-primary hover:underline mt-2">Return to Dashboard</a>
    </div>
  );
}

export { AccessDenied };