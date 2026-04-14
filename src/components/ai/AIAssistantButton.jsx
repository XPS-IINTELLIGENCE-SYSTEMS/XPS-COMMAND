import { useState } from "react";
import { Brain } from "lucide-react";
import AIAssistantPanel from "./AIAssistantPanel";

export default function AIAssistantButton({ pageContext }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-[90] w-14 h-14 rounded-2xl metallic-gold-bg shadow-lg shadow-primary/20 flex items-center justify-center hover:scale-110 transition-transform"
          title="XPS AI Assistant"
        >
          <Brain className="w-7 h-7 text-background" />
        </button>
      )}
      <AIAssistantPanel open={open} onClose={() => setOpen(false)} pageContext={pageContext} />
    </>
  );
}