import { Module } from '@nestjs/common';
import { S3Storage } from './s3.storage';
import { STORAGE } from './storage.interface';

// testes trocam por InMemoryStorage com overrideProvider(STORAGE)
@Module({
  providers: [{ provide: STORAGE, useClass: S3Storage }],
  exports: [STORAGE],
})
export class StorageModule {}
