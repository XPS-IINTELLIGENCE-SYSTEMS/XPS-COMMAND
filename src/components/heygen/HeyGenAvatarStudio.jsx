import { useState, useEffect } from "react";
import { Loader2, User, Film, Upload, Globe, Layout, Sparkles, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AvatarGallery from "./AvatarGallery";
import PhotoUploader from "./PhotoUploader";
import VideoGenerator from "./VideoGenerator";
import VideoTranslator from "./VideoTranslator";

export default function HeyGenAvatarStudio() {
  const [tab, setTab] = useState("avatars");
  const [avatars, setAvatars] = useState(null);
  const [voices, setVoices] = useState(null);
  const [savedAvatars, setSavedAvatars] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [avatarRes, voiceRes, saved] = await Promise.all([
      base44.functions.invoke("heygenAvatar", { action: "list_avatars" }),
      base44.functions.invoke("heygenAvatar", { action: "list_voices" }),
      base44.entities.HeyGenAvatar.list("-created_date", 100),
    ]);
    setAvatars(avatarRes.data);
    setVoices(voiceRes.data);
    setSavedAvatars(saved);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleSelectAvatar = (avatar) => {
    setSelectedAvatar(avatar);
    setTab("generate");
  };

  const stockCount = avatars?.data?.avatars?.length || avatars?.data?.length || 0;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl metallic-gold-bg flex items-center justify-center">
            <User className="w-5 h-5 text-background" />
          </div>
          <div>
            <h2 className="text-lg font-bold metallic-gold">HeyGen Avatar Studio</h2>
            <p className="text-[10px] text-muted-foreground">Create lifelike AI avatars • Generate videos • Translate with lip-sync</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="text-[9px] bg-primary/10 text-primary">{savedAvatars.length} Saved</Badge>
          <Badge className="text-[9px] bg-secondary text-muted-foreground">{stockCount} Stock</Badge>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={loadData}><RefreshCw className="w-3.5 h-3.5 text-muted-foreground" /></Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="mx-4 mt-3 bg-secondary/50 p-0.5 h-auto flex-wrap justify-start">
          <TabsTrigger value="avatars" className="text-[10px] px-3 py-1.5 gap-1.5">
            <User className="w-3 h-3" /> Avatar Gallery
          </TabsTrigger>
          <TabsTrigger value="create" className="text-[10px] px-3 py-1.5 gap-1.5">
            <Upload className="w-3 h-3" /> Create Avatar
          </TabsTrigger>
          <TabsTrigger value="generate" className="text-[10px] px-3 py-1.5 gap-1.5">
            <Film className="w-3 h-3" /> Generate Video
          </TabsTrigger>
          <TabsTrigger value="translate" className="text-[10px] px-3 py-1.5 gap-1.5">
            <Globe className="w-3 h-3" /> Translate
          </TabsTrigger>
          <TabsTrigger value="templates" className="text-[10px] px-3 py-1.5 gap-1.5">
            <Layout className="w-3 h-3" /> Templates
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto p-4">
          <TabsContent value="avatars" className="mt-0">
            <AvatarGallery
              avatars={avatars}
              savedAvatars={savedAvatars}
              selectedAvatar={selectedAvatar?.avatar_id || selectedAvatar?.id}
              onSelect={handleSelectAvatar}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="create" className="mt-0">
            <PhotoUploader onAvatarCreated={() => loadData()} />
            <div className="mt-4 glass-card rounded-xl p-4">
              <h4 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-primary" /> Tips for Best Results</h4>
              <ul className="text-[10px] text-muted-foreground space-y-1.5">
                <li>• Use a clear, well-lit front-facing headshot</li>
                <li>• Neutral expression works best — the AI adds emotion from the script</li>
                <li>• High resolution (1024x1024+) produces sharper avatars</li>
                <li>• Avoid heavy filters, sunglasses, or obstructed faces</li>
                <li>• Multiple angles improve avatar quality (upload 3-5 photos)</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="generate" className="mt-0">
            <VideoGenerator selectedAvatar={selectedAvatar} voices={voices} />
          </TabsContent>

          <TabsContent value="translate" className="mt-0">
            <VideoTranslator />
          </TabsContent>

          <TabsContent value="templates" className="mt-0">
            <TemplatesPanel />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function TemplatesPanel() {
  const [templates, setTemplates] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await base44.functions.invoke("heygenAvatar", { action: "list_templates" });
    setTemplates(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const list = templates?.data?.templates || templates?.data || [];

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Layout className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">HeyGen Templates</h3>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
      ) : list.length === 0 ? (
        <p className="text-[10px] text-muted-foreground text-center py-8">No templates available in your HeyGen account</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {list.map((t, i) => (
            <div key={t.template_id || i} className="rounded-xl border border-border/30 overflow-hidden hover:border-primary/40 transition-all cursor-pointer">
              {t.thumbnail_image_url && <img src={t.thumbnail_image_url} className="w-full aspect-video object-cover" />}
              <div className="p-2">
                <p className="text-[10px] font-medium text-foreground truncate">{t.name || `Template ${i + 1}`}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}