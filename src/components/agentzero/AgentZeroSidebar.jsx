import { useState } from "react";
import { Plus, MessageSquare, Search, Settings, ChevronLeft, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AgentZeroLogo from "./AgentZeroLogo";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function AgentZeroSidebar({ conversations, activeId, onSelect, onNew, onDelete, collapsed, onToggle }) {
  const [search, setSearch] = useState("");

  const filtered = conversations.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  if (collapsed) {
    return (
      <div className="w-16 h-full border-r border-border bg-card flex flex-col items-center py-4 gap-3">
        <Button variant="ghost" size="icon" onClick={onToggle} className="hover-metallic">
          <MessageSquare className="w-5 h-5 metallic-gold-icon" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onNew} className="hover-metallic">
          <Plus className="w-5 h-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-72 h-full border-r border-border bg-card flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-border">
        <AgentZeroLogo size="sm" />
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 hover-metallic" onClick={onNew}>
            <Plus className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover-metallic" onClick={onToggle}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm bg-secondary/50 border-0"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">No conversations yet</p>
        )}
        {filtered.map(conv => (
          <div
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-sm ${
              activeId === conv.id
                ? "bg-primary/10 text-foreground"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            }`}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span className="truncate flex-1">{conv.title}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-secondary">
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }} className="text-destructive">
                  <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-muted-foreground">
          <Settings className="w-3.5 h-3.5" />
          <span>Agent Zero v1.0 — XPS Intelligence</span>
        </div>
      </div>
    </div>
  );
}