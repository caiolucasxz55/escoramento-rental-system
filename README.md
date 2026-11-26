# Escoramento · Solicitações de locação

Módulo full stack para clientes solicitarem a locação de escoramento (com até 5 documentos) e acompanharem o status, e para o admin analisar, editar, mudar status e gerenciar os documentos. O foco está nas regras de negócio no backend, no acesso seguro aos documentos e nos testes.

**Stack:** NestJS 12 + TypeScript · MongoDB (Mongoose) · S3 (AWS SDK v3; MinIO no ambiente local) · Next.js 16 (App Router) + Tailwind · pdf.js · Jest, Supertest e mongodb-memory-server · Vitest · Swagger.

## Pré-requisitos

- **Node.js 22.12 ou mais novo** (desenvolvido e testado com 22.13.1)
- npm 10
- Docker e Docker Compose

## Como executar

```bash
# 1. Infraestrutura: MongoDB (27017) e MinIO (9000/9001), com o bucket privado criado automaticamente
docker compose up -d

# 2. Backend
cd backend
cp .env.example .env
npm install
npm run hash-password -- "admin123"   # cole a saída em ADMIN_PASSWORD_HASH no backend/.env
npm run seed                          # opcional: 30 solicitações fictícias para a listagem
npm run start:dev

# 3. Frontend (outro terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

| O quê | URL |
| --- | --- |
| API | http://localhost:3001/api |
| Swagger | http://localhost:3001/api/docs |
| Frontend (cliente) | http://localhost:3000 |
| Frontend (admin) | http://localhost:3000/admin |
| Console do MinIO | http://localhost:9001 (`minioadmin` / `minioadmin`) |

O `npm run seed` imprime um identificador e um token prontos para testar a consulta pública em `/status`.

## Como testar

```bash
cd backend
npm test            # unitários (regras, token, validação de arquivo, filtro de erros, guards...)
npm run test:e2e    # integração: Supertest + mongodb-memory-server + storage em memória, sem Docker
cd ../frontend
npm test            # lógica pura do frontend (Vitest)
```

A primeira execução do `test:e2e` baixa o binário do MongoDB uma vez (fica em cache).

**Admin de demonstração:** `admin@escoramento.local` com a senha usada no `npm run hash-password` (no exemplo acima, `admin123`). Com o `frontend/.env.example` copiado, a tela de login mostra essas credenciais e um botão para preencher.

## Variáveis de ambiente

Backend (`backend/.env.example`):

| Variável | Exemplo | Uso |
| --- | --- | --- |
| `PORT` | `3001` | Porta da API |
| `FRONTEND_URL` | `http://localhost:3000` | Única origem liberada no CORS |
| `MONGODB_URI` | `mongodb://localhost:27017/escoramento` | Conexão com o banco |
| `JWT_SECRET` | `troque-por-um-valor-aleatorio` | Assinatura do JWT do admin |
| `JWT_EXPIRES_IN` | `1h` | Validade do JWT |
| `ADMIN_EMAIL` | `admin@escoramento.local` | Login do admin |
| `ADMIN_PASSWORD_HASH` | saída de `npm run hash-password` | Hash bcrypt da senha do admin |
| `S3_BUCKET` | `escoramento-docs` | Bucket dos documentos |
| `S3_REGION` | `us-east-1` | Região (o MinIO aceita qualquer uma) |
| `S3_ENDPOINT` | `http://localhost:9000` | Endpoint do S3; vazio na AWS |
| `S3_PUBLIC_ENDPOINT` | `http://localhost:9000` | Host usado nas URLs assinadas; vazio na AWS |
| `S3_FORCE_PATH_STYLE` | `true` | Necessário no MinIO; `false` na AWS |
| `S3_ACCESS_KEY_ID` | `minioadmin` | Credencial do storage |
| `S3_SECRET_ACCESS_KEY` | `minioadmin` | Credencial do storage |
| `SIGNED_URL_TTL_SECONDS` | `300` | Validade da URL de download |
| `MAX_FILE_SIZE_MB` | `10` | Limite por arquivo |

Frontend (`frontend/.env.example`):

| Variável | Exemplo | Uso |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api` | Base da API |
| `NEXT_PUBLIC_DEMO_ADMIN_EMAIL` | `admin@escoramento.local` | Opcional: e-mail mostrado na tela de login (demo) |
| `NEXT_PUBLIC_DEMO_ADMIN_PASSWORD` | `admin123` | Opcional: senha mostrada na tela de login (demo); vazia em produção |

A API não sobe se faltar uma variável obrigatória: o erro diz qual.

## Configurando S3

**Local (padrão):** o `docker compose up -d` sobe o MinIO e um container `minio-init` que cria o bucket `escoramento-docs` sem acesso anônimo. Nada a configurar além do `.env.example`.

**AWS real:** crie o bucket com *Block Public Access* ligado e um usuário IAM só com `s3:PutObject`, `s3:GetObject` e `s3:DeleteObject` em `arn:aws:s3:::SEU_BUCKET/rental-requests/*`. Preencha `S3_BUCKET`, `S3_REGION` e as credenciais, deixe `S3_ENDPOINT` e `S3_PUBLIC_ENDPOINT` vazios e use `S3_FORCE_PATH_STYLE=false`. Nenhuma linha de código muda.

O preview de PDF baixa o arquivo pelo navegador (pdf.js), então o bucket precisa de uma regra de CORS liberando `GET` para a origem do frontend (o MinIO local já libera):

```json
[{ "AllowedOrigins": ["https://seu-frontend"], "AllowedMethods": ["GET"], "AllowedHeaders": ["Range"], "ExposeHeaders": ["Content-Range", "Accept-Ranges"] }]
```

## Endpoints

Documentação interativa em **`/api/docs`** (Swagger) e exemplos prontos em [`backend/requests.http`](backend/requests.http), com arquivos de exemplo em `backend/samples/`.

| Método | Rota | Acesso | Sucesso |
| --- | --- | --- | --- |
| POST | `/api/public/requests` | Público (multipart, até 5 arquivos) | 201 `{ id, token, status }` |
| GET | `/api/public/requests/:id/status` | Header `X-Consultation-Token` | 200 |
| POST | `/api/auth/login` | Público | 200 `{ accessToken, expiresIn }` |
| GET | `/api/admin/requests?page=&limit=&status=` | JWT | 200 `{ data, meta }` |
| GET | `/api/admin/requests/:id` | JWT | 200 |
| PATCH | `/api/admin/requests/:id` | JWT | 200 |
| PATCH | `/api/admin/requests/:id/status` | JWT | 200 |
| POST | `/api/admin/requests/:id/files` | JWT (multipart) | 201 |
| PUT | `/api/admin/requests/:id/files/:fileId` | JWT (multipart, 1 arquivo) | 200 |
| DELETE | `/api/admin/requests/:id/files/:fileId` | JWT | 204 |
| GET | `/api/admin/requests/:id/files/:fileId/url` | JWT | 200 `{ url, expiresIn }` |
| GET | `/api/health` | Público | 200 |

Todo erro sai no mesmo formato, com um código estável em `error`:

```json
{ "statusCode": 409, "error": "INVALID_STATUS_TRANSITION", "message": "...", "path": "/api/admin/requests/.../status", "timestamp": "..." }
```

## Decisões técnicas

**Arquitetura.** Monorepo com `backend/` (NestJS) e `frontend/` (Next.js). Só o backend fala com o MongoDB e com o S3; o navegador só toca o storage por URL assinada, depois que a API autorizou. No backend, a feature `rental-requests/` é separada por papel (`controllers/`, `services/`, `pipes/`, `mappers/`, `rules/`, `dto/`, `schemas/`):

- **Regras como funções puras** (`rules/status-transitions.ts`, `rules/file-validation.ts`), testadas sem subir o Nest.
- **Dois controllers para o mesmo recurso**: `/public/requests` (sem JWT) e `/admin/requests` (guard no controller inteiro), para nenhuma rota admin ficar sem proteção por esquecimento.
- **Storage atrás de uma interface** com token `STORAGE`: `S3Storage` em produção, `InMemoryStorage` nos testes. É a única abstração do projeto, porque é o único ponto que de fato se troca.
- **Sem camada de repositório**: a correção depende de queries condicionais atômicas, e um repositório genérico esconderia justamente isso.
- **Respostas por mappers** (`toPublicStatus`, `toListItem`, `toDetail`); o `toJSON` do schema é só rede de segurança.

**Modelagem.** Uma coleção `rental_requests` com os metadados dos arquivos embutidos (no máximo 5). Toda alteração é atômica em um documento, sem transação. Índices `{status:1, createdAt:-1}` e `{createdAt:-1}` para a listagem.

**Regras de status com concorrência.** O mapa de transições define os próximos estados; estados finais têm lista vazia. A mudança de status é condicionada ao status lido (`findOneAndUpdate({ _id, status: atual })`): com dois admins ao mesmo tempo, um recebe 200 e o outro 409. O mesmo vale para o limite de 5 arquivos: o `$push` exige que `files.{5-n}` ainda não exista, então dois uploads simultâneos não passam de 5. Os dois casos têm teste de integração, e um teste de mutação (removendo a condição) confirma que os testes falham sem ela.

**Upload.** Passa pelo backend (Multer em memória, 10 MB por arquivo, 5 arquivos). O tipo é decidido pelos primeiros bytes (PDF, PNG, JPEG), nunca pelo nome ou pelo `Content-Type`: um executável renomeado para `.pdf` recebe 415. Usei um pipe próprio (`ParseUploadsPipe`) em vez do `ParseFilePipeBuilder` do Nest porque o validador nativo responde 400 para tipo errado e o contrato pede 415; com um só ponto de validação, a regra não se duplica. A chave no S3 é `rental-requests/{id}/{uuid}.{ext}`; o nome original nunca entra nela.

**Consistência MongoDB × S3.** A regra é: o Mongo nunca aponta para um objeto inexistente. Na criação e na adição, o arquivo vai ao S3 antes do Mongo, e se a escrita no Mongo falha ou não se aplica, os objetos enviados são apagados. Na remoção e na substituição, o Mongo muda primeiro e o objeto antigo é apagado depois; se o S3 falhar aí, sobra um objeto órfão (privado) registrado em log com a chave.

**Segurança.**
- **Token de consulta**: 256 bits aleatórios, exibido uma vez; o banco guarda só o SHA-256 (bcrypt não agrega com token longo e aleatório). Vai no header `X-Consultation-Token`, nunca na URL, e é comparado com `timingSafeEqual`. Token errado e id inexistente devolvem o mesmo 404, para não revelar quais ids existem.
- **Admin**: login com bcrypt e JWT de 1h. A senha é comparada mesmo com e-mail errado, para o tempo de resposta não revelar o e-mail.
- **Documentos**: bucket sem acesso anônimo; acesso só por URL assinada de 5 minutos, com o nome original sanitizado e o tipo detectado no upload. A rota aceita `?disposition=inline` (visualizar) ou `attachment` (padrão, baixar). A URL é gerada com `S3_PUBLIC_ENDPOINT`, porque o navegador não resolve o host interno do MinIO.
- **API**: `ValidationPipe` com `whitelist` e `forbidNonWhitelisted` (campo extra dá 400), ids validados antes de chegar ao Mongo, `helmet`, CORS restrito a `FRONTEND_URL`, rate limit de 10/min por IP no login e na consulta pública, e erro inesperado como 500 genérico sem stack.

**Frontend.** Páginas finas que só renderizam a view de cada feature; primitivas de UI em `components/ui/`; um único cliente HTTP (`lib/api/client.ts`) que injeta o JWT, transforma o erro da API em `ApiError` e encerra a sessão no 401; mensagens escolhidas pelo código de erro, não pelo texto. O JWT fica em `sessionStorage` (trade-off em Limitações). Filtro e página da listagem ficam na query string.

**Documentos na tela do admin: só consulta.** Na interface, o papel do admin é verificar o pedido: ele visualiza os documentos enviados pelo cliente, edita dados e muda o status, mas não adiciona, substitui nem remove arquivos. As rotas de gerenciamento de arquivos (H1) continuam na API, com testes de unidade e integração e demonstráveis pelo Swagger e pelo `requests.http`; deixá-las fora da UI segue a orientação do próprio plano de entrega.

**Visualização segura de documentos.** O admin vê os arquivos num preview dentro do sistema, sem baixá-los: o PDF é desenhado em `<canvas>` pelo pdf.js (o JavaScript do documento nunca executa e nenhum leitor de PDF do sistema é acionado) e a imagem aparece borrada até o admin clicar em "Mostrar". Baixar continua possível, como ação explícita e com aviso. Isso reduz o risco de um PDF malicioso explorar o leitor instalado e de conteúdo impróprio aparecer sem aviso.

**Ambiente.**
- A MinIO deixou de publicar `minio/minio` no Docker Hub; o compose usa `cgr.dev/chainguard/minio`, o mesmo servidor, mantido e com o `mc` embutido.
- Os pacotes do Nest 12 são só ESM; para os testes rodarem no Node 22, o Jest converte `@nestjs/*` para CommonJS só durante o teste (`jest.config.ts`).

## Hipóteses adotadas

| # | Ponto ambíguo | Hipótese adotada |
| --- | --- | --- |
| H1 | Quem envia os arquivos iniciais | O cliente anexa de 0 a 5 arquivos no mesmo envio da criação (multipart). Depois disso, só o admin adiciona, remove ou substitui. |
| H2 | Quem altera o status | Somente o admin. O cliente apenas consulta. |
| H3 | O que a consulta pública retorna | Identificador, status, `createdAt`, `updatedAt` e a quantidade de arquivos. Não retorna e-mail, telefone nem links de documentos. |
| H4 | Edição em estados finais | Dados e arquivos só podem ser alterados em `PENDING` ou `UNDER_REVIEW`. Em `APPROVED`/`CANCELLED` a solicitação fica somente leitura (409). |
| H5 | Exclusão de solicitações | Não existe. O caminho para "descartar" é o status `CANCELLED`. |
| H6 | Token perdido | Não há recuperação; o token é exibido uma única vez. Fica listado como limitação (melhoria: reenvio por e-mail). |
| H7 | Autenticação admin | Um único admin definido por variáveis de ambiente (e-mail + hash bcrypt da senha). Sem cadastro de usuários. |
| H8 | Telefone | Aceita apenas dígitos após normalização, de 10 a 13 caracteres (cobre fixo, celular e DDI 55). |
| H9 | Arquivo substituído | O arquivo antigo é apagado do S3; não há versionamento. |

## Uso de IA

Usei o **Claude Code** (Anthropic) como par de programação durante todo o projeto, a partir de um documento de planejamento que escrevi antes (arquitetura, hipóteses, regras, contratos e plano em fases).

- **Organização do trabalho:** o backlog ficou num gerenciador de tarefas meu, exposto à IA por MCP. Cada tarefa nasceu com critérios de aceite observáveis, e só foi concluída com evidência ligada a um commit ou teste.
- **Implementação:** a IA escreveu o código fase a fase (ambiente, regras puras, API, arquivos e S3, testes de integração, frontend, documentação). Ao fim de cada fase eu revisei o diff e fiz os commits; pedi mudanças de rumo quando discordei, como o rename de `Request` para `RentalRequest` (o nome colidia com a requisição HTTP), a separação de `rental-requests/` em pastas por papel e o padrão de componentes do frontend.
- **Testes e revisão:** os casos de teste saíram das tabelas do planejamento; a IA também fez um code review explícito ao fim de cada fase, que pegou problemas reais (CORS respondendo para qualquer origem, `main.ts` subindo o servidor ao ser importado, um formulário que perdia edição).

**Como validei:**
- testes automatizados: unitários e de integração no backend, e testes da lógica pura no frontend;
- teste de mutação nos controles de concorrência: removi as condições atômicas e confirmei que os testes falham sem elas;
- execução manual contra MongoDB e MinIO reais (upload, download pela URL assinada, expiração da URL, bucket sem acesso anônimo, corrida de requisições paralelas);
- leitura dos diffs antes de cada commit.

## Limitações conhecidas

- **Token sem recuperação:** o token de consulta não pode ser recuperado se for perdido (H6).
- **JWT em `sessionStorage`:** fica exposto a XSS; o mais seguro seria cookie `httpOnly` + `SameSite`. Foi escolhido pela simplicidade e porque o mesmo formato funciona no Swagger, no Supertest e no `requests.http`.
- **Upload pela memória da API:** até 50 MB por requisição.
- **Órfãos no S3:** quando o storage falha depois da escrita no Mongo, o objeto fica órfão (privado) e é só logado; não há job de limpeza.
- **Admin único:** sem cadastro de usuários nem papéis (H7).
- **Sem histórico:** não há registro de mudanças de status nem log de acesso aos documentos.
- **Sem testes de componente no frontend:** só a lógica pura (`lib/`) é testada.
- **Rate limit por instância:** fica em memória; com várias instâncias, cada uma conta separado.
- **Sem busca:** a listagem filtra só por status, sem busca textual.
- **Confirmações nativas:** aprovar e cancelar usam o `confirm` do navegador.
- **Sem antivírus:** o preview seguro e a validação por magic bytes reduzem o risco, mas não detectam um arquivo malicioso; quem baixar e abrir fora do sistema ainda depende do próprio antivírus.
- **Gerenciamento de arquivos só pela API:** adicionar, substituir e remover documentos existem na API (Swagger e `requests.http`), mas não na tela do admin, que é de verificação.
- **Credenciais de demo na tela de login:** existem para facilitar a avaliação e só aparecem com as variáveis `NEXT_PUBLIC_DEMO_ADMIN_*`; em produção ficam vazias.
- **Design visual simples:** prioridade foi o fluxo funcional; a identidade visual se resume à paleta.

## O que eu faria com mais tempo

- **Upload direto ao S3:** URL pré-assinada de `PUT` para um prefixo de quarentena, com validação (magic bytes + antivírus) disparada por evento antes de mover para o prefixo final.
- **Limpeza de órfãos:** job que compara as chaves do bucket com os metadados do Mongo, ou padrão outbox com `PENDING_DELETE`.
- **Paginação por cursor** (`createdAt` + `_id`), que não degrada em páginas altas.
- **Busca** por nome, e-mail e descrição, e filtro por período.
- **Usuários com papéis**, cookie `httpOnly` e refresh token.
- **`statusHistory`** com origem, destino, autor e data, e log de acesso aos documentos.
- **E-mail ao cliente** na criação e a cada mudança de status (fila + SES), o que também resolve o token perdido.
- **Rate limit em Redis**, compartilhado entre instâncias.
- **Logs estruturados**, métricas e tracing (OpenTelemetry).
- **Entrega:** Dockerfiles, pipeline (lint + testes + build) e deploy.
- **LGPD:** política de retenção e anonimização dos dados pessoais.

Nenhuma dessas mudanças exige reescrever o núcleo: as regras de status são funções puras, o storage está atrás de uma interface e a autorização está concentrada em guards.
