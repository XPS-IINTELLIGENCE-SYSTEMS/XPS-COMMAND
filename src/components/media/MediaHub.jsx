import { useState } from "react";
import { Image, Video, Share2, Mic, Palette, CreditCard, FolderOpen, TrendingUp, Globe, Sparkles, Package } from "lucide-react";
import BusinessCardCreator from "./BusinessCardCreator";
import BrandingStudio from "./BrandingStudio";
import VideoStudio from "./VideoStudio";
import VoiceoverStudio from "./VoiceoverStudio";
import SocialFactory from "./SocialFactory";
import ContentScraper from "./ContentScraper";
import ProjectFolders from "./ProjectFolders";
import MarketingStrategy from "./MarketingStrategy";
import AIImageStudio from "./AIImageStudio";
import BrandPackageGenerator from "./BrandPackageGenerator";

const TABS = [
  { id: "images", label: "AI Images", icon: Image },
  { id: "brand_package", label: "Brand Package", icon: Package },
  { id: "branding", label: "Branding Studio", icon: Palette },
  { id: "cards", label: "Business Cards", icon: CreditCard },
  { id: "video", label: "Video Studio", icon: Video },
  { id: "voiceover", label: "Voice & Script", icon: Mic },
  { id: "social", label: "Social Factory", icon: Share2 },
  { id: "scraper", label: "Inspiration", icon: Globe },
  { id: "marketing", label: "Marketing AI", icon: TrendingUp },
  { id: "projects", label: "Projects", icon: FolderOpen },
];

export default function MediaHub() {
  const [tab, setTab] = useState("images");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl metallic-gold-bg flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-black" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-foreground">Media & Creative Hub</h1>
          <p className="text-xs text-muted-foreground">Real AI image generation, full branding packages, video storyboards & content creation</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                tab === t.id
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}>
              <Icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {tab === "images" && <AIImageStudio />}
      {tab === "brand_package" && <BrandPackageGenerator />}
      {tab === "branding" && <BrandingStudio />}
      {tab === "cards" && <BusinessCardCreator />}
      {tab === "video" && <VideoStudio />}
      {tab === "voiceover" && <VoiceoverStudio />}
      {tab === "social" && <SocialFactory />}
      {tab === "scraper" && <ContentScraper />}
      {tab === "marketing" && <MarketingStrategy />}
      {tab === "projects" && <ProjectFolders />}
    </div>
  );
}