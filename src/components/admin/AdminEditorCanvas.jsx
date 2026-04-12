import { useState, useRef } from "react";
import { Layout, Image, Video, Type, Wand2, Sparkles, Loader2, Paperclip, HardDrive, Database, GitBranch, Upload, Globe, Palette } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AdminWebBrowser from "./AdminWebBrowser";
import AdminImageCreator from "./AdminImageCreator";
import MultiAgentChat from "./MultiAgentChat";
import GanttChart from "../admin/GanttChart";
import ShadowScraper from "../admin/ShadowScraper";
import CommandScraper from "./CommandScraper";
import AgentHubView from "../dashboard/AgentHubView";
import AdminConnectorPanel from "./AdminConnectorPanel";

function SwarmTerminal() {
  const [cmd, setCmd] = useState("");
  const [output, setOutput] = useState([]);
  const [running, setRunning] = useState(false);

  const execute = async () => {
    if (!cmd.trim() || running) return;
    setOutput(prev => [...prev, { type: "cmd", text: `> ${cmd}` }]);
    setRunning(true);
    try {
      const res = await base44.functions.invoke("swarmOrchestrator", { command: cmd });
      setOutput(prev => [...prev, { type: "ok", text: res.data.message || JSON.stringify(res.data, null, 2) }]);
    } catch (err) {
      setOutput(prev => [...prev, { type: "err", text: err.message }]);
    }
    setCmd("");
    setRunning(false);
  };

  return (
    <div className="flex flex-col h-full bg-black/60 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1">
        <div className="text-green-400">XPS Swarm Orchestrator v1.0</div>
        <div className="text-white/30">Type a command to activate agents...</div>
        {output.map((line, i) => (
          <div key={i} className={line.type === "cmd" ? "text-cyan-400" : line.type === "err" ? "text-red-400" : "text-green-300"}>
            {line.text}
          </div>
        ))}
        {running && <div className="text-yellow-400 animate-pulse">Executing...</div>}
      </div>
      <div className="flex border-t border-white/10">
        <span className="px-3 py-2 text-green-400 font-mono text-xs">$</span>
        <input value={cmd} onChange={(e) => setCmd(e.target.value)} onKeyDown={(e) => e.key === "Enter" && execute()}
          className="flex-1 bg-transparent text-xs text-green-300 font-mono outline-none py-2" placeholder="Enter swarm command..." />
      </div>
    </div>
  );
}

function AttachmentPanel() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const handleUpload = async (e) => {
    const fileList = e.target.files;
    if (!fileList?.length) return;
    setUploading(true);
    for (const file of fileList) {
      const res = await base44.integrations.Core.UploadFile({ file });
      setFiles(prev => [...prev, { name: file.name, url: res.file_url, size: file.size }]);
    }
    setUploading(false);
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center gap-2 mb-4">
        <Paperclip className="w-4 h-4 text-primary" />
        <span className="text-sm font-bold text-white">File Attachments</span>
      </div>
      <button onClick={() => inputRef.current?.click()}
        className="w-full py-8 border-2 border-dashed border-white/15 rounded-2xl flex flex-col items-center gap-2 hover:border-primary/30 transition-colors mb-4">
        {uploading ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : <Upload className="w-6 h-6 text-white/30" />}
        <span className="text-xs text-white/40">{uploading ? "Uploading..." : "Click to upload files"}</span>
      </button>
      <input ref={inputRef} type="file" multiple className="hidden" onChange={handleUpload} />
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10">
              <Paperclip className="w-3 h-3 text-white/40" />
              <span className="text-xs text-white/70 truncate flex-1">{f.name}</span>
              <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-[9px] text-primary hover:underline">Open</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PlaceholderTool({ icon, title, desc }) {
  const Icon = icon;
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center space-y-3">
        <Icon className="w-12 h-12 text-white/15 mx-auto" />
        <h3 className="text-sm font-bold text-white/60">{title}</h3>
        <p className="text-xs text-white/30 max-w-sm">{desc}</p>
      </div>
    </div>
  );
}

function EditorHome() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center space-y-6 max-w-lg">
        <div className="flex items-center justify-center gap-4 mb-2">
          {[Image, Video, Layout, Type, Globe, Palette].map((Icon, i) => (
            <div key={i} className="shimmer-card w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Icon className="w-6 h-6 shimmer-icon text-white/30" />
            </div>
          ))}
        </div>
        <div>
          <h2 className="text-xl font-extrabold xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            CREATIVE STUDIO
          </h2>
          <p className="text-xs text-white/40 mt-2 leading-relaxed">
            Select a tool from the right toolbar — or tell the admin chat what you want to create.
            Image generation, web browsing, scraping, multi-agent discussions, and more.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {["Image AI", "Web Browser", "Shadow Scraper", "Command Scraper", "Multi-Agent Chat", "Swarm CMD", "Attachments", "Drive", "Supabase", "GitHub"].map((label) => (
            <span key={label} className="text-[10px] text-white/30 px-3 py-1.5 rounded-full border border-white/10">
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminEditorCanvas({ activeTool }) {
  switch (activeTool) {
    case "browser": return <AdminWebBrowser />;
    case "command_scraper": return <CommandScraper />;
    case "shadow_scraper": return <ShadowScraper />;
    case "image": return <AdminImageCreator />;
    case "chat": return <MultiAgentChat />;
    case "agents": return <AgentHubView />;
    case "gantt": return <GanttChart />;
    case "swarm": return <SwarmTerminal />;
    case "attach": return <AttachmentPanel />;
    case "drive": return <AdminConnectorPanel type="drive" />;
    case "supabase": return <AdminConnectorPanel type="supabase" />;
    case "github": return <AdminConnectorPanel type="github" />;
    case "video": return <PlaceholderTool icon={Video} title="Video Creator" desc="AI-powered video generation with HeyGen integration. Coming soon." />;
    case "ui_builder": return <PlaceholderTool icon={Layout} title="UI Builder" desc="Visual drag-and-drop interface builder. Coming soon." />;
    case "typography": return <PlaceholderTool icon={Type} title="Typography Studio" desc="Font pairing and typography system tools. Coming soon." />;
    case "palette": return <PlaceholderTool icon={Palette} title="Color Palette" desc="AI-powered color scheme generator. Coming soon." />;
    default: return <EditorHome />;
  }
}