"use client";

import { useState } from "react";
import { Download, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useApiResource } from "@/hooks/use-api-resource";
import { adminApi } from "@/lib/api";
import { errorMessage } from "@/lib/error-messages";
import { previewKind } from "@/lib/file-preview";
import { formatBytes } from "@/lib/format";
import type { RentalRequestFile } from "@/types";

import { ImagePreview } from "./image-preview";
import { PdfPreview } from "./pdf-preview";

const FILE_NOT_FOUND = { FILE_NOT_FOUND: "Arquivo não encontrado. A lista pode estar desatualizada." };

const DOWNLOAD_WARNING =
  "Baixar o arquivo enviado pelo cliente?\n\nArquivos de terceiros podem conter conteúdo malicioso. " +
  "Prefira a visualização e só abra fora do sistema se confiar no remetente.";

interface DocumentPreviewDialogProps {
  requestId: string;
  file: RentalRequestFile;
  onClose: () => void;
}

export function DocumentPreviewDialog({ requestId, file, onClose }: DocumentPreviewDialogProps) {
  const kind = previewKind(file.mimeType);
  const { data, error } = useApiResource(`${requestId}/${file.id}`, () =>
    adminApi.getFileUrl(requestId, file.id, "inline"),
  );
  const [downloading, setDownloading] = useState(false);

  async function download() {
    if (!window.confirm(DOWNLOAD_WARNING)) return;
    setDownloading(true);
    try {
      // URL com attachment: o navegador baixa sem sair da pagina
      const { url } = await adminApi.getFileUrl(requestId, file.id, "attachment");
      const link = document.createElement("a");
      link.href = url;
      link.rel = "noopener noreferrer";
      link.click();
    } catch (err) {
      toast.error(errorMessage(err, FILE_NOT_FOUND));
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Dialog
      open
      size="viewer"
      onClose={onClose}
      title={
        <>
          {file.originalName}{" "}
          <span className="font-normal text-ink-muted">· {formatBytes(file.size)}</span>
        </>
      }
      footer={
        <>
          <p className="mr-auto flex items-center gap-1.5 text-xs text-ink-muted">
            <ShieldAlert className="size-3.5" aria-hidden /> Visualização segura: o arquivo não é baixado.
          </p>
          <Button variant="outline" loading={downloading} onClick={download}>
            {!downloading && <Download aria-hidden />} Baixar
          </Button>
          <Button onClick={onClose}>Fechar</Button>
        </>
      }
    >
      {error ? (
        <div className="p-4">
          <Alert tone="error">{errorMessage(error, FILE_NOT_FOUND)}</Alert>
        </div>
      ) : !data ? (
        <div className="grid h-full place-items-center">
          <Spinner label="Preparando a visualização" />
        </div>
      ) : kind === "pdf" ? (
        <PdfPreview url={data.url} />
      ) : kind === "image" ? (
        <ImagePreview url={data.url} alt={file.originalName} />
      ) : (
        <div className="p-4">
          <Alert>Este tipo de arquivo não tem visualização.</Alert>
        </div>
      )}
    </Dialog>
  );
}
