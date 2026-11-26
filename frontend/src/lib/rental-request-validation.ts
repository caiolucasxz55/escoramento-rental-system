import type { RentalRequestInput } from "@/types";

export type FieldErrors = Partial<Record<keyof RentalRequestInput, string>>;

// mesmas regras e textos do DTO do backend, que tambem corta os espacos antes de validar
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RULES: Record<keyof RentalRequestInput, (value: string) => string | null> = {
  name: (v) => (v.trim().length < 2 || v.trim().length > 120 ? "O nome deve ter entre 2 e 120 caracteres." : null),
  email: (v) => (EMAIL.test(v.trim()) ? null : "Informe um e-mail válido."),
  phone: (v) => (/^\d{10,13}$/.test(v.replace(/\D/g, "")) ? null : "O telefone deve ter de 10 a 13 dígitos, com DDD."),
  description: (v) =>
    v.trim().length < 10 || v.trim().length > 2000 ? "A descrição deve ter entre 10 e 2000 caracteres." : null,
};

export function validateRentalRequest(values: RentalRequestInput): FieldErrors {
  const errors: FieldErrors = {};
  for (const key of Object.keys(RULES) as (keyof RentalRequestInput)[]) {
    const problem = RULES[key](values[key]);
    if (problem) errors[key] = problem;
  }
  return errors;
}

export const hasErrors = (errors: FieldErrors) => Object.keys(errors).length > 0;
