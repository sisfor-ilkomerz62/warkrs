import { pageActor } from "@/lib/page-auth";
import { listGames } from "@/modules/games/queries";
import { GameList } from "@/components/domain/game-list";
import { PageHeader } from "@/components/domain/page-header";
export default async function Page() {
  const games = await listGames(await pageActor());
  return (
    <>
      <PageHeader
        title="Daftar War"
        description="Pilih War untuk bergabung, berpartisipasi, atau melihat hasil."
      />
      <GameList games={games} />
    </>
  );
}
