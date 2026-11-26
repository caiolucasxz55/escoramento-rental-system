"use client";

import { useState } from "react";
import { FolderOpen } from "lucide-react";

import { Card, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { RentalRequestDetail, RentalRequestFile } from "@/types";

import { DocumentPreviewDialog } from "./document-preview-dialog";
import { FileRow } from "./file-row";

// admin so consulta os documentos enviados pelo cliente, por preview
export function FilesPanel({ request }: { request: RentalRequestDetail }) {
  const [previewing, setPreviewing] = useState<RentalRequestFile | null>(null);

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
            <FileRow key={file.id} file={file} onPreview={() => setPreviewing(file)} />
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
      {previewing && (
        <DocumentPreviewDialog
          requestId={request.id}
          file={previewing}
          onClose={() => setPreviewing(null)}
        />
      )}
    </Card>
  );
}
