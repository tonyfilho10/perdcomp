"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/empresas", label: "Empresas" },
  { href: "/dashboard/apuracoes", label: "Apurações" },
  { href: "/dashboard/creditos", label: "Créditos" },
  { href: "/dashboard/perdcomps", label: "PERDCOMPs" },
  { href: "/dashboard/inss", label: "Controle INSS" },
  { href: "/dashboard/relatorios", label: "Relatórios" },
  { href: "/dashboard/usuarios", label: "Usuários" },
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
    <aside className="w-56 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="h-14 flex items-center px-4 border-b border-gray-800">
        <span className="font-semibold text-sm">PERDCOMP Control</span>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "block rounded-md px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white",
              pathname === link.href && "bg-gray-800 text-white"
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="p-2 border-t border-gray-800">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-gray-400"
          onClick={handleLogout}
        >
          Sair
        </Button>
      </div>
    </aside>
  );
}
