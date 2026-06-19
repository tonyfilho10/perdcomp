"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { fecharApuracao } from "@/lib/actions/apuracoes";

export function FecharApuracaoButton({ apuracaoId }: { apuracaoId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (!confirm("Fechar esta apuração? Após fechada, ela não pode mais ser editada.")) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await fecharApuracao(apuracaoId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao fechar apuração");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="outline" disabled={loading} onClick={handleClick}>
        Fechar
      </Button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
