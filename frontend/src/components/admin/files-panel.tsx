"use client";

import { useRef, useState } from "react";
import { FolderOpen, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { adminApi } from "@/lib/api";
import { errorMessage } from "@/lib/error-messages";
import { ACCEPT_ATTRIBUTE, MAX_FILES, validateFiles } from "@/lib/file-rules";
import { isFinal } from "@/lib/rental-request-status";
import type { RentalRequestDetail, RentalRequestFile } from "@/types";

import { FileRow } from "./file-row";

interface FilesPanelProps {
  request: RentalRequestDetail;
  onChanged: (updated: RentalRequestDetail) => void;
  onRemoved: (fileId: string) => void;
}

const FILE_NOT_FOUND = { FILE_NOT_FOUND: "Arquivo não encontrado. A lista pode estar desatualizada." };

export function FilesPanel({ request, onChanged, onRemoved }: FilesPanelProps) {
  const [busy, setBusy] = useState(false);
  const addInput = useRef<HTMLInputElement>(null);
  const editable = !isFinal(request.status);
  const canAdd = editable && request.files.length < MAX_FILES;

  async function run(action: () => Promise<void>) {
    setBusy(true);
    try {
      await action();
    } catch (err) {
      toast.error(errorMessage(err, FILE_NOT_FOUND));
    } finally {
      setBusy(false);
    }
  }

  // aba aberta no clique (antes do await) para o navegador nao tratar como popup
  function open(file: RentalRequestFile) {
    const tab = window.open("about:blank", "_blank");
    void run(async () => {
      try {
        const { url } = await adminApi.getFileUrl(request.id, file.id);
        if (tab) {
          tab.opener = null;
          tab.location.href = url;
        }
      } catch (err) {
        tab?.close();
        throw err;
      }
    });
  }

  function add(selected: FileList | null) {
    const files = Array.from(selected ?? []);
    const problem = validateFiles(files, request.files.length);
    if (problem) return toast.error(problem);
    void run(async () => {
      onChanged(await adminApi.addFiles(request.id, files));
      toast.success(files.length > 1 ? "Arquivos adicionados" : "Arquivo adicionado");
    });
  }

  function replace(file: RentalRequestFile, replacement: File) {
    const problem = validateFiles([replacement]);
    if (problem) return toast.error(problem);
    void run(async () => {
      onChanged(await adminApi.replaceFile(request.id, file.id, replacement));
      toast.success("Arquivo substituído");
    });
  }

  function remove(file: RentalRequestFile) {
    if (!window.confirm(`Remover "${file.originalName}"? O arquivo é apagado do armazenamento.`)) return;
    void run(async () => {
      await adminApi.removeFile(request.id, file.id);
      onRemoved(file.id);
      toast.success("Arquivo removido");
    });
  }

  return (
    <Card className="p-0 sm:p-0">
      <div className="flex items-center justify-between gap-3 p-5 sm:p-6">
        <CardTitle>
          Documentos{" "}
          <span className="font-normal text-ink-muted">
            ({request.files.length}/{MAX_FILES})
          </span>
        </CardTitle>
        {editable && (
          <>
            <input
              ref={addInput}
              type="file"
              multiple
              accept={ACCEPT_ATTRIBUTE}
              className="sr-only"
              aria-label="Adicionar arquivos"
              onChange={(e) => {
                add(e.target.files);
                e.target.value = "";
              }}
            />
            <Button
              variant="outline"
              size="sm"
              disabled={!canAdd || busy}
              onClick={() => addInput.current?.click()}
            >
              <Upload aria-hidden /> Adicionar
            </Button>
          </>
        )}
      </div>
      {request.files.length > 0 ? (
        <ul className="divide-y divide-line border-t border-line">
          {request.files.map((file) => (
            <FileRow
              key={file.id}
              file={file}
              editable={editable}
              busy={busy}
              onOpen={() => open(file)}
              onReplace={(replacement) => replace(file, replacement)}
              onRemove={() => remove(file)}
            />
          ))}
        </ul>
      ) : (
        <EmptyState icon={FolderOpen} title="Nenhum documento anexado" className="border-t border-line py-8" />
      )}
    </Card>
  );
}
