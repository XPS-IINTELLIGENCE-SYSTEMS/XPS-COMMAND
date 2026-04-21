import { Zap } from "lucide-react";

export default function AgentZeroLogo({ size = "md" }) {
  const sizes = {
    sm: { icon: 16, text: "text-base" },
    md: { icon: 24, text: "text-xl" },
    lg: { icon: 40, text: "text-3xl" },
    xl: { icon: 56, text: "text-5xl" },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/40 to-primary/10 blur-md" />
        <div className="relative rounded-lg bg-gradient-to-br from-primary to-yellow-600 p-1.5 flex items-center justify-center">
          <Zap className="text-black fill-black" style={{ width: s.icon, height: s.icon }} />
        </div>
      </div>
      <span className={`font-bold tracking-tight ${s.text}`}>
        <span className="metallic-gold">Agent</span>
        <span className="text-foreground"> Zero</span>
      </span>
    </div>
  );
}