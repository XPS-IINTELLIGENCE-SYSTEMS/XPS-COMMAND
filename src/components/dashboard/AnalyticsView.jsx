import PipelineCharts from "./PipelineCharts";

export default function AnalyticsView() {
  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="glass-panel rounded-xl p-4 mb-4">
          <h1 className="text-base font-bold text-foreground">Analytics</h1>
          <p className="text-xs text-muted-foreground">Real-time pipeline metrics from your actual data</p>
        </div>
        <PipelineCharts />
      </div>
    </div>
  );
}