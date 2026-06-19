"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  transmitirPerdcomp,
  homologarPerdcomp,
  indeferirPerdcomp,
  cancelarPerdcomp,
} from "@/lib/actions/perdcomps";

export function PerdcompActions({
  perdcompId,
  status,
}: {
  perdcompId: string;
  status: string;
}) {
  const [pending, setPending] = useState(false);
  const [indeferirOpen, setIndeferirOpen] = useState(false);
  const [motivo, setMotivo] = useState("");

  async function run(fn: () => Promise<void>) {
    setPending(true);
    try {
      await fn();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex gap-1">
      {status === "ELABORACAO" && (
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => run(() => transmitirPerdcomp(perdcompId))}
        >
          Transmitir
        </Button>
      )}
      {(status === "TRANSMITIDA" || status === "EM_ANALISE") && (
        <>
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => run(() => homologarPerdcomp(perdcompId))}
          >
            Homologar
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => setIndeferirOpen(true)}
          >
            Indeferir
          </Button>
        </>
      )}
      {status !== "CANCELADA" && status !== "HOMOLOGADA" && (
        <Button
          size="sm"
          variant="destructive"
          disabled={pending}
          onClick={() => {
            if (confirm("Tem certeza que deseja cancelar esta PERDCOMP?")) {
              run(() => cancelarPerdcomp(perdcompId));
            }
          }}
        >
          Cancelar
        </Button>
      )}

      <Dialog open={indeferirOpen} onOpenChange={setIndeferirOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Indeferir PERDCOMP</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Motivo do indeferimento"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
          <Button
            disabled={pending || !motivo.trim()}
            onClick={async () => {
              await run(() => indeferirPerdcomp(perdcompId, motivo));
              setIndeferirOpen(false);
              setMotivo("");
            }}
          >
            Confirmar
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
