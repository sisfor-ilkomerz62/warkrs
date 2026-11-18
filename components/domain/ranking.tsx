"use client";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import {
  ArrowUp,
  ArrowDown,
  X,
  Plus,
  Check,
  CheckCircle2,
  LoaderCircle,
  Send,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api-client";
import { jakartaPrecise } from "@/lib/time";
import type { Result } from "@/modules/allocation/service";
export type WireResult = Omit<Result, "acceptedAt"> & { acceptedAt: string };
export function Ranking({
  id,
  packages,
  live,
  stale,
  onAccepted,
  authoritativeResult,
}: {
  id: string;
  packages: { id: string; name: string; capacity: number }[];
  live: boolean;
  stale: boolean;
  onAccepted?: () => void;
  authoritativeResult?: WireResult | null;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<WireResult | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    let disposed = false;
    api<WireResult | null>(`/api/games/${id}/me/submission`)
      .then((data) => {
        if (!disposed) {
          setResult(data);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!disposed)
          setMessage(
            "Hasil belum dapat diperiksa. Muat ulang untuk mencoba kembali.",
          );
      });
    return () => {
      disposed = true;
    };
  }, [id]);
  const confirmed = authoritativeResult ?? result;
  if (confirmed)
    return (
      <Card className="rounded-2xl border-success/20 bg-gradient-to-br from-success-subtle via-card to-card shadow-sm">
        <CardContent className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-success-subtle text-success">
              <CheckCircle2 className="size-5" aria-hidden="true" />
            </span>
            <h2 className="text-base font-semibold">Alokasi Anda diterima</h2>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              Paket yang diperoleh
            </p>
            <p className="mt-2 break-words text-3xl font-semibold text-primary sm:text-4xl">
              {confirmed.allocation.packageName}
            </p>
          </div>
          <dl className="grid grid-cols-1 gap-4 rounded-xl border border-success/15 bg-card/80 p-4 min-[375px]:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">
                Prioritas terpilih
              </dt>
              <dd className="mt-2 text-lg font-semibold">
                Pilihan ke-{confirmed.allocation.awardedRank}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">
                Urutan penerimaan
              </dt>
              <dd className="mt-2 text-lg font-semibold tabular-nums">
                #{confirmed.sequence}
              </dd>
            </div>
          </dl>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Diterima server{" "}
            <time dateTime={confirmed.acceptedAt}>
              {jakartaPrecise(confirmed.acceptedAt, true)}
            </time>
            . Hasil tetap dan tidak dapat diubah.
          </p>
        </CardContent>
      </Card>
    );
  if (!live)
    return (
      <div className="rounded-lg border bg-card p-5">
        <p role="status" className="text-sm text-muted-foreground">
          {!loaded
            ? "Memeriksa hasil tersimpan…"
            : "Belum ada pengiriman yang diterima untuk Anda."}
          {message}
        </p>
      </div>
    );
  function move(index: number, delta: number) {
    const copy = [...selected];
    [copy[index], copy[index + delta]] = [copy[index + delta], copy[index]];
    setSelected(copy);
  }
  return (
    <Card
      className="gap-4 rounded-2xl border-primary/20 py-4 shadow-sm shadow-primary/5"
      aria-busy={pending}
    >
      <CardHeader className="border-b border-primary/10 px-4">
        <CardTitle>
          <h2 className="flex items-center gap-2">
            <span
              className="flex size-7 items-center justify-center rounded-lg bg-primary text-xs"
              aria-hidden="true"
            >
              <span className="text-primary-foreground">1</span>
            </span>
            Urutkan pilihan paket
          </h2>
        </CardTitle>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Ketuk seluruh paket sesuai urutan pilihanmu.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 px-4">
        {!loaded ? (
          <div className="space-y-3" role="status">
            <p className="text-sm text-muted-foreground">
              Memeriksa pengiriman tersimpan…
            </p>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {packages.map((p) => {
              const rank = selected.indexOf(p.id) + 1;
              return (
                <Button
                  key={p.id}
                  className={`h-auto min-h-18 w-full justify-start gap-3 rounded-xl whitespace-normal px-3 py-3 text-left font-normal disabled:grayscale-0 disabled:border-solid ${rank ? "border-primary/40 bg-accent text-accent-foreground shadow-sm" : "border-border bg-card hover:border-primary/40 hover:bg-accent/50"}`}
                  variant="outline"
                  aria-label={
                    rank
                      ? `Pilihan ${rank}: ${p.name}`
                      : `+ ${p.name}, kuota ${p.capacity}`
                  }
                  aria-pressed={Boolean(rank)}
                  disabled={Boolean(rank) || pending || !loaded}
                  onClick={() => setSelected([...selected, p.id])}
                >
                  <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-base font-semibold ${rank ? "bg-primary text-primary-foreground" : "border bg-muted/50 text-muted-foreground"}`}
                  >
                    {rank || <Plus className="size-4" aria-hidden="true" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{p.name}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      Kuota {p.capacity}
                    </span>
                  </span>
                  {Boolean(rank) && (
                    <Check
                      className="size-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                  )}
                </Button>
              );
            })}
          </div>
        )}
        <div className="space-y-3 rounded-xl bg-muted/40 p-3 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <h3 className="flex items-center gap-2 font-semibold">
              <span
                className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-xs text-primary"
                aria-hidden="true"
              >
                2
              </span>
              Tinjau prioritas
            </h3>
            <span className="text-xs text-muted-foreground" aria-live="polite">
              {selected.length} dari {packages.length} paket dipilih
            </span>
          </div>
          <Progress
            value={
              packages.length ? (selected.length / packages.length) * 100 : 0
            }
            aria-label="Kelengkapan urutan paket"
            className="h-1.5"
          />
          {selected.length > 0 ? (
            <ol className="divide-y rounded-xl border bg-card">
              {selected.map((packageId, i) => (
                <li
                  key={packageId}
                  className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-1 px-3 py-2 sm:flex"
                >
                  <span
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-sm font-semibold text-primary"
                    aria-label={`Prioritas ${i + 1}`}
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-medium">
                    {packages.find((p) => p.id === packageId)?.name}
                  </span>
                  <div className="col-span-2 flex justify-end gap-1 sm:ml-auto">
                    <Button
                      size="icon"
                      className="size-11"
                      variant="ghost"
                      aria-label={`Naikkan pilihan ${i + 1}`}
                      disabled={i === 0 || pending}
                      onClick={() => move(i, -1)}
                    >
                      <ArrowUp className="size-4" aria-hidden="true" />
                    </Button>
                    <Button
                      size="icon"
                      className="size-11"
                      variant="ghost"
                      aria-label={`Turunkan pilihan ${i + 1}`}
                      disabled={i === selected.length - 1 || pending}
                      onClick={() => move(i, 1)}
                    >
                      <ArrowDown className="size-4" aria-hidden="true" />
                    </Button>
                    <Button
                      size="icon"
                      className="size-11 text-muted-foreground hover:text-destructive"
                      variant="ghost"
                      aria-label={`Hapus pilihan ${i + 1}`}
                      disabled={pending}
                      onClick={() =>
                        setSelected(selected.filter((p) => p !== packageId))
                      }
                    >
                      <X className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="rounded-lg border border-dashed px-4 py-5 text-center text-sm text-muted-foreground">
              Pilih paket pertama untuk mulai menyusun urutan.
            </p>
          )}
        </div>
        <div className="space-y-3 border-t border-primary/10 pt-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <span
              className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-xs text-primary"
              aria-hidden="true"
            >
              3
            </span>
            Kirim pilihanmu
          </h3>
          <details className="text-xs leading-6 text-muted-foreground">
            <summary className="cursor-pointer">Ketentuan pengiriman</summary>
            <p>
              Satu pengiriman yang diterima bersifat tetap. Urutan resmi
              mengikuti penerimaan database, bukan waktu klik. Server harus
              menerima permintaan sebelum War ditutup.
            </p>
          </details>
          {message && (
            <Alert variant="destructive" role="status">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          <p
            role="status"
            aria-live="polite"
            className={`flex min-h-5 items-center gap-2 text-sm ${selected.length === packages.length && loaded && !stale && !pending ? "text-success" : "text-muted-foreground"}`}
          >
            {selected.length === packages.length &&
              loaded &&
              !pending &&
              !stale && (
                <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
              )}
            {pending
              ? "Mengirim dan menunggu konfirmasi server…"
              : stale
                ? "Menunggu koneksi server pulih sebelum mengirim."
                : selected.length === packages.length && loaded
                  ? "Semua paket dipilih. Siap dikirim."
                  : `Pilih semua ${packages.length} paket sebelum mengirim.`}
          </p>
          <Button
            className="h-12 w-full rounded-xl shadow-sm"
            disabled={
              pending || !loaded || stale || selected.length !== packages.length
            }
            onClick={async () => {
              if (pending) return;
              setPending(true);
              setMessage("");
              try {
                const accepted = await api<WireResult>(
                  `/api/games/${id}/submissions`,
                  { packageIds: selected },
                );
                setResult(accepted);
                toast.success("Alokasi paket diterima.");
                onAccepted?.();
              } catch (error) {
                try {
                  const saved = await api<WireResult | null>(
                    `/api/games/${id}/me/submission`,
                  );
                  if (saved) {
                    setResult(saved);
                    toast.success("Alokasi paket diterima.");
                    onAccepted?.();
                  } else {
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : "Pengiriman belum terkonfirmasi.",
                    );
                    setMessage(
                      error instanceof Error
                        ? error.message
                        : "Belum ada konfirmasi. Silakan coba kembali.",
                    );
                  }
                } catch {
                  toast.error("Konfirmasi belum tersedia. Coba lagi.");
                  setMessage(
                    "Konfirmasi belum tersedia. Muat ulang atau coba lagi; hasil yang sudah diterima tetap disimpan.",
                  );
                }
              } finally {
                setPending(false);
              }
            }}
          >
            {" "}
            {pending ? (
              <LoaderCircle
                className="size-4 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Send className="size-4" aria-hidden="true" />
            )}
            {pending ? "Menunggu server…" : "Kirim urutan paket"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
