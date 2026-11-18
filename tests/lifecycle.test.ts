import { test, after } from "node:test";
import assert from "node:assert/strict";
import { sql } from "drizzle-orm";
import { closeDb, getDb } from "../db/client";
import {
  joinGame,
  endGame,
  monitorGame,
  reconcileGame,
} from "../modules/games/lifecycle";
import { gameDetail } from "../modules/games/detail";
import { submitRanking } from "../modules/allocation/service";
import { saveDraft, publishGame } from "../modules/games/admin";
import { effectiveStatus } from "../modules/games/status";
import { actor } from "./helpers";
import { gameFixture } from "./fixtures";
after(closeDb);
test("authoritative lifecycle boundaries", () => {
  const start = new Date("2030-01-01T00:00:00Z"),
    end = new Date("2030-01-01T01:00:00Z");
  const game = {
    publishedAt: start,
    startsAt: start,
    endsAt: end,
    closedAt: null,
    completedAt: null,
  };
  assert.equal(
    effectiveStatus(game, new Date(start.getTime() - 1)),
    "Upcoming",
  );
  assert.equal(effectiveStatus(game, start), "Live");
  assert.equal(effectiveStatus(game, end), "Closing");
  assert.equal(
    effectiveStatus({ ...game, completedAt: end }, end),
    "Completed",
  );
});
test("Upcoming and late Live joins need affirmative matching consent, active whitelist; repeats stable", async () => {
  for (const startOffset of [60000, -60000]) {
    const f = await gameFixture({ startOffset, join: false });
    const input = {
      accepted: true as const,
      acceptedTermsVersion: f.game.termsVersion,
    };
    await assert.rejects(
      joinGame(f.students[0], f.id, { ...input, accepted: false as true }),
    );
    await assert.rejects(
      joinGame(f.students[0], f.id, {
        ...input,
        acceptedTermsVersion: "wrong",
      }),
      { code: "TERMS_CHANGED" },
    );
    await assert.rejects(joinGame(await actor(), f.id, input), {
      code: "FORBIDDEN",
    });
    const first = await joinGame(f.students[0], f.id, input);
    const again = await joinGame(f.students[0], f.id, input);
    assert.deepEqual(first, again);
    const m = await monitorGame(f.admin, f.id);
    assert.equal(m.whitelisted, 2);
    assert.equal(m.joined, 1);
    assert.equal(m.notJoined, 1);
    await assert.rejects(gameDetail(await actor(), f.id), {
      code: "FORBIDDEN",
    });
  }
});
test("admin participant monitor distinguishes committed submissions, joins and non-joins per game", async () => {
  const f = await gameFixture({ count: 3, join: false });
  for (const student of f.students.slice(0, 2)) {
    await joinGame(student, f.id, {
      accepted: true,
      acceptedTermsVersion: f.game.termsVersion,
    });
  }
  const before = await monitorGame(f.admin, f.id);
  assert.ok(before.members.every((m) => !m.hasSubmitted));
  await assert.rejects(submitRanking(f.students[1], f.id, []), {
    code: "INVALID_RANKING",
  });
  await submitRanking(f.students[0], f.id, f.packageIds);
  const after = await monitorGame(f.admin, f.id);
  for (const [index, student] of f.students.entries()) {
    const member = after.members.find((m) => m.id === student.id)!;
    assert.equal(Boolean(member.joinedAt), index < 2);
    assert.equal(member.hasSubmitted, index === 0);
  }
  assert.equal(after.whitelisted, 3);
  assert.equal(after.joined, 2);
  assert.equal(after.notJoined, 1);
  await assert.rejects(monitorGame(f.students[0], f.id), {
    code: "FORBIDDEN",
  });
  const other = await saveDraft(f.admin, f.input);
  await publishGame(f.admin, other.id);
  const otherMonitor = await monitorGame(f.admin, other.id);
  assert.ok(otherMonitor.members.every((m) => !m.hasSubmitted));
});
test("manual end shares row lock; required reason and immutable audited closure", async () => {
  const f = await gameFixture({ join: false });
  await assert.rejects(endGame(f.students[0], f.id, "Alasan penghentian"), {
    code: "FORBIDDEN",
  });
  await assert.rejects(endGame(f.admin, f.id, ""));
  await endGame(f.admin, f.id, "Pengujian penghentian manual");
  await endGame(f.admin, f.id, "Permintaan diulang dengan aman");
  await assert.rejects(
    joinGame(f.students[0], f.id, {
      accepted: true,
      acceptedTermsVersion: f.game.termsVersion,
    }),
    { code: "GAME_CLOSED" },
  );
  assert.equal((await gameDetail(f.admin, f.id)).status, "Completed");
  const audits = await getDb().execute(
    sql`SELECT * FROM admin_audit_logs WHERE game_id=${f.id} AND action='GAME_ENDED'`,
  );
  assert.equal(audits.rows.length, 1);
  await assert.rejects(
    getDb().execute(sql`UPDATE games SET closed_at=NULL WHERE id=${f.id}`),
  );
});
test("deadline checked after lock wait; scheduled reconciliation needs no cron", async () => {
  const f = await gameFixture({ join: false, endOffset: 500 });
  let locked!: () => void;
  const ready = new Promise<void>((r) => (locked = r));
  const hold = getDb().transaction(async (tx) => {
    await tx.execute(sql`SELECT id FROM games WHERE id=${f.id} FOR UPDATE`);
    locked();
    await tx.execute(sql`SELECT pg_sleep(0.65)`);
  });
  await ready;
  const joining = joinGame(f.students[0], f.id, {
    accepted: true,
    acceptedTermsVersion: f.game.termsVersion,
  });
  await hold;
  await assert.rejects(joining, { code: "GAME_CLOSED" });
  await reconcileGame(f.id);
  assert.equal((await gameDetail(f.admin, f.id)).status, "Completed");
});
