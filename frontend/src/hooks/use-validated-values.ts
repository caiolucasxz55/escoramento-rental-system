"use client";

import { useState } from "react";

import { hasErrors, validateRentalRequest, type FieldErrors } from "@/lib/rental-request-validation";
import type { RentalRequestInput } from "@/types";

// valores do formulario + erros por campo; erro some assim que o campo fica valido
export function useValidatedValues(initial: RentalRequestInput | (() => RentalRequestInput)) {
  const [values, setRaw] = useState(initial);
  const [errors, setErrors] = useState<FieldErrors>({});

  function setValues(next: RentalRequestInput) {
    setRaw(next);
    if (hasErrors(errors)) {
      const current = validateRentalRequest(next);
      // so revalida o que ja estava marcado; nao acusa campo que a pessoa ainda nao terminou
      setErrors(Object.fromEntries(Object.keys(errors).flatMap((k) => {
        const key = k as keyof RentalRequestInput;
        return current[key] ? [[key, current[key]]] : [];
      })));
    }
  }

  // true quando pode enviar
  function validate(): boolean {
    const found = validateRentalRequest(values);
    setErrors(found);
    return !hasErrors(found);
  }

  return { values, setValues, errors, validate };
}
