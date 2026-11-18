import { WarVisibility } from "./game-management";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  CheckCircle2,
  CalendarClock,
  Clock3,
  Layers3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { EmptyState } from "./empty-state";
import { StatusBadge } from "./status-badge";
import type { listGames } from "@/modules/games/queries";
import { jakarta } from "@/lib/time";
type Games = Awaited<ReturnType<typeof listGames>>;
const studentOrder = {
  Live: 0,
  Upcoming: 1,
  Closing: 2,
  Completed: 3,
  Draft: 4,
};

function StudentGames({ games }: { games: Games }) {
  if (!games.length)
    return (
      <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-accent to-card px-5 py-10 text-center">
        <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <CalendarClock className="size-7" aria-hidden="true" />
        </span>
        <h2 className="text-lg font-semibold">Belum ada War</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          War untukmu akan muncul di sini.
        </p>
      </div>
    );
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:gap-5 xl:grid-cols-3">
      {[...games]
        .sort((a, b) => studentOrder[a.status] - studentOrder[b.status])
        .map((g) => {
          const live = g.status === "Live";
          const upcoming = g.status === "Upcoming";
          const completed = g.status === "Completed";
          const action = completed
            ? g.joinedAt
              ? "Lihat hasil"
              : "Lihat War"
            : g.status === "Closing"
              ? "Lihat perkembangan"
              : live && g.joinedAt
                ? "Masuk War"
                : "Buka War";
          return (
            <Card
              key={g.id}
              className={`student-war-card justify-between gap-5 rounded-2xl pt-0 ${live ? "border-primary/35 shadow-md shadow-primary/10" : "border-border shadow-sm"}`}
            >
              <CardHeader
                className={`gap-4 px-5 pb-5 pt-5 ${live ? "border-b border-primary/10 bg-gradient-to-br from-accent to-card" : upcoming ? "bg-accent/60" : "bg-muted/60"}`}
              >
                <StatusBadge status={g.status} student />
                <CardTitle>
                  <h2 className="text-lg leading-snug">{g.title}</h2>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 space-y-4 px-5">
                <div className="flex items-start gap-3">
                  <Clock3
                    className={`mt-0.5 size-4 shrink-0 ${live || upcoming ? "text-primary" : "text-muted-foreground"}`}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="mb-1 text-xs font-medium text-muted-foreground">
                      {upcoming
                        ? "Mulai"
                        : completed
                          ? "Jadwal selesai"
                          : "Batas pengiriman"}
                    </p>
                    <time
                      className="text-sm font-medium leading-relaxed"
                      dateTime={new Date(
                        upcoming ? g.startsAt : g.endsAt,
                      ).toISOString()}
                    >
                      {jakarta(upcoming ? g.startsAt : g.endsAt)}
                    </time>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <Layers3 className="size-4" aria-hidden="true" />
                    {g.packageCount} paket
                  </span>
                  {g.joinedAt ? (
                    <span className="inline-flex items-center gap-1.5 text-success">
                      <CheckCircle2 className="size-4" aria-hidden="true" />
                      Bergabung
                    </span>
                  ) : !completed && g.status !== "Closing" ? (
                    <span>Belum bergabung</span>
                  ) : null}
                </div>
              </CardContent>
              <CardFooter className="border-0 bg-transparent px-5 pb-5 pt-0">
                <Button
                  className="h-11 w-full justify-between"
                  variant={
                    completed || g.status === "Closing"
                      ? "secondary"
                      : "default"
                  }
                  asChild
                >
                  <Link
                    href={`/games/${g.id}`}
                    aria-label={`${action}: ${g.title}`}
                  >
                    {action}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
    </div>
  );
}
export function GameList({
  games,
  admin = false,
}: {
  games: Games;
  admin?: boolean;
}) {
  if (!admin) return <StudentGames games={games} />;
  if (!games.length)
    return (
      <EmptyState title="Belum ada War">
        {admin
          ? "Buat War untuk mulai menyiapkan jadwal, paket, dan peserta."
          : "War yang ditetapkan admin untukmu akan muncul di sini."}
      </EmptyState>
    );
  return (
    <>
      {admin && (
        <Card className="hidden overflow-hidden py-0 md:flex">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="pl-6">War</TableHead>
                <TableHead>Jadwal (WIB)</TableHead>
                <TableHead className="text-right">Paket</TableHead>
                <TableHead className="text-right">Peserta</TableHead>
                <TableHead className="pr-6 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {games.map((g) => (
                <TableRow key={g.id}>
                  <TableCell className="max-w-72 whitespace-normal py-5 pl-6">
                    <Link
                      href={`/admin/games/${g.id}`}
                      className="mb-2 block font-medium hover:text-primary"
                    >
                      {g.title}
                    </Link>
                    <StatusBadge status={g.status} />
                    {g.isHidden && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Disembunyikan
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="py-5 text-xs leading-6">
                    <span className="block">{jakarta(g.startsAt)}</span>
                    <span className="block text-muted-foreground">
                      s.d. {jakarta(g.endsAt)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {g.packageCount}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {g.whitelistCount}
                  </TableCell>
                  <TableCell className="space-y-2 pr-6 text-right">
                    {g.status !== "Draft" && (
                      <div>
                        <WarVisibility id={g.id} isHidden={g.isHidden} />
                      </div>
                    )}
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={`/admin/games/${g.id}`}>
                        Buka
                        <ArrowUpRight className="size-4" aria-hidden="true" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
      <div
        className={
          admin
            ? "grid gap-4 md:hidden"
            : "grid gap-5 md:grid-cols-2 xl:grid-cols-3"
        }
      >
        {games.map((g) => (
          <Card key={g.id} className="justify-between shadow-none">
            <CardHeader className="gap-3">
              <StatusBadge status={g.status} />
              {admin && g.isHidden && (
                <p className="text-xs text-muted-foreground">Disembunyikan</p>
              )}
              <CardTitle className="text-base font-semibold leading-relaxed">
                {g.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <dl className="space-y-2.5 text-sm">
                {[
                  ["Mulai", g.startsAt],
                  ["Selesai", g.endsAt],
                ].map(([label, date]) => (
                  <div
                    key={String(label)}
                    className="flex justify-between gap-4"
                  >
                    <dt className="shrink-0 text-muted-foreground">
                      {String(label)}
                    </dt>
                    <dd className="text-right text-xs leading-6">
                      {jakarta(date)}
                    </dd>
                  </div>
                ))}
              </dl>
              <dl className="grid grid-cols-2 gap-3 border-t pt-4 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">
                    {g.packageCount} paket
                  </dt>
                  <dd className="mt-1 font-medium">{g.capacity} total kuota</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">
                    {admin ? "Daftar peserta" : "Keikutsertaan"}
                  </dt>
                  <dd className="mt-1 flex items-center gap-1.5 font-medium">
                    {admin ? (
                      `${g.whitelistCount} mahasiswa`
                    ) : g.joinedAt ? (
                      <>
                        <CheckCircle2
                          className="size-3.5 text-success"
                          aria-hidden="true"
                        />
                        Bergabung
                      </>
                    ) : (
                      "Belum bergabung"
                    )}
                  </dd>
                </div>
              </dl>
            </CardContent>
            <CardFooter className="flex-col gap-2 bg-card">
              {admin && g.status !== "Draft" && (
                <WarVisibility id={g.id} isHidden={g.isHidden} />
              )}
              <Button
                className="w-full justify-between"
                variant="outline"
                asChild
              >
                <Link href={admin ? `/admin/games/${g.id}` : `/games/${g.id}`}>
                  Buka War
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
