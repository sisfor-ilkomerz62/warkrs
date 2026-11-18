import Link from "next/link";
import { pageActor } from "@/lib/page-auth";
import { StudentAccountMenu } from "@/components/domain/student-account-menu";
import { getDb } from "@/db/client";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { invariant } from "@/lib/errors";
import { Brand } from "@/components/domain/brand";
import { Button } from "@/components/ui/button";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const actor = await pageActor();
  // Identity comes exclusively from the authenticated server session.
  const [profile] = await getDb()
    .select({ name: user.name, nim: user.nim, email: user.email })
    .from(user).where(eq(user.id, actor.id));
  invariant(profile, "UNAUTHENTICATED", "Silakan masuk terlebih dahulu.", 401);
  return (
    <div className="student-shell flex min-h-dvh flex-col">
      <header className="border-b border-primary/10 bg-card">
        <div className="student-navigation mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-x-2 gap-y-1 px-4 py-2 sm:px-6">
          <Brand compact href={actor.role === "ADMIN" ? "/admin" : "/games"} />
          <div className="flex min-w-0 items-center gap-1 sm:gap-3">
            <p
              className="hidden max-w-44 truncate text-sm text-muted-foreground sm:block"
              title={actor.name}
            >
              {actor.name}
            </p>
            {actor.role === "ADMIN" && (
              <Button size="sm" variant="outline" asChild>
                <Link href="/admin">Admin</Link>
              </Button>
            )}
            <StudentAccountMenu profile={profile} />
          </div>
        </div>
      </header>
      <main
        id="konten"
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-4 sm:px-6 sm:py-7"
      >
        <div className="page-stack">{children}</div>
      </main>
      <footer className="border-t px-5 py-5 text-center text-xs leading-relaxed text-muted-foreground">
        <p>War KRS Ilkomerz 62</p>
      </footer>
    </div>
  );
}
