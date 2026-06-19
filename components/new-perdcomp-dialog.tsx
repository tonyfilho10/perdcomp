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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { criarPerdcomp } from "@/lib/actions/perdcomps";

const TRIBUTOS = [
  { value: "PIS", label: "PIS" },
  { value: "COFINS", label: "COFINS" },
  { value: "PIS_COFINS", label: "PIS/COFINS" },
];

type Apuracao = { id: string; competencia: string };
type Credito = { id: string; competencia_origem: string; saldo_disponivel: number };

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function NewPerdcompDialog({
  empresaId,
  apuracoes,
  creditos,
}: {
  empresaId: string;
  apuracoes: Apuracao[];
  creditos: Credito[];
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tributo, setTributo] = useState("");
  const [apuracaoId, setApuracaoId] = useState("");
  const [creditoId, setCreditoId] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);
    try {
      await criarPerdcomp(formData);
      formRef.current?.reset();
      setTributo("");
      setApuracaoId("");
      setCreditoId("");
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao cadastrar PERDCOMP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button disabled={apuracoes.length === 0}>Nova PERDCOMP</Button>}
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova PERDCOMP</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          <input type="hidden" name="empresaId" value={empresaId} />
          <div className="space-y-2">
            <Label htmlFor="apuracaoId">Apuração</Label>
            <input type="hidden" name="apuracaoId" value={apuracaoId} />
            <Select value={apuracaoId} onValueChange={(v) => setApuracaoId(v ?? "")}>
              <SelectTrigger id="apuracaoId">
                <SelectValue placeholder="Selecione a apuração">
                  {(value: string | null) =>
                    apuracoes.find((a) => a.id === value)?.competencia ??
                    "Selecione a apuração"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {apuracoes.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.competencia}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="competencia">Competência</Label>
            <Input id="competencia" name="competencia" placeholder="2026-05" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tributo">Tributo</Label>
            <input type="hidden" name="tributo" value={tributo} />
            <Select value={tributo} onValueChange={(v) => setTributo(v ?? "")}>
              <SelectTrigger id="tributo">
                <SelectValue placeholder="Selecione">
                  {(value: string | null) =>
                    TRIBUTOS.find((t) => t.value === value)?.label ?? "Selecione"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {TRIBUTOS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="debito">Débito</Label>
            <Input id="debito" name="debito" type="number" step="0.01" min="0" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="creditoId">Crédito a utilizar (opcional)</Label>
            <input type="hidden" name="creditoId" value={creditoId} />
            <Select value={creditoId} onValueChange={(v) => setCreditoId(v ?? "")}>
              <SelectTrigger id="creditoId">
                <SelectValue placeholder="Nenhum">
                  {(value: string | null) => {
                    const c = creditos.find((c) => c.id === value);
                    return c
                      ? `${c.competencia_origem} — ${formatCurrency(c.saldo_disponivel)}`
                      : "Nenhum";
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {creditos.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.competencia_origem} — {formatCurrency(Number(c.saldo_disponivel))}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="creditoUtilizado">Valor do Crédito Utilizado</Label>
            <Input
              id="creditoUtilizado"
              name="creditoUtilizado"
              type="number"
              step="0.01"
              min="0"
              defaultValue={0}
              required
            />
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
