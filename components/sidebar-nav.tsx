"use client";

import { useEffect, useState } from "react";
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
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, color: "text-sky-400" },
  { href: "/dashboard/empresas", label: "Empresas", icon: Building2, color: "text-violet-400" },
  { href: "/dashboard/apuracoes", label: "Apurações", icon: ClipboardList, color: "text-amber-400" },
  { href: "/dashboard/creditos", label: "Créditos", icon: Coins, color: "text-emerald-400" },
  { href: "/dashboard/perdcomps", label: "PERDCOMPs", icon: FileText, color: "text-blue-400" },
  { href: "/dashboard/inss", label: "Controle INSS", icon: Receipt, color: "text-rose-400" },
  { href: "/dashboard/relatorios", label: "Relatórios", icon: BarChart3, color: "text-cyan-400" },
  { href: "/dashboard/usuarios", label: "Usuários", icon: Users, color: "text-fuchsia-400" },
];

const STORAGE_KEY = "perdcomp_sidebar_collapsed";

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
    setHydrated(true);
  }, []);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
  }

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      className={cn(
        "shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col transition-[width] duration-200",
        hydrated ? (collapsed ? "w-16" : "w-60") : "w-60"
      )}
    >
      <div className="h-14 flex items-center gap-2 px-4 border-b border-sidebar-border overflow-hidden">
        <ShieldCheck className="size-5 text-primary shrink-0" />
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-semibold text-sm leading-none text-sidebar-foreground">
              PERDCOMP
            </p>
            <p className="text-[11px] text-muted-foreground leading-none mt-0.5">
              Control
            </p>
          </div>
        )}
      </div>
      <nav className="flex-1 p-2 space-y-0.5">
        {LINKS.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              title={collapsed ? link.label : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                active &&
                  "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
                collapsed && "justify-center px-0"
              )}
            >
              <Icon className={cn("size-4 shrink-0", active && link.color)} />
              {!collapsed && link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-2 border-t border-sidebar-border space-y-0.5">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full text-muted-foreground",
            collapsed ? "justify-center px-0" : "justify-start gap-2.5"
          )}
          onClick={toggleCollapsed}
          title={collapsed ? "Expandir" : "Recolher"}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4" />
          ) : (
            <>
              <PanelLeftClose className="size-4" />
              Recolher
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full text-muted-foreground",
            collapsed ? "justify-center px-0" : "justify-start gap-2.5"
          )}
          onClick={handleLogout}
          title={collapsed ? "Sair" : undefined}
        >
          <LogOut className="size-4" />
          {!collapsed && "Sair"}
        </Button>
      </div>
    </aside>
  );
}
