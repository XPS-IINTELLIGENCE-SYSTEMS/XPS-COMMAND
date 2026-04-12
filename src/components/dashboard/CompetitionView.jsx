import { Building2, MapPin, DollarSign } from "lucide-react";

const competitors = [
  {
    name: "PolyCoat Pro", threat: "High Threat", type: "Contractor", region: "Southeast FL", price: "$$",
    change: "New promo: 15% off garage floors", changeTime: "2 days ago",
    strengths: ["Fast turnaround", "Low pricing"], weaknesses: ["Limited warranty", "No industrial"],
  },
  {
    name: "FloorCraft Systems", threat: "Medium Threat", type: "Contractor", region: "Central FL", price: "$$$",
    change: "Added metallic epoxy service line", changeTime: "1 week ago",
    strengths: ["Premium finishes", "Strong reviews"], weaknesses: ["Slow response time", "Small team"],
  },
  {
    name: "EpoxyMaster Supply", threat: "High Threat", type: "Distributor", region: "National", price: "$$",
    change: "Price increase on polyaspartic systems +8%", changeTime: "3 days ago",
    strengths: ["Wide distribution", "Brand recognition"], weaknesses: ["No installation", "Higher MOQ"],
  },
];

export default function CompetitionView() {
  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 overflow-y-auto h-full">
      <div>
        <h1 className="text-xl font-bold text-foreground">Competition Intelligence</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Public source competitor monitoring and market intelligence</p>
      </div>

      <div className="space-y-4">
        {competitors.map((comp) => (
          <div key={comp.name} className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{comp.name}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${comp.threat === "High Threat" ? "bg-xps-red/20 text-xps-red" : "bg-xps-orange/20 text-xps-orange"}`}>
                      {comp.threat}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{comp.type}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{comp.region}</span>
                    <span className="flex items-center gap-1"><DollarSign className="w-2.5 h-2.5" />{comp.price}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-secondary/50 rounded-md p-2.5 mb-3">
              <div className="text-[10px] text-muted-foreground mb-0.5">Latest Change · {comp.changeTime}</div>
              <div className="text-xs font-medium text-foreground">{comp.change}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] font-semibold text-xps-green uppercase tracking-wider mb-1">Strengths</div>
                {comp.strengths.map((s) => (
                  <div key={s} className="text-[10px] text-muted-foreground">• {s}</div>
                ))}
              </div>
              <div>
                <div className="text-[10px] font-semibold text-xps-red uppercase tracking-wider mb-1">Weaknesses</div>
                {comp.weaknesses.map((w) => (
                  <div key={w} className="text-[10px] text-muted-foreground">• {w}</div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}