import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '../config/env.validation';
import { attachmentDisposition } from './content-disposition';
import {
  PutObjectInput,
  SignedDownloadOptions,
  Storage,
} from './storage.interface';

@Injectable()
export class S3Storage implements Storage {
  private readonly bucket: string;
  private readonly client: S3Client;
  // assina com o host publico: o navegador nao resolve o host interno (minio)
  private readonly signer: S3Client;

  constructor(config: ConfigService<EnvironmentVariables, true>) {
    const get = <K extends keyof EnvironmentVariables>(key: K) =>
      config.get(key, { infer: true });

    this.bucket = get('S3_BUCKET');
    const base = {
      region: get('S3_REGION'),
      forcePathStyle: get('S3_FORCE_PATH_STYLE'),
      credentials: {
        accessKeyId: get('S3_ACCESS_KEY_ID'),
        secretAccessKey: get('S3_SECRET_ACCESS_KEY'),
      },
    };
    const endpoint = get('S3_ENDPOINT');
    this.client = new S3Client({ ...base, endpoint });
    this.signer = new S3Client({
      ...base,
      endpoint: get('S3_PUBLIC_ENDPOINT') ?? endpoint,
    });
  }

  async put({ key, body, contentType }: PutObjectInput): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  getSignedDownloadUrl(
    key: string,
    { filename, contentType, expiresInSeconds }: SignedDownloadOptions,
  ): Promise<string> {
    return getSignedUrl(
      this.signer,
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ResponseContentDisposition: attachmentDisposition(filename),
        ResponseContentType: contentType,
      }),
      { expiresIn: expiresInSeconds },
    );
  }
}
