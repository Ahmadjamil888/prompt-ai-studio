const statusColors: Record<string, string> = {
  initializing: "bg-status-initializing/20 text-status-initializing",
  designing: "bg-status-designing/20 text-status-designing",
  training: "bg-status-training/20 text-status-training",
  deploying: "bg-status-deploying/20 text-status-deploying",
  deployed: "bg-status-deployed/20 text-status-deployed",
  failed: "bg-status-failed/20 text-status-failed",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[status] ?? "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}
