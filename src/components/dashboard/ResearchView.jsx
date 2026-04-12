import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import ResearchBrowser from "../research/ResearchBrowser";
import ResearchHistory from "../research/ResearchHistory";
import ResearchDetail from "../research/ResearchDetail";

export default function ResearchView() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);

  const loadResults = async () => {
    setLoading(true);
    const data = await base44.entities.ResearchResult.list("-created_date", 50);
    setResults(data || []);
    setLoading(false);
  };

  useEffect(() => { loadResults(); }, []);

  const handleResearchComplete = (newResult) => {
    loadResults();
    setSelectedResult(newResult.research_id);
  };

  if (selectedResult) {
    return <ResearchDetail id={selectedResult} onBack={() => setSelectedResult(null)} />;
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <ResearchBrowser onComplete={handleResearchComplete} />
      <ResearchHistory results={results} loading={loading} onSelect={setSelectedResult} onRefresh={loadResults} pullRefresh />
    </div>
  );
}