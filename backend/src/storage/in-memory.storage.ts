import { Injectable } from '@nestjs/common';
import {
  PutObjectInput,
  SignedDownloadOptions,
  Storage,
} from './storage.interface';

// usado nos testes no lugar do S3
@Injectable()
export class InMemoryStorage implements Storage {
  readonly objects = new Map<string, { body: Buffer; contentType: string }>();

  put({ key, body, contentType }: PutObjectInput): Promise<void> {
    this.objects.set(key, { body, contentType });
    return Promise.resolve();
  }

  delete(key: string): Promise<void> {
    this.objects.delete(key);
    return Promise.resolve();
  }

  getSignedDownloadUrl(
    key: string,
    { expiresInSeconds }: SignedDownloadOptions,
  ): Promise<string> {
    return Promise.resolve(
      `memory://${key}?expires=${String(expiresInSeconds)}`,
    );
  }
}
