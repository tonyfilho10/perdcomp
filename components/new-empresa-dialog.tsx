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
import { criarEmpresa } from "@/lib/actions/empresas";

export function NewEmpresaDialog() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [regime, setRegime] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);
    try {
      await criarEmpresa(formData);
      formRef.current?.reset();
      setRegime("");
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao cadastrar empresa");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Nova Empresa</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Empresa</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="razaoSocial">Razão Social</Label>
            <Input id="razaoSocial" name="razaoSocial" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input id="cnpj" name="cnpj" placeholder="00.000.000/0000-00" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="regimeTributario">Regime Tributário</Label>
            <input type="hidden" name="regimeTributario" value={regime} />
            <Select value={regime} onValueChange={(v) => setRegime(v ?? "")}>
              <SelectTrigger id="regimeTributario">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SIMPLES">Simples Nacional</SelectItem>
                <SelectItem value="LUCRO_PRESUMIDO">Lucro Presumido</SelectItem>
                <SelectItem value="LUCRO_REAL">Lucro Real</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="responsavelInterno">Responsável Interno</Label>
            <Input id="responsavelInterno" name="responsavelInterno" required />
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
