// em common: o filtro de erros usa, e ele nao pode depender de rental-requests/
export const MAX_FILES_PER_REQUEST = 5;

export const megabytesToBytes = (mb: number): number => mb * 1024 * 1024;
