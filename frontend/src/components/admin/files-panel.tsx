"use client";

import { useState } from "react";
import { FolderOpen } from "lucide-react";
import { toast } from "sonner";

import { Card, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { adminApi } from "@/lib/api";
import { errorMessage } from "@/lib/error-messages";
import type { RentalRequestDetail, RentalRequestFile } from "@/types";

import { FileRow } from "./file-row";

const FILE_NOT_FOUND = { FILE_NOT_FOUND: "Arquivo não encontrado. A lista pode estar desatualizada." };

// admin so consulta os documentos enviados pelo cliente
export function FilesPanel({ request }: { request: RentalRequestDetail }) {
  const [opening, setOpening] = useState<string | null>(null);

  // aba aberta no clique (antes do await) para o navegador nao tratar como popup
  async function open(file: RentalRequestFile) {
    const tab = window.open("about:blank", "_blank");
    setOpening(file.id);
    try {
      const { url } = await adminApi.getFileUrl(request.id, file.id);
      if (tab) {
        tab.opener = null;
        tab.location.href = url;
      }
    } catch (err) {
      tab?.close();
      toast.error(errorMessage(err, FILE_NOT_FOUND));
    } finally {
      setOpening(null);
    }
  }

  return (
    <Card className="p-0 sm:p-0">
      <div className="p-5 sm:p-6">
        <CardTitle>
          Documentos <span className="font-normal text-ink-muted">({request.files.length})</span>
        </CardTitle>
      </div>
      {request.files.length > 0 ? (
        <ul className="divide-y divide-line border-t border-line">
          {request.files.map((file) => (
            <FileRow
              key={file.id}
              file={file}
              busy={opening === file.id}
              onOpen={() => void open(file)}
            />
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={FolderOpen}
          title="Nenhum documento anexado"
          description="O cliente não enviou documentos com esta solicitação."
          className="border-t border-line py-8"
        />
      )}
    </Card>
  );
}
