import { useState } from "react";
import { Plus, MessageSquare, Search, ChevronLeft, Trash2, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function AgentZeroSidebar({ conversations, activeId, onSelect, onNew, onDelete, collapsed, onToggle }) {
  const [search, setSearch] = useState("");

  const filtered = conversations.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  if (collapsed) {
    return (
      <div className="w-14 h-full border-r border-[#e5e5e5] bg-[#f7f7f7] flex flex-col items-center py-4 gap-3">
        <button onClick={onToggle} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-[#eaeaea] text-[#666] transition-colors">
          <MessageSquare className="w-[18px] h-[18px]" />
        </button>
        <button onClick={onNew} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-[#eaeaea] text-[#666] transition-colors">
          <Plus className="w-[18px] h-[18px]" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-64 h-full border-r border-[#e5e5e5] bg-[#f7f7f7] flex flex-col">
      {/* Header */}
      <div className="px-3 py-3 flex items-center justify-between border-b border-[#e5e5e5]">
        <span className="text-[14px] font-semibold text-[#1a1a1a]">Conversations</span>
        <div className="flex gap-0.5">
          <button onClick={onNew} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-[#eaeaea] text-[#666] transition-colors">
            <Plus className="w-4 h-4" />
          </button>
          <button onClick={onToggle} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-[#eaeaea] text-[#666] transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-[9px] w-3.5 h-3.5 text-[#999]" />
          <input
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-8 pl-8 pr-3 rounded-lg bg-[#eee] border-0 text-[13px] text-[#333] placeholder:text-[#999] focus:outline-none focus:ring-1 focus:ring-[#ccc]"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        {filtered.length === 0 && (
          <p className="text-xs text-[#999] text-center py-8">No conversations yet</p>
        )}
        {filtered.map(conv => (
          <div
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all text-[13px] ${
              activeId === conv.id
                ? "bg-[#e5e5e5] text-[#1a1a1a]"
                : "text-[#666] hover:bg-[#eee] hover:text-[#333]"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate flex-1">{conv.title}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-[#ddd]" onClick={e => e.stopPropagation()}>
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }} className="text-red-600">
                  <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </div>
  );
}