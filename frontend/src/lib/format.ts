const dateTime = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

export function formatDateTime(iso: string): string {
  return dateTime.format(new Date(iso));
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// mascara enquanto digita; acima de 11 digitos (DDI) mostra so os numeros
export function maskPhoneInput(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 13);
  if (d.length > 11) return d;
  if (d.length <= 2) return d.length ? `(${d}` : "";
  const local = d.slice(2);
  const split = d.length === 11 ? 5 : 4;
  if (local.length <= split) return `(${d.slice(0, 2)}) ${local}`;
  return `(${d.slice(0, 2)}) ${local.slice(0, split)}-${local.slice(split)}`;
}

// link discavel: sem DDI assume Brasil (+55)
export function phoneHref(digits: string): string {
  return `tel:+${digits.length > 11 ? digits : `55${digits}`}`;
}

// "11987654321" -> "(11) 98765-4321"; com DDI mantem os digitos
export function formatPhone(digits: string): string {
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return digits;
}
