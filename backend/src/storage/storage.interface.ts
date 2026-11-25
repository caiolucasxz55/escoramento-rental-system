// interface TS nao existe em runtime: a injecao usa este token
export const STORAGE = Symbol('STORAGE');

export interface PutObjectInput {
  key: string;
  body: Buffer;
  contentType: string;
}

export interface SignedDownloadOptions {
  filename: string;
  contentType: string;
  expiresInSeconds: number;
}

export interface Storage {
  put(input: PutObjectInput): Promise<void>;
  delete(key: string): Promise<void>;
  getSignedDownloadUrl(
    key: string,
    options: SignedDownloadOptions,
  ): Promise<string>;
}
