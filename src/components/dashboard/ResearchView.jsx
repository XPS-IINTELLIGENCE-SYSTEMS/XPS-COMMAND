import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import ResearchBrowser from "../research/ResearchBrowser";
import ResearchHistory from "../research/ResearchHistory";
import ResearchDetail from "../research/ResearchDetail";

export default function ResearchView() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("researchId") || null;
  });

  // Sync selected research ID with URL for hardware back button support
  const selectResult = useCallback((id) => {
    setSelectedResult(id);
    const url = new URL(window.location.href);
    if (id) {
      url.searchParams.set("researchId", id);
    } else {
      url.searchParams.delete("researchId");
    }
    window.history.pushState({}, "", url.toString());
  }, []);

  // Listen for popstate (hardware back button)
  useEffect(() => {
    const handler = () => {
      const params = new URLSearchParams(window.location.search);
      setSelectedResult(params.get("researchId") || null);
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  const loadResults = async () => {
    setLoading(true);
    const data = await base44.entities.ResearchResult.list("-created_date", 50);
    setResults(data || []);
    setLoading(false);
  };

  useEffect(() => { loadResults(); }, []);

  const handleResearchComplete = (newResult) => {
    loadResults();
    selectResult(newResult.research_id);
  };

  if (selectedResult) {
    return <ResearchDetail id={selectedResult} onBack={() => selectResult(null)} />;
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <ResearchBrowser onComplete={handleResearchComplete} />
      <ResearchHistory results={results} loading={loading} onSelect={selectResult} onRefresh={loadResults} pullRefresh />
    </div>
  );
}