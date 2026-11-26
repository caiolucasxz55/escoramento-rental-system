import 'reflect-metadata'; // necessario fora do Nest (testes)
import { plainToInstance, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  Min,
  validateSync,
} from 'class-validator';

const toBoolean = ({ value }: { value: unknown }) =>
  value === true || value === 'true';

export class EnvironmentVariables {
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 3001;

  @IsUrl({ require_tld: false })
  FRONTEND_URL: string = 'http://localhost:3000';

  @IsString()
  @IsNotEmpty()
  MONGODB_URI: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @Matches(/^\d+[smhd]?$/, { message: 'JWT_EXPIRES_IN ex.: 3600, 15m, 1h' })
  JWT_EXPIRES_IN: string = '1h';

  @IsEmail({ require_tld: false })
  ADMIN_EMAIL: string;

  // gerado por `npm run hash-password`
  @Matches(/^\$2[aby]\$\d{2}\$.{53}$/, {
    message: 'ADMIN_PASSWORD_HASH deve ser um hash bcrypt',
  })
  ADMIN_PASSWORD_HASH: string;

  @IsString()
  @IsNotEmpty()
  S3_BUCKET: string;

  @IsString()
  @IsNotEmpty()
  S3_REGION: string;

  // vazios na AWS real
  @IsOptional()
  @IsUrl({ require_tld: false })
  S3_ENDPOINT?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  S3_PUBLIC_ENDPOINT?: string;

  @Transform(toBoolean)
  @IsBoolean()
  S3_FORCE_PATH_STYLE: boolean = false;

  @IsString()
  @IsNotEmpty()
  S3_ACCESS_KEY_ID: string;

  @IsString()
  @IsNotEmpty()
  S3_SECRET_ACCESS_KEY: string;

  @IsInt()
  @Min(1)
  SIGNED_URL_TTL_SECONDS: number = 300;

  @IsInt()
  @Min(1)
  MAX_FILE_SIZE_MB: number = 10;

  // soma de todos os arquivos guardados; vazio = sem cota
  @IsOptional()
  @IsInt()
  @Min(1)
  STORAGE_QUOTA_MB?: number;
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  // string vazia conta como ausente (ex.: S3_ENDPOINT= na AWS)
  const cleaned = Object.fromEntries(
    Object.entries(config).filter(([, value]) => value !== ''),
  );

  const env = plainToInstance(EnvironmentVariables, cleaned, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(env, { skipMissingProperties: false });

  if (errors.length > 0) {
    const detail = errors
      .map(
        (e) =>
          `  - ${e.property}: ${Object.values(e.constraints ?? {}).join('; ')}`,
      )
      .join('\n');
    throw new Error(`Variaveis de ambiente invalidas:\n${detail}`);
  }

  return env;
}
