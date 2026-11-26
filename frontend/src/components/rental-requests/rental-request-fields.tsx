"use client";

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { maskPhoneInput } from "@/lib/format";
import type { FieldErrors } from "@/lib/rental-request-validation";
import type { RentalRequestInput } from "@/types";

const DESCRIPTION_MAX = 2000;

interface RentalRequestFieldsProps {
  values: RentalRequestInput;
  onChange: (values: RentalRequestInput) => void;
  errors?: FieldErrors;
  disabled?: boolean;
  idPrefix: string;
}

// os 4 campos da solicitacao; usados na criacao publica e na edicao admin
export function RentalRequestFields({ values, onChange, errors = {}, disabled, idPrefix }: RentalRequestFieldsProps) {
  const set = (key: keyof RentalRequestInput) => (value: string) =>
    onChange({ ...values, [key]: value });
  const id = (key: string) => `${idPrefix}-${key}`;
  // liga o controle a mensagem de erro do Field para leitores de tela
  const a11y = (key: keyof RentalRequestInput) =>
    errors[key] ? { "aria-invalid": true, "aria-describedby": `${id(key)}-message` } : {};

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Nome ou empresa" htmlFor={id("name")} error={errors.name} required className="sm:col-span-2">
        <Input
          id={id("name")}
          {...a11y("name")}
          value={values.name}
          onChange={(e) => set("name")(e.target.value)}
          maxLength={120}
          required
          disabled={disabled}
          autoComplete="organization"
        />
      </Field>
      <Field label="E-mail" htmlFor={id("email")} error={errors.email} required>
        <Input
          id={id("email")}
          {...a11y("email")}
          type="email"
          value={values.email}
          onChange={(e) => set("email")(e.target.value)}
          required
          disabled={disabled}
          autoComplete="email"
        />
      </Field>
      <Field label="Telefone" htmlFor={id("phone")} error={errors.phone} hint="Com DDD. Ex.: (11) 98765-4321" required>
        {/* estado guarda so digitos; a mascara e so visual */}
        <Input
          id={id("phone")}
          {...a11y("phone")}
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
        htmlFor={id("description")} error={errors.description}
        hint={`Itens, quantidades, prazo e endereço da obra · ${values.description.length}/${DESCRIPTION_MAX}`}
        required
        className="sm:col-span-2"
      >
        <Textarea
          id={id("description")}
          {...a11y("description")}
          value={values.description}
          onChange={(e) => set("description")(e.target.value)}
          maxLength={DESCRIPTION_MAX}
          required
          disabled={disabled}
        />
      </Field>
    </div>
  );
}
