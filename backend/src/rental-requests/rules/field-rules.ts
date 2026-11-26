// regras dos campos: o DTO valida a entrada e o schema repete como segunda barreira
export const NAME_LENGTH = { min: 2, max: 120 } as const;
export const DESCRIPTION_LENGTH = { min: 10, max: 2000 } as const;
// so digitos: DDD + numero, com ou sem codigo do pais
export const PHONE_PATTERN = /^\d{10,13}$/;
