import { useState, useRef } from "react";
import { Loader2 } from "lucide-react";
import AdminChat from "../admin/AdminChat";

export default function AdminView() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 px-4 py-3 border-b border-border bg-card/30">
        <h1 className="text-base font-bold text-foreground">Admin Operator</h1>
        <p className="text-[10px] text-muted-foreground">AI command interface — type commands directly</p>
      </div>
      <div className="flex-1 overflow-hidden">
        <AdminChat />
      </div>
    </div>
  );
}