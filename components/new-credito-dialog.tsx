"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { criarCredito } from "@/lib/actions/creditos";

const TIPOS = [
  { value: "RETENCAO", label: "Crédito de retenção" },
  { value: "SALDO_NEGATIVO", label: "Saldo negativo" },
  { value: "ESTIMATIVA", label: "Estimativa" },
  { value: "PAGAMENTO_INDEVIDO", label: "Pagamento indevido" },
];

export function NewCreditoDialog({ empresaId }: { empresaId: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tipo, setTipo] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);
    try {
      await criarCredito(formData);
      formRef.current?.reset();
      setTipo("");
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao cadastrar crédito");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Novo Crédito Tributário</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Crédito Tributário</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          <input type="hidden" name="empresaId" value={empresaId} />
          <div className="space-y-2">
            <Label htmlFor="competenciaOrigem">Competência de origem</Label>
            <Input
              id="competenciaOrigem"
              name="competenciaOrigem"
              placeholder="2026-05"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo</Label>
            <input type="hidden" name="tipo" value={tipo} />
            <Select value={tipo} onValueChange={(v) => setTipo(v ?? "")}>
              <SelectTrigger id="tipo">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {TIPOS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="valorOriginal">Valor</Label>
            <Input
              id="valorOriginal"
              name="valorOriginal"
              type="number"
              step="0.01"
              min="0.01"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea id="descricao" name="descricao" />
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
