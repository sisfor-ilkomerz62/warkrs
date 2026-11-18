"use client";
import { useState } from "react";
import { Menu, UserRound, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLogout } from "./logout";

export function StudentAccountMenu({ profile }: {
  profile: { name: string; nim: string | null; email: string };
}) {
  const [open, setOpen] = useState(false);
  const { pending, error, logout } = useLogout();
  return <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-11" aria-label="Menu akun" disabled={pending}>
          <Menu className="size-5" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => setOpen(true)}><UserRound aria-hidden="true" />Profil</DropdownMenuItem>
        <DropdownMenuItem disabled={pending} onSelect={() => void logout()}><LogOut aria-hidden="true" />Keluar</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    {error && <p role="status" className="text-xs text-destructive">{error}</p>}
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Profil</DialogTitle>
          <DialogDescription>Informasi akunmu yang terdaftar.</DialogDescription>
        </DialogHeader>
        <dl className="space-y-4 text-sm">
          {([["Nama Lengkap", profile.name], ["NIM", profile.nim || "Belum diisi"], ["Email", profile.email]]).map(([label, value]) =>
            <div key={label}>
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="mt-1 break-words font-medium">{value}</dd>
            </div>)}
        </dl>
      </DialogContent>
    </Dialog>
  </>;
}
