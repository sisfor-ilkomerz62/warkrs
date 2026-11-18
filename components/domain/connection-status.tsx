import { CloudOff, RefreshCw } from "lucide-react";
export function ConnectionStatus({
  message,
  compact = false,
}: {
  message: string;
  compact?: boolean;
}) {
  const ok = message === "Tersinkron dengan server";
  const offline = message.startsWith("Offline");
  if (!message || ok) return null;
  const Icon = offline ? CloudOff : RefreshCw;
  return (
    <p
      role="status"
      className={`flex min-h-5 items-center gap-1.5 text-xs leading-relaxed ${compact ? "rounded-xl border border-warning/20 bg-warning-subtle px-3 py-2.5 text-warning" : "text-warning"}`}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}
