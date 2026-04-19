import GlobalNav from "@/components/navigation/GlobalNav";
import PageHexGlow from "@/components/PageHexGlow";
import ClientPortalView from "@/components/clientportal/ClientPortalView";

export default function ClientPortal() {
  return (
    <div className="min-h-screen bg-background safe-top safe-bottom hex-bg">
      <PageHexGlow />
      <GlobalNav />
      <div className="relative z-10 max-w-4xl mx-auto p-4 pb-20">
        <ClientPortalView />
      </div>
    </div>
  );
}