import { useState } from "react";
import { DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function BidCalcTool({ workflowColor }) {
  const [sqft, setSqft] = useState("");
  const [pricePerSqft, setPricePerSqft] = useState("6");
  const [materialCost, setMaterialCost] = useState("1.5");
  const [laborCost, setLaborCost] = useState("2");
  const [overhead, setOverhead] = useState("15");

  const area = parseFloat(sqft) || 0;
  const price = parseFloat(pricePerSqft) || 0;
  const material = parseFloat(materialCost) || 0;
  const labor = parseFloat(laborCost) || 0;
  const oh = parseFloat(overhead) || 0;

  const revenue = area * price;
  const totalCost = area * (material + labor);
  const overheadAmt = totalCost * (oh / 100);
  const profit = revenue - totalCost - overheadAmt;
  const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[["SQ FT", sqft, setSqft, "10000"], ["$/SQFT", pricePerSqft, setPricePerSqft, "6"], ["MATERIAL $/SQFT", materialCost, setMaterialCost, "1.50"], ["LABOR $/SQFT", laborCost, setLaborCost, "2.00"], ["OVERHEAD %", overhead, setOverhead, "15"]].map(([label, val, setter, ph]) => (
          <div key={label} className="space-y-1.5">
            <label className="text-xs text-white/40 font-medium">{label}</label>
            <Input value={val} onChange={e => setter(e.target.value)} placeholder={ph} className="bg-white/[0.04] border-white/[0.1] text-white" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        {[["REVENUE", revenue, "#d4af37"], ["TOTAL COST", totalCost + overheadAmt, "#ef4444"], ["PROFIT", profit, profit >= 0 ? "#10b981" : "#ef4444"], ["MARGIN", `${margin}%`, parseFloat(margin) >= 30 ? "#10b981" : "#f59e0b"]].map(([label, val, color]) => (
          <div key={label} className="rounded-xl p-3 bg-white/[0.04] border border-white/[0.1]">
            <div className="text-xs text-white/40 mb-1">{label}</div>
            <div className="text-lg font-bold" style={{ color }}>{typeof val === "number" ? `$${val.toLocaleString()}` : val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}