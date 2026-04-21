import { Monitor } from "lucide-react";

export default function EditorCanvas({ htmlContent, activeToolView }) {
  // If a tool is active, show it
  if (activeToolView) {
    return (
      <div className="flex-1 h-full overflow-y-auto">
        {activeToolView}
      </div>
    );
  }

  // If HTML content from agent, render in iframe
  if (htmlContent) {
    const fullHtml = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<script src="https://cdn.tailwindcss.com"><\/script>
<style>body{margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;}</style>
</head><body>${htmlContent}</body></html>`;

    return (
      <iframe
        srcDoc={fullHtml}
        className="w-full h-full border-0"
        title="Editor Canvas"
        sandbox="allow-scripts allow-same-origin"
      />
    );
  }

  // Empty state
  return (
    <div className="flex-1 h-full flex items-center justify-center">
      <div className="text-center">
        <Monitor className="w-16 h-16 mx-auto mb-4 text-muted-foreground/15" />
        <h3 className="text-lg font-bold metallic-gold mb-1">Editor Canvas</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Use the chat agent or toolbar to open tools, generate UI, clone sites, or build anything.
        </p>
      </div>
    </div>
  );
}