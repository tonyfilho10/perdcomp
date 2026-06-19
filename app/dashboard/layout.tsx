import { prisma } from "@/lib/prisma";
import { getSelectedEmpresaId } from "@/lib/empresa-cookie";
import { SidebarNav } from "@/components/sidebar-nav";
import { EmpresaSelector } from "@/components/empresa-selector";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [empresasRaw, selectedEmpresaId] = await Promise.all([
    prisma.empresa.findMany({
      where: { ativa: true },
      orderBy: { razao_social: "asc" },
      select: { id: true, razao_social: true, cnpj: true },
    }),
    getSelectedEmpresaId(),
  ]);

  const empresas = empresasRaw.map((e) => ({
    id: e.id,
    razaoSocial: e.razao_social,
    cnpj: e.cnpj,
  }));

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden text-white">
      <SidebarNav />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 border-b border-gray-800 flex items-center px-4">
          <EmpresaSelector empresas={empresas} selectedId={selectedEmpresaId} />
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
