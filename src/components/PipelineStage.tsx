import { Loader2, Check, XCircle, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface PipelineStageProps {
  label: string;
  description: string;
  status: "pending" | "active" | "done" | "failed";
  data?: any;
  metrics?: any;
}

export default function PipelineStage({ label, description, status, data, metrics }: PipelineStageProps) {
  const [expanded, setExpanded] = useState(status === "done");

  const icon = () => {
    switch (status) {
      case "active": return <Loader2 className="h-4 w-4 animate-spin text-accent" />;
      case "done": return <Check className="h-4 w-4 text-accent" />;
      case "failed": return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <div className="h-4 w-4 rounded-full border border-border" />;
    }
  };

  return (
    <div className={`pipeline-card overflow-hidden ${status === "active" ? "border-accent/30 pipeline-glow" : ""}`}>
      <button
        className="w-full p-4 flex items-center justify-between text-left"
        onClick={() => data && setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          {icon()}
          <div>
            <p className="text-sm font-medium text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        {data && (
          expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {expanded && data && (
        <div className="px-4 pb-4 animate-slide-up">
          {metrics && (
            <div className="flex gap-4 mb-3">
              {Object.entries(metrics).map(([key, val]) => (
                <div key={key} className="bg-secondary rounded px-3 py-2">
                  <p className="text-xs text-muted-foreground">{key.replace(/_/g, " ")}</p>
                  <p className="text-sm font-mono text-accent">{String(val)}</p>
                </div>
              ))}
            </div>
          )}
          <pre className="bg-secondary rounded p-3 text-xs font-mono text-secondary-foreground overflow-x-auto max-h-64 overflow-y-auto">
            {typeof data === "string" ? data : JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
