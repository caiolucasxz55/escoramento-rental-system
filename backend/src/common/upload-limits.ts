// limites de upload: usados pelo Multer, pelas regras de arquivo e pelo filtro de erros
export const MAX_FILES_PER_REQUEST = 5;

export const megabytesToBytes = (mb: number): number => mb * 1024 * 1024;
