"use client";
import { toast } from "sonner";
import Link from "next/link";
import { LivePanels } from "./live-panels";
import { useGameUpdates } from "@/hooks/use-game-updates";
import { Ranking } from "./ranking";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Info,
  Clock3,
  LockKeyhole,
  LoaderCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StatusBadge } from "./status-badge";
import { ConnectionStatus } from "./connection-status";
import { api } from "@/lib/api-client";
import { jakarta } from "@/lib/time";
import { consentNoticeFor } from "@/modules/games/terms";
import type { GameStatus } from "@/modules/games/status";
export type RoomGame = {
  id: string;
  title: string;
  termsText: string;
  termsVersion: string;
  startsAt: string;
  endsAt: string;
  serverNow: string;
  status: GameStatus;
  joinedAt: string | null;
  packages: { id: string; name: string; capacity: number }[];
};
export function GameRoom({ initial }: { initial: RoomGame }) {
  const { game, snapshot, events, connection, refresh } =
    useGameUpdates(initial);
  const [now, setNow] = useState(new Date(initial.serverNow).getTime());
  const [accepted, setAccepted] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const stale = connection !== "Tersinkron dengan server";
  useEffect(() => {
    const started = performance.now();
    const timer = setInterval(
      () =>
        setNow(
          new Date(game.serverNow).getTime() + performance.now() - started,
        ),
      1000,
    );
    return () => clearInterval(timer);
  }, [game.serverNow]);
  const seconds = Math.max(
    0,
    Math.ceil((new Date(game.startsAt).getTime() - now) / 1000),
  );
  const closed = game.status === "Closing" || game.status === "Completed";
  return (
    <div className="mx-auto w-full max-w-4xl space-y-4">
      <section aria-label="Ringkasan War" className="space-y-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="icon"
            className="size-9 shrink-0 rounded-lg bg-card sm:size-11 sm:rounded-xl"
            asChild
          >
            <Link href="/games" aria-label="Kembali ke daftar War">
              <ArrowLeft className="size-5 sm:size-4" aria-hidden="true" />
            </Link>
          </Button>
          <div className="min-w-0 flex-1 py-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <h1 className="min-w-0 break-words text-lg font-semibold leading-snug tracking-tight sm:text-2xl">
                {game.title}
              </h1>
              <StatusBadge status={game.status} student />
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {!stale && <ConnectionStatus message={connection} compact />}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-11"
                  aria-label="Informasi dan jadwal War"
                >
                  <Info className="size-5" aria-hidden="true" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-72 max-w-[calc(100vw-2rem)] space-y-3 rounded-xl p-4"
                aria-label="Jadwal War"
              >
                <h2 className="flex items-center gap-2 font-semibold">
                  <Clock3 className="size-4 text-primary" aria-hidden="true" />
                  Jadwal War
                </h2>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">Mulai</dt>
                    <dd className="mt-1">{jakarta(game.startsAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Selesai</dt>
                    <dd className="mt-1">{jakarta(game.endsAt)}</dd>
                  </div>
                </dl>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        {stale && <ConnectionStatus message={connection} compact />}
      </section>
      {!game.joinedAt && !closed && (
        <Card className="mx-auto w-full max-w-3xl rounded-2xl border-primary/15 pt-0 shadow-sm">
          <CardHeader className="border-b border-primary/10 bg-accent/50 pt-5">
            <CardTitle>Bergabung ke War</CardTitle>
            <CardDescription>
              Baca ketentuan berikut sebelum memberikan persetujuan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="whitespace-pre-wrap text-sm leading-7">
              {game.termsText}
            </div>
            <div className="rounded-lg border bg-muted/50 p-4">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-medium">
                <LockKeyhole
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                Privasi dan pengiriman
              </h2>
              <p className="text-sm leading-7 text-muted-foreground">
                {consentNoticeFor(game.termsVersion)}
              </p>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-accent/40 p-4">
              <Checkbox
                id="consent"
                className="mt-1 size-5 shrink-0"
                checked={accepted}
                onCheckedChange={(v) => setAccepted(v === true)}
                disabled={pending}
              />
              <Label
                htmlFor="consent"
                className="cursor-pointer text-sm font-normal leading-7"
              >
                Saya telah membaca dan menyetujui ketentuan serta pemberitahuan
                nama lengkap
                {game.termsVersion.startsWith("nim-v2:") ? " dan NIM" : ""} di
                atas.
              </Label>
            </div>
            <Button
              className="h-11 w-full sm:w-auto"
              disabled={!accepted || pending || stale}
              onClick={async () => {
                setPending(true);
                setMessage("");
                try {
                  await api(`/api/games/${game.id}/join`, {
                    accepted: true,
                    acceptedTermsVersion: game.termsVersion,
                  });
                  toast.success("Berhasil bergabung ke War.");
                  await refresh();
                } catch (e) {
                  toast.error(
                    e instanceof Error ? e.message : "Gagal bergabung.",
                  );
                  setMessage(
                    e instanceof Error ? e.message : "Gagal bergabung.",
                  );
                } finally {
                  setPending(false);
                }
              }}
            >
              {pending && (
                <LoaderCircle
                  className="size-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              {pending ? "Bergabung…" : "Gabung War"}
            </Button>
            {message && (
              <Alert variant="destructive" role="status">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
      {game.joinedAt && (
        <>
          <LivePanels
            student
            key={
              game.status === "Live" && !snapshot?.ownSubmission
                ? "arena"
                : "result"
            }
            snapshot={snapshot}
            events={events}
          >
            {game.status === "Upcoming" ? (
              <Card className="rounded-2xl border-primary/20 bg-gradient-to-br from-accent via-card to-accent shadow-sm">
                <CardContent className="space-y-6 px-4 py-2 text-center sm:px-6 sm:py-5">
                  <div className="space-y-2">
                    <span className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Clock3 className="size-6" aria-hidden="true" />
                    </span>
                    <h2 className="text-lg font-semibold">War belum dimulai</h2>
                    <p className="text-sm text-muted-foreground">
                      {jakarta(game.startsAt)}
                    </p>
                  </div>
                  <div
                    role="timer"
                    aria-label="Hitung mundur menuju waktu mulai"
                    className="mx-auto grid max-w-sm grid-cols-3 gap-2 sm:gap-4"
                  >
                    {[
                      [Math.floor(seconds / 3600), "Jam"],
                      [Math.floor((seconds % 3600) / 60), "Menit"],
                      [seconds % 60, "Detik"],
                    ].map(([value, label]) => (
                      <div
                        key={String(label)}
                        className="min-w-0 rounded-2xl border border-primary/10 bg-card px-1 py-4 shadow-sm"
                      >
                        <span className="block text-3xl font-semibold tracking-tight tabular-nums text-primary sm:text-5xl">
                          {String(value).padStart(2, "0")}
                        </span>
                        <span className="mt-2 block text-xs font-medium text-muted-foreground">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p role="status" className="text-sm text-muted-foreground">
                    {seconds === 0
                      ? "Menunggu server membuka War…"
                      : "Pilihan paket dibuka saat War berlangsung."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Ranking
                id={game.id}
                packages={game.packages}
                live={game.status === "Live"}
                stale={stale}
                authoritativeResult={snapshot?.ownSubmission}
                onAccepted={() => void refresh()}
              />
            )}
          </LivePanels>
        </>
      )}
      {closed && (
        <div
          className={`flex items-start gap-3 rounded-xl border p-4 ${game.status === "Closing" ? "border-warning/20 bg-warning-subtle" : "bg-muted/60"}`}
        >
          <LockKeyhole
            className="mt-0.5 size-5 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <div>
            <h2 className="text-sm font-medium">
              {game.status === "Completed"
                ? "War selesai"
                : "War sedang ditutup"}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Pengiriman baru telah ditutup. Hasil yang diterima tetap disimpan.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
