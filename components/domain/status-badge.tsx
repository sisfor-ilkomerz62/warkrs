import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock3,
  FileText,
  Radio,
  LockKeyhole,
} from "lucide-react";
import { statusLabel, type GameStatus } from "@/modules/games/status";
const appearance = {
  Draft: { icon: FileText, className: "bg-muted text-muted-foreground" },
  Upcoming: { icon: Clock3, className: "bg-accent text-accent-foreground" },
  Live: { icon: Radio, className: "bg-success-subtle text-success" },
  Closing: { icon: LockKeyhole, className: "bg-warning-subtle text-warning" },
  Completed: { icon: CheckCircle2, className: "bg-muted text-foreground" },
};
export function StatusBadge({
  status,
  student = false,
}: {
  status: GameStatus;
  student?: boolean;
}) {
  const { icon: Icon, className } = appearance[status];
  return (
    <Badge
      variant="secondary"
      className={`shrink-0 gap-1.5 rounded-md px-2 py-1 font-medium ${student && status === "Live" ? "bg-primary text-primary-foreground" : className}`}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {statusLabel[status]}
    </Badge>
  );
}
