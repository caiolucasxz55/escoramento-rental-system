# Deploy: passo a passo

Roteiro para recriar o ambiente de produção do zero. Visão geral e decisões no [README principal](../../README.md#deploy-produção).

## Passos únicos

1. **Atlas:** crie um cluster M0 na AWS, na mesma região do Lightsail, um usuário só com `readWrite` no banco `escoramento` e libere `0.0.0.0/0` em *Network Access* (o Container Service não tem IP de saída fixo; a proteção fica na senha forte do usuário).
2. **Serviço no Lightsail** (uma vez):
   ```bash
   aws lightsail create-container-service --region us-east-2 \
     --service-name escoramento-api --power nano --scale 1
   ```
3. **Usuário de deploy:** no IAM, crie um usuário (ex.: `github-actions-deploy`), anexe a ele uma política com o conteúdo de [`lightsail-deploy-policy.json`](lightsail-deploy-policy.json) (*Add permissions → Create inline policy → JSON*) e gere uma chave de acesso (*Security credentials → Create access key → Third-party service*).
4. **GitHub → Settings → Secrets and variables → Actions:**

   | Tipo | Nome | Valor |
   | --- | --- | --- |
   | Secret | `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | chave do usuário de deploy do passo 3 |
   | Secret | `MONGODB_URI` | string de conexão do Atlas (com `/escoramento` antes do `?`) |
   | Secret | `JWT_SECRET` | valor aleatório longo |
   | Secret | `ADMIN_PASSWORD_HASH` | saída do `npm run hash-password` |
   | Secret | `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | chave de um usuário IAM só com `s3:PutObject`, `s3:GetObject` e `s3:DeleteObject` em `arn:aws:s3:::SEU_BUCKET/rental-requests/*` |
   | Variable | `AWS_REGION` | região do bucket e do serviço (ex.: `us-east-2`) |
   | Variable | `S3_BUCKET` | nome do bucket (só o nome, não o ARN) |
   | Variable | `ADMIN_EMAIL` | e-mail do admin |
   | Variable | `LIGHTSAIL_SERVICE` | nome do serviço do passo 2 (padrão: `escoramento-api`) |
   | Variable (opcional) | `FRONTEND_URL` | padrão: a URL da Vercel |

5. **Bucket:** acrescente a URL da Vercel em `AllowedOrigins` na regra de CORS (ver "Configurando S3" no README principal).
6. **Primeiro deploy:** push na `main` (ou *Run workflow* em Actions). O último passo imprime a URL da API e o resultado do health.
7. **Vercel → Settings → Environment Variables** (ambiente *Production*): `NEXT_PUBLIC_API_URL` = URL do passo 6 (termina em `/api`); para o avaliador entrar no admin, `NEXT_PUBLIC_DEMO_ADMIN_EMAIL` e `NEXT_PUBLIC_DEMO_ADMIN_PASSWORD` com uma senha só de demonstração. Depois, *Redeploy* sem o cache do build (as `NEXT_PUBLIC_*` entram no build).

## Problemas comuns

| Sintoma | Causa | Correção |
| --- | --- | --- |
| Deploy para em "Confere secrets e variables" | secret ou variable faltando, ou chave colada com espaço | o erro diz o nome; corrija em *Secrets and variables → Actions* |
| `AccessDeniedException ... lightsail:CreateContainerServiceRegistryLogin` | a política do passo 3 não está anexada ao usuário | anexe a política e use *Re-run failed jobs* |
| Site chama `localhost:3001` | build da Vercel sem `NEXT_PUBLIC_API_URL` | crie a variável **sem** a opção *Sensitive* (o valor é público) e faça *Redeploy* |
| Preview de PDF não abre em produção | origem do CORS do bucket com `/` no fim | use `https://...vercel.app`, sem barra: o navegador compara o texto exato |
| Health do deploy falha | o Atlas não aceita o IP do serviço | libere `0.0.0.0/0` em *Network Access* |
