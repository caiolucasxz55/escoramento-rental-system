"use client";

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { maskPhoneInput } from "@/lib/format";
import type { RentalRequestInput } from "@/types";

const DESCRIPTION_MAX = 2000;

interface RentalRequestFieldsProps {
  values: RentalRequestInput;
  onChange: (values: RentalRequestInput) => void;
  disabled?: boolean;
  idPrefix: string;
}

// os 4 campos da solicitacao; usados na criacao publica e na edicao admin
export function RentalRequestFields({ values, onChange, disabled, idPrefix }: RentalRequestFieldsProps) {
  const set = (key: keyof RentalRequestInput) => (value: string) =>
    onChange({ ...values, [key]: value });
  const id = (key: string) => `${idPrefix}-${key}`;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Nome ou empresa" htmlFor={id("name")} required className="sm:col-span-2">
        <Input
          id={id("name")}
          value={values.name}
          onChange={(e) => set("name")(e.target.value)}
          minLength={2}
          maxLength={120}
          required
          disabled={disabled}
          autoComplete="organization"
        />
      </Field>
      <Field label="E-mail" htmlFor={id("email")} required>
        <Input
          id={id("email")}
          type="email"
          value={values.email}
          onChange={(e) => set("email")(e.target.value)}
          required
          disabled={disabled}
          autoComplete="email"
        />
      </Field>
      <Field label="Telefone" htmlFor={id("phone")} hint="Com DDD. Ex.: (11) 98765-4321" required>
        {/* estado guarda so digitos; a mascara e so visual */}
        <Input
          id={id("phone")}
          type="tel"
          inputMode="numeric"
          value={maskPhoneInput(values.phone)}
          onChange={(e) => set("phone")(e.target.value.replace(/\D/g, "").slice(0, 13))}
          required
          disabled={disabled}
          autoComplete="tel"
        />
      </Field>
      <Field
        label="Descrição do pedido"
        htmlFor={id("description")}
        hint={`Itens, quantidades, prazo e endereço da obra · ${values.description.length}/${DESCRIPTION_MAX}`}
        required
        className="sm:col-span-2"
      >
        <Textarea
          id={id("description")}
          value={values.description}
          onChange={(e) => set("description")(e.target.value)}
          minLength={10}
          maxLength={DESCRIPTION_MAX}
          required
          disabled={disabled}
        />
      </Field>
    </div>
  );
}
