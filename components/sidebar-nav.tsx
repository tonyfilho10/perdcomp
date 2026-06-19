"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  ClipboardList,
  Coins,
  FileText,
  Receipt,
  BarChart3,
  Users,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/empresas", label: "Empresas", icon: Building2 },
  { href: "/dashboard/apuracoes", label: "Apurações", icon: ClipboardList },
  { href: "/dashboard/creditos", label: "Créditos", icon: Coins },
  { href: "/dashboard/perdcomps", label: "PERDCOMPs", icon: FileText },
  { href: "/dashboard/inss", label: "Controle INSS", icon: Receipt },
  { href: "/dashboard/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/dashboard/usuarios", label: "Usuários", icon: Users },
];

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-60 shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="h-14 flex items-center gap-2 px-4 border-b border-sidebar-border">
        <ShieldCheck className="size-5 text-primary" />
        <div>
          <p className="font-semibold text-sm leading-none text-sidebar-foreground">
            PERDCOMP
          </p>
          <p className="text-[11px] text-muted-foreground leading-none mt-0.5">
            Control
          </p>
        </div>
      </div>
      <nav className="flex-1 p-2 space-y-0.5">
        {LINKS.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                active &&
                  "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-2 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2.5 text-muted-foreground"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
