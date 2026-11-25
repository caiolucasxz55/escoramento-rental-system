// Os decorators do class-transformer leem metadados de tipo; o Nest carrega
// isso sozinho, mas a validacao tambem roda fora dele (testes unitarios).
import 'reflect-metadata';
import { plainToInstance, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  validateSync,
} from 'class-validator';

const toBoolean = ({ value }: { value: unknown }) =>
  value === true || value === 'true';

/**
 * Variaveis de ambiente do backend. A API nao sobe se faltar alguma
 * obrigatoria: falhar na subida e melhor que falhar na primeira requisicao.
 */
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

  @IsString()
  @IsNotEmpty()
  JWT_EXPIRES_IN: string = '1h';

  // Passam a ser obrigatorias quando o login do admin existir.
  @IsOptional()
  @IsString()
  ADMIN_EMAIL?: string;

  @IsOptional()
  @IsString()
  ADMIN_PASSWORD_HASH?: string;

  @IsString()
  @IsNotEmpty()
  S3_BUCKET: string;

  @IsString()
  @IsNotEmpty()
  S3_REGION: string;

  // Vazios na AWS real; preenchidos com o MinIO local.
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
}

/**
 * Usada pelo ConfigModule. String vazia conta como ausente, para que
 * `S3_ENDPOINT=` no .env signifique "nao definido" (caso da AWS real).
 */
export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
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
