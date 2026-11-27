export const SEARCH_LENGTH = { min: 2, max: 100 } as const;

// cada letra casa com as variantes acentuadas, em minuscula e maiuscula
const VARIANTS: Record<string, string> = {
  a: 'aáàâãäAÁÀÂÃÄ',
  e: 'eéèêëEÉÈÊË',
  i: 'iíìîïIÍÌÎÏ',
  o: 'oóòôõöOÓÒÔÕÖ',
  u: 'uúùûüUÚÙÛÜ',
  c: 'cçCÇ',
  n: 'nñNÑ',
};

// trecho digitado vira regex literal: o que e especial e escapado ("(.*" nao casa tudo)
export function searchPattern(term: string): string {
  return term
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[.*+?^${}()|[\]\\/-]/g, '\\$&')
    .replace(/[aeioucn]/g, (letter) => `[${VARIANTS[letter]}]`);
}

// telefone e guardado so com digitos: "(11) 98765" busca por "1198765"
export function searchDigits(term: string): string | null {
  const digits = term.replace(/\D/g, '');
  return digits.length >= 4 ? digits : null;
}
