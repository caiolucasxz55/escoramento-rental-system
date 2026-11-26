"use client";

import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface StatusLookupFormProps {
  onSubmit: (id: string, token: string) => void;
  loading: boolean;
}

export function StatusLookupForm({ onSubmit, loading }: StatusLookupFormProps) {
  const [id, setId] = useState("");
  const [token, setToken] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(id.trim(), token.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Identificador" htmlFor="lookup-id" required>
        <Input
          id="lookup-id"
          value={id}
          onChange={(e) => setId(e.target.value)}
          required
          autoComplete="off"
          spellCheck={false}
        />
      </Field>
      <Field label="Token de consulta" htmlFor="lookup-token" required>
        {/* password: nao fica visivel nem no autocomplete do navegador */}
        <Input
          id="lookup-token"
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
          autoComplete="off"
        />
      </Field>
      <Button type="submit" loading={loading}>
        {!loading && <Search aria-hidden />} Consultar
      </Button>
    </form>
  );
}
