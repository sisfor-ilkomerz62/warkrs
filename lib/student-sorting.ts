export type StudentSortKey = "name" | "nim" | "email" | "active";
export type StudentSort = { key: StudentSortKey; direction: "asc" | "desc" };
type SortableStudent = { id: string; name: string; nim: string | null; email: string; active: boolean };
const collator = new Intl.Collator("id", { sensitivity: "base", numeric: true });

/** Missing NIM stays last in either direction; never convert identifiers to numbers. */
export function sortStudents<T extends SortableStudent>(students: T[], sort: StudentSort): T[] {
  return [...students].sort((a, b) => {
    const key = sort.key;
    if (key === "nim" && (!a.nim || !b.nim)) {
      if (!a.nim && b.nim) return 1;
      if (a.nim && !b.nim) return -1;
    }
    const result = key === "active"
      ? Number(b.active) - Number(a.active)
      : collator.compare(a[key] ?? "", b[key] ?? "");
    return (sort.direction === "asc" ? result : -result) || collator.compare(a.id, b.id);
  });
}
