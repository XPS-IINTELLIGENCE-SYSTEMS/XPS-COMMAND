import { useState } from "react";
import { Image, Video, Bot, Share2, Mic, Palette } from "lucide-react";
import ImageCreatorModule from "./ImageCreatorModule";
import VideoCreatorModule from "./VideoCreatorModule";
import BrowserAgentModule from "./BrowserAgentModule";
import SocialMediaModule from "./SocialMediaModule";
import VoiceoverModule from "./VoiceoverModule";

const TABS = [
  { id: "images", label: "Images & Branding", icon: Image },
  { id: "video", label: "Video Creator", icon: Video },
  { id: "social", label: "Social Media", icon: Share2 },
  { id: "browser", label: "Browser Agent", icon: Bot },
  { id: "voiceover", label: "AI Voiceover", icon: Mic },
];

export default function MediaHub() {
  const [tab, setTab] = useState("images");

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Palette className="w-5 h-5 text-primary" />
        <div>
          <h1 className="text-xl font-extrabold text-foreground">Media & Automation Hub</h1>
          <p className="text-xs text-muted-foreground">Images, video, branding, social media, browser agent, voiceover</p>
        </div>
      </div>

      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}>
              <Icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === "images" && <ImageCreatorModule />}
      {tab === "video" && <VideoCreatorModule />}
      {tab === "social" && <SocialMediaModule />}
      {tab === "browser" && <BrowserAgentModule />}
      {tab === "voiceover" && <VoiceoverModule />}
    </div>
  );
}