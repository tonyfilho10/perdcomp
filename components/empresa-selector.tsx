"use client";

import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Empresa = {
  id: string;
  razaoSocial: string;
  cnpj: string;
};

function formatCnpj(cnpj: string) {
  return cnpj
    .replace(/\D/g, "")
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export function EmpresaSelector({
  empresas,
  selectedId,
}: {
  empresas: Empresa[];
  selectedId: string | null;
}) {
  const router = useRouter();

  async function handleChange(empresaId: string | null) {
    if (!empresaId) return;
    await fetch("/api/empresa-selecionada", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ empresaId }),
    });
    router.refresh();
  }

  const selected = empresas.find((e) => e.id === selectedId);

  return (
    <div className="flex items-center gap-3">
      <Building2 className="size-4 text-muted-foreground" />
      <Select value={selectedId ?? undefined} onValueChange={handleChange}>
        <SelectTrigger className="w-[260px]">
          <SelectValue placeholder="Selecione a empresa">
            {(value: string | null) =>
              empresas.find((e) => e.id === value)?.razaoSocial ?? "Selecione a empresa"
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {empresas.map((empresa) => (
            <SelectItem key={empresa.id} value={empresa.id}>
              {empresa.razaoSocial}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selected && (
        <span className="text-xs text-muted-foreground">
          CNPJ {formatCnpj(selected.cnpj)}
        </span>
      )}
    </div>
  );
}
