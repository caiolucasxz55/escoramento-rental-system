"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { SEARCH_LENGTH } from "@/lib/list-query";

const DEBOUNCE_MS = 350;

interface SearchBoxProps {
  // termo que esta na URL
  value?: string;
  onSearch: (term: string | undefined) => void;
}

// busca enquanto digita (com espera) e na hora com Enter; 1 caractere so nao dispara
export function SearchBox({ value, onSearch }: SearchBoxProps) {
  const [text, setText] = useState(value ?? "");
  const [synced, setSynced] = useState(value);

  // URL mudou por fora (limpar filtros, voltar no navegador): o campo acompanha
  if (value !== synced) {
    setSynced(value);
    if (text.trim() !== (value ?? "")) setText(value ?? "");
  }

  const term = text.trim();
  const ready = term.length === 0 || term.length >= SEARCH_LENGTH.min;

  useEffect(() => {
    if (!ready || term === (value ?? "")) return;
    const timer = setTimeout(() => onSearch(term || undefined), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [term, ready, value, onSearch]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (ready) onSearch(term || undefined);
  }

  return (
    <form role="search" onSubmit={handleSubmit} className="relative w-full sm:max-w-sm">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted" aria-hidden />
      <Input
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={SEARCH_LENGTH.max}
        enterKeyHint="search"
        placeholder="Buscar por nome, e-mail ou telefone"
        aria-label="Buscar por nome, e-mail ou telefone"
        className="pr-10 pl-9 [&::-webkit-search-cancel-button]:hidden"
      />
      {text && (
        <button
          type="button"
          onClick={() => {
            setText("");
            onSearch(undefined);
          }}
          aria-label="Limpar busca"
          className="absolute top-0 right-0 flex size-10 items-center justify-center rounded-r-lg text-ink-muted hover:text-ink"
        >
          <X className="size-4" aria-hidden />
        </button>
      )}
    </form>
  );
}
