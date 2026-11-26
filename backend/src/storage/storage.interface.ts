// interface TS nao existe em runtime: a injecao usa este token
export const STORAGE = Symbol('STORAGE');

export interface PutObjectInput {
  key: string;
  body: Buffer;
  contentType: string;
}

// inline: o navegador exibe (preview); attachment: forca o download
export const DISPOSITIONS = ['inline', 'attachment'] as const;
export type Disposition = (typeof DISPOSITIONS)[number];

export interface SignedDownloadOptions {
  filename: string;
  contentType: string;
  expiresInSeconds: number;
  disposition: Disposition;
}

export interface Storage {
  put(input: PutObjectInput): Promise<void>;
  delete(key: string): Promise<void>;
  getSignedDownloadUrl(
    key: string,
    options: SignedDownloadOptions,
  ): Promise<string>;
}
