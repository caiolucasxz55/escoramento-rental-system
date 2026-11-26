"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// borrada ate o admin pedir: conteudo improprio nao aparece sem aviso
export function ImagePreview({ url, alt }: { url: string; alt: string }) {
  const [revealed, setRevealed] = useState(false);

  return (
    // ocupa o corpo inteiro do modal: o aviso fica centralizado mesmo com imagem minuscula
    <div className="relative flex h-full flex-col items-center justify-center gap-3 p-4">
      {/* URL assinada e temporaria do storage: next/image exigiria liberar o host e faria proxy */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={alt}
        referrerPolicy="no-referrer"
        draggable={false}
        className={cn(
          // min-w: imagem muito pequena (icone, 1x1) nao vira um ponto perdido
          "max-h-[60vh] min-w-48 max-w-full rounded-md bg-white object-contain shadow-sm transition-[filter] duration-300",
          !revealed && "blur-2xl",
        )}
      />
      {revealed ? (
        <Button variant="outline" size="sm" onClick={() => setRevealed(false)}>
          <EyeOff aria-hidden /> Ocultar
        </Button>
      ) : (
        <div className="absolute inset-0 grid place-items-center">
          <div className="rounded-lg bg-surface/95 p-4 text-center shadow-md">
            <p className="text-sm font-medium text-ink">Imagem oculta por segurança</p>
            <p className="mt-0.5 text-xs text-ink-muted">Enviada pelo cliente; confira antes de exibir.</p>
            <Button size="sm" className="mt-3" onClick={() => setRevealed(true)}>
              <Eye aria-hidden /> Mostrar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
