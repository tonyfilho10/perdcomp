"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { desativarEmpresa } from "@/lib/actions/empresas";

export function DesativarEmpresaButton({ empresaId }: { empresaId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!confirm("Desativar esta empresa? Ela deixará de aparecer no seletor.")) {
      return;
    }
    setLoading(true);
    try {
      await desativarEmpresa(empresaId);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" variant="ghost" disabled={loading} onClick={handleClick}>
      Desativar
    </Button>
  );
}
