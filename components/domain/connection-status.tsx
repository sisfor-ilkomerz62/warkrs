import { CloudOff, RefreshCw, Check } from "lucide-react";
export function ConnectionStatus({
  message,
  compact = false,
}: {
  message: string;
  compact?: boolean;
}) {
  const ok = message === "Tersinkron dengan server";
  const offline = message.startsWith("Offline");
  const Icon = ok ? Check : offline ? CloudOff : RefreshCw;
  return (
    <p
      role="status"
      title={ok && compact ? message : undefined}
      className={`flex min-h-5 items-center gap-1.5 text-xs leading-relaxed ${ok ? (compact ? "text-success" : "text-muted-foreground") : compact ? "rounded-xl border border-warning/20 bg-warning-subtle px-3 py-2.5 text-warning" : "text-warning"}`}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      <span className={ok && compact ? "sr-only" : undefined}>{message}</span>
    </p>
  );
}
