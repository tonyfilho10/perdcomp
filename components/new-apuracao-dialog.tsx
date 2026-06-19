"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { criarApuracao } from "@/lib/actions/apuracoes";

export function NewApuracaoDialog({ empresaId }: { empresaId: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);
    try {
      await criarApuracao(formData);
      formRef.current?.reset();
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao cadastrar apuração");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline">Nova Apuração</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Apuração Mensal</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          <input type="hidden" name="empresaId" value={empresaId} />
          <div className="space-y-2">
            <Label htmlFor="competencia">Competência</Label>
            <Input id="competencia" name="competencia" placeholder="2026-05" required />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Salvando..." : "Cadastrar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
