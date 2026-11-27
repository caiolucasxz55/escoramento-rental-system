# Escoramento · Solicitações de locação

Módulo full stack para clientes solicitarem a locação de escoramento (com até 5 documentos) e acompanharem o status, e para o admin analisar, editar e mudar o status, vendo os documentos num preview seguro. O foco está nas regras de negócio no backend, no acesso seguro aos documentos e nos testes.

**Stack:** NestJS 12 + TypeScript · MongoDB (Mongoose) · S3 (AWS SDK v3; MinIO no ambiente local) · Next.js 16 (App Router) + Tailwind · pdf.js · Jest, Supertest e mongodb-memory-server · Vitest · Swagger.

## Produção

| O quê | Link |
| --- | --- |
| Aplicação (cliente) | https://escoramento-rental-system.vercel.app |
| Área administrativa | https://escoramento-rental-system.vercel.app/admin (as credenciais de demonstração aparecem na própria tela de login) |
| API | https://esc-container-service.edb7c0jqc7pn0.us-east-2.cs.amazonlightsail.com/api |
| Swagger | https://esc-container-service.edb7c0jqc7pn0.us-east-2.cs.amazonlightsail.com/api/docs |
| Health | https://esc-container-service.edb7c0jqc7pn0.us-east-2.cs.amazonlightsail.com/api/health |

Frontend na Vercel, API no AWS Lightsail Container Service, banco no MongoDB Atlas e documentos num bucket S3 privado. Os dados são fictícios; não envie dados pessoais reais. Detalhes em [Deploy (produção)](#deploy-produção).

## Pré-requisitos

- **Node.js 22.12 ou mais novo** (desenvolvido e testado com 22.13.1)
- npm 10
- Docker e Docker Compose (2.30 ou mais novo para o modo "tudo em Docker")

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

### Tudo em Docker (sem Node na máquina)

A API e o frontend também têm `Dockerfile`, e o compose os sobe no perfil `app`. As URLs são as mesmas da tabela acima.

```bash
cp backend/.env.example backend/.env
docker compose --profile app run --rm --no-deps api node scripts/hash-password.mjs admin123
# cole a saída em ADMIN_PASSWORD_HASH no backend/.env
docker compose --profile app up -d --build
docker compose exec api node scripts/seed.mjs   # opcional
```

- Nesse modo a infraestrutura é sempre a do compose (Mongo e MinIO, com os hosts internos `mongo` e `minio`); do `backend/.env` vêm só JWT, admin e cota. Para usar a AWS, rode a API com `npm`.
- A senha mostrada na tela de login é embutida no build do frontend. Se usou outra senha no `hash-password`, rode com `DEMO_ADMIN_PASSWORD=sua-senha docker compose --profile app up -d --build`.
- Medido com tudo no ar: API ~105 MB de RAM, frontend ~50 MB, Mongo ~130 MB (cache limitado a 256 MB) e MinIO ~150 MB. As imagens têm ~410 MB (API) e ~340 MB (frontend, build `standalone` do Next).
- `docker compose up -d` sem o perfil continua subindo só a infraestrutura, para desenvolver com hot reload.

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
| `STORAGE_QUOTA_MB` | `200` | Opcional: teto da soma de todos os arquivos guardados; passou dele, o upload dá 507. Vazio = sem cota |
| `TRUST_PROXY_HOPS` | `1` | Opcional: atrás de balanceador, quantos saltos do `X-Forwarded-For` são confiáveis (o rate limit conta por cliente). Vazio = o header é ignorado; nunca ligue sem um proxy na frente, ou qualquer um forja o IP |

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

Validado contra um bucket real na AWS (`us-east-2`): upload, download pela URL assinada (200), o mesmo objeto sem assinatura (403), `disposition=inline` com o CORS do preview e remoção (a URL antiga passa a dar 404). Com um bucket real, vale definir `STORAGE_QUOTA_MB` para os testes manuais não acumularem arquivos sem limite.

## Deploy (produção)

- **Frontend:** Vercel, em https://escoramento-rental-system.vercel.app. O deploy é da integração da Vercel com o GitHub; o workflow `frontend.yml` só roda lint, typecheck, testes e build.
- **Backend:** AWS **Lightsail Container Service**, rodando a mesma imagem do `backend/Dockerfile`. O Lightsail entrega a URL já em HTTPS (`*.cs.amazonlightsail.com`), o que a Vercel exige (página HTTPS não chama API HTTP). Plano Nano (512 MB; a API usa ~105 MB).
- **Banco:** MongoDB Atlas (plano gratuito M0). **Arquivos:** o bucket S3 já validado.
- **CI/CD:** `.github/workflows/backend.yml`. Em todo PR e push roda lint, testes unitários e testes e2e; num push na `main`, e só se tudo passar, monta a imagem, envia ao Lightsail, cria o deployment e espera a nova versão ficar ativa e responder no `/api/health`. 
- **Rate limit atrás do balanceador:** o Lightsail entrega as requisições pelo balanceador; com `TRUST_PROXY_HOPS=1` a API usa o IP do cliente que o balanceador acrescenta no `X-Forwarded-For`, em vez de contar todo mundo como um só.

O passo a passo para recriar este ambiente do zero (Atlas, Lightsail, usuário de deploy, secrets do GitHub, CORS e Vercel), com os problemas mais comuns e como resolver, está em [`backend/deploy/README.md`](backend/deploy/README.md).

## Endpoints

Documentação interativa em **`/api/docs`** (Swagger) e exemplos prontos em [`backend/requests.http`](backend/requests.http), com arquivos de exemplo em `backend/samples/`.

| Método | Rota | Acesso | Sucesso |
| --- | --- | --- | --- |
| POST | `/api/public/requests` | Público (multipart, até 5 arquivos) | 201 `{ id, token, status }` |
| GET | `/api/public/requests/:id/status` | Header `X-Consultation-Token` | 200 |
| POST | `/api/auth/login` | Público | 200 `{ accessToken, expiresIn }` |
| GET | `/api/admin/requests?page=&limit=&status=&q=` | JWT | 200 `{ data, meta }` |
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

O `message` vem em português, pronto para o usuário; o frontend escolhe o texto pelo `error`. Os códigos de negócio das solicitações ficam todos em `backend/src/rental-requests/errors.ts`.

| Status | Códigos |
| --- | --- |
| 400 | `VALIDATION_ERROR`, `INVALID_ID`, `NOTHING_TO_UPDATE`, `NO_FILES`, `EMPTY_FILE`, `TOO_MANY_FILES`, `UNEXPECTED_FILE_FIELD` |
| 401 | `UNAUTHORIZED`, `INVALID_CREDENTIALS` |
| 404 | `REQUEST_NOT_FOUND` (também para token errado), `FILE_NOT_FOUND` |
| 409 | `INVALID_STATUS_TRANSITION`, `STATUS_CONFLICT`, `REQUEST_NOT_EDITABLE`, `FILE_LIMIT_REACHED`, `CONCURRENT_UPDATE` |
| 413 | `FILE_TOO_LARGE` |
| 415 | `UNSUPPORTED_FILE_TYPE` |
| 429 | `TOO_MANY_REQUESTS` |
| 500 / 503 | `INTERNAL_ERROR` (sem detalhe), `SERVICE_UNAVAILABLE` (health com o Mongo fora) |
| 507 | `STORAGE_QUOTA_EXCEEDED` |

## Decisões técnicas

**Arquitetura.** Monorepo com `backend/` (NestJS) e `frontend/` (Next.js). Só o backend fala com o MongoDB e com o S3; o navegador só toca o storage por URL assinada, depois que a API autorizou. No backend, a feature `rental-requests/` é separada por papel (`controllers/`, `services/`, `pipes/`, `mappers/`, `rules/`, `dto/`, `schemas/`):

- **Regras como funções puras** em `rules/` (transições de status, validação de arquivo, token de consulta, limites dos campos), testadas sem subir o Nest. O DTO e o schema usam os mesmos limites, sem números repetidos.
- **Erros de negócio num arquivo só** (`errors.ts`): cada erro com código estável e mensagem em português; os services só chamam essas funções.
- **Dois controllers para o mesmo recurso**: `/public/requests` (sem JWT) e `/admin/requests` (guard no controller inteiro), para nenhuma rota admin ficar sem proteção por esquecimento.
- **Storage atrás de uma interface** com token `STORAGE`: `S3Storage` em produção, `InMemoryStorage` nos testes. É a única abstração do projeto, porque é o único ponto que de fato se troca.
- **Sem camada de repositório**: a correção depende de queries condicionais atômicas, e um repositório genérico esconderia justamente isso.
- **Respostas por mappers** (`toPublicStatus`, `toListItem`, `toDetail`); o `toJSON` do schema é só rede de segurança.

**Modelagem.** Uma coleção `rental_requests` com os metadados dos arquivos embutidos (no máximo 5). Toda alteração é atômica em um documento, sem transação. Índices `{status:1, createdAt:-1}` e `{createdAt:-1}` para a listagem.

**Busca no admin.** O parâmetro `q` procura um trecho no nome, no e-mail e no telefone (pelos dígitos), sem diferenciar maiúsculas nem acentos ("joao" acha "João"), combinado com o filtro de status e a paginação no servidor. O termo vira uma expressão regular com os caracteres especiais escapados (`rules/search.ts`), então "(.*" busca o texto literal em vez de casar tudo. Na tela, a busca espera 350 ms depois da última tecla e fica na URL, como o filtro.

**Regras de status com concorrência.** O mapa de transições define os próximos estados; estados finais têm lista vazia. A mudança de status é condicionada ao status lido (`findOneAndUpdate({ _id, status: atual })`): com dois admins ao mesmo tempo, um recebe 200 e o outro 409. O mesmo vale para o limite de 5 arquivos: o `$push` exige que `files.{5-n}` ainda não exista, então dois uploads simultâneos não passam de 5. Os dois casos têm teste de integração, e um teste de mutação (removendo a condição) confirma que os testes falham sem ela.

**Upload.** Passa pelo backend (Multer em memória, 10 MB por arquivo, 5 arquivos). O tipo é decidido pelos primeiros bytes (PDF, PNG, JPEG), nunca pelo nome ou pelo `Content-Type`: um executável renomeado para `.pdf` recebe 415. Usei um pipe próprio (`ParseUploadsPipe`) em vez do `ParseFilePipeBuilder` do Nest porque o validador nativo responde 400 para tipo errado e o contrato pede 415; com um só ponto de validação, a regra não se duplica. A chave no S3 é `rental-requests/{id}/{uuid}.{ext}`; o nome original nunca entra nela. Opcionalmente, `STORAGE_QUOTA_MB` limita a soma de todos os arquivos guardados: antes de enviar, a API soma os tamanhos no Mongo e recusa com 507 o upload que passaria do teto (solicitações sem anexo continuam aceitas).

**Consistência MongoDB × S3.** A regra é: o Mongo nunca aponta para um objeto inexistente. Na criação e na adição, o arquivo vai ao S3 antes do Mongo, e se a escrita no Mongo falha ou não se aplica, os objetos enviados são apagados. Na remoção e na substituição, o Mongo muda primeiro e o objeto antigo é apagado depois; se o S3 falhar aí, sobra um objeto órfão (privado) registrado em log com a chave. Antes de adicionar ou substituir, uma leitura barata confere se a solicitação existe, aceita mudança e tem espaço, para nada subir ao S3 à toa; a garantia continua sendo a escrita condicional. Na substituição, a condição inclui a chave lida: duas trocas simultâneas do mesmo arquivo dão uma 200 e uma 409, sem risco de apagar o arquivo vigente.

**Segurança.**
- **Token de consulta**: 256 bits aleatórios, exibido uma vez; o banco guarda só o SHA-256 (bcrypt não agrega com token longo e aleatório). Vai no header `X-Consultation-Token`, nunca na URL, e é comparado com `timingSafeEqual`. Token errado e id inexistente devolvem o mesmo 404, para não revelar quais ids existem. A consulta lê do banco só o resumo público (status, datas, quantidade de arquivos) e o hash; dados pessoais nem saem do Mongo nessa rota.
- **Admin**: login com bcrypt e JWT de 1h. A senha é comparada mesmo com e-mail errado, para o tempo de resposta não revelar o e-mail.
- **Documentos**: bucket sem acesso anônimo; acesso só por URL assinada de 5 minutos, com o nome original sanitizado e o tipo detectado no upload. A rota aceita `?disposition=inline` (visualizar) ou `attachment` (padrão, baixar). A URL é gerada com `S3_PUBLIC_ENDPOINT`, porque o navegador não resolve o host interno do MinIO.
- **API**: `ValidationPipe` com `whitelist` e `forbidNonWhitelisted` (campo extra dá 400), ids validados antes de chegar ao Mongo, `helmet`, CORS restrito a `FRONTEND_URL`, rate limit de 10/min por IP (por rota) no login, na criação e na consulta pública, e erro inesperado como 500 genérico sem stack.

**Frontend.** Páginas finas que só renderizam a view de cada feature; primitivas de UI em `components/ui/`; um único cliente HTTP (`lib/api/client.ts`) que injeta o JWT, transforma o erro da API em `ApiError` e encerra a sessão no 401; mensagens escolhidas pelo código de erro, não pelo texto. O formulário valida antes de enviar com as mesmas regras e textos do backend e mostra o erro embaixo de cada campo. A confirmação oferece copiar o identificador e o token ou baixar um comprovante `.txt` com os dois. O JWT fica em `sessionStorage` (trade-off em Limitações). Filtro e página da listagem ficam na query string.

**Gerenciamento de documentos.** Os documentos enviados pelo cliente são tratados como evidências vinculadas à solicitação, e não como dados cadastrais editáveis. Por isso, na interface o administrador só visualiza e baixa os arquivos, sem substituir nem remover, o que preserva a integridade e a rastreabilidade do que o solicitante enviou. A API mantém as rotas de adicionar, substituir e remover porque o enunciado pede o gerenciamento dos documentos e a consistência entre MongoDB e S3 nessas operações; elas exigem JWT, só valem enquanto a solicitação não está finalizada e ficam para correções pedidas pelo próprio cliente.

**Visualização segura de documentos.** O admin vê os arquivos num preview dentro do sistema, sem baixá-los: o PDF é desenhado em `<canvas>` pelo pdf.js (o JavaScript do documento nunca executa e nenhum leitor de PDF do sistema é acionado) e a imagem aparece borrada até o admin clicar em "Mostrar". Baixar continua possível, como ação explícita e com aviso. Isso reduz o risco de um PDF malicioso explorar o leitor instalado e de conteúdo impróprio aparecer sem aviso.

**Ambiente.**
- A MinIO deixou de publicar `minio/minio` no Docker Hub; o compose usa `cgr.dev/chainguard/minio`, o mesmo servidor, mantido e com o `mc` embutido.
- No compose, o `backend/.env` entra com `format: raw`: sem isso o Compose trata os `$` do hash bcrypt como variáveis e a API recusa subir com o hash corrompido.
- Os pacotes do Nest 12 são só ESM; para os testes rodarem no Node 22, o Jest converte `@nestjs/*` para CommonJS só durante o teste (`jest.config.cjs`).

## Hipóteses adotadas

| # | Ponto ambíguo | Hipótese adotada |
| --- | --- | --- |
| H1 | Quem envia e quem altera os documentos | O cliente anexa de 0 a 5 arquivos ao enviar a solicitação. Os documentos são evidências dele: o admin visualiza e baixa, mas não substitui nem remove pela interface (ver "Gerenciamento de documentos" em Decisões técnicas). |
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

- **Organização do trabalho com o Falange:** o backlog inteiro ficou no **Falange**, um gerenciador de tarefas que desenvolvi e que expõe as tarefas à IA por MCP. Ele foi peça central do projeto, porque trocou o "a IA diz que terminou" por regras que dá para auditar:
  - **Backlog a partir do planejamento:** as tarefas de cada fase foram geradas do documento de planejamento e passaram por uma validação antes de existir. Toda tarefa precisava de 1 a 5 critérios de aceite **observáveis** ("POST com 6 arquivos retorna 400 TOO_MANY_FILES"); critério vago, como "não tem mais o botão", era recusado e reescrito.
  - **Conclusão só com prova:** a API do Falange recusa concluir tarefa sem evidência ligada a cada critério. A IA tinha de ler o diff do commit, citar o teste que cobre o critério ou descrever a verificação manual; o título do commit não valia como prova. As **37 tarefas** do projeto foram fechadas assim, cada critério com sua evidência.
  - **Estimativas calibradas:** antes de estimar, a IA consultava quanto as estimativas anteriores realmente levaram e ajustava (por exemplo, "P" vinha sendo superestimado e passou a "PP").
  - **Ritmo e controle:** no fim de cada fase, testes, lint e build, code review e um relatório; os commits eram meus, e a fase seguinte só começava depois do meu "ok". Ações destrutivas, como apagar tarefas, sempre pediam confirmação.
  - **Rastreabilidade:** decisões e mudanças de rumo ficaram registradas, como a troca do deploy no Lambda pelo Lightsail e de OIDC por chave de deploy. O uso real também gerou notas de melhoria para o próprio Falange.
- **Implementação:** a IA escreveu o código fase a fase (ambiente, regras puras, API, arquivos e S3, testes de integração, frontend, documentação). Ao fim de cada fase eu revisei o diff e fiz os commits; pedi mudanças de rumo quando discordei, como o rename de `Request` para `RentalRequest` (o nome colidia com a requisição HTTP), a separação de `rental-requests/` em pastas por papel e o padrão de componentes do frontend.
- **Testes e revisão:** os casos de teste saíram das tabelas do planejamento; a IA também fez um code review explícito ao fim de cada fase, que pegou problemas reais (CORS respondendo para qualquer origem, `main.ts` subindo o servidor ao ser importado, um formulário que perdia edição). Antes da entrega, uma varredura do backend inteiro achou mais: o 503 do health saindo como 500, erros do Multer em inglês, `PATCH` vazio alterando o `updatedAt` e a criação pública sem rate limit.

**Como validei:**
- testes automatizados: unitários e de integração no backend, e testes da lógica pura no frontend;
- teste de mutação nos controles de concorrência: removi as condições atômicas e confirmei que os testes falham sem elas;
- teste de mutação também no rate limit da criação e na cota de armazenamento;
- execução manual contra MongoDB e MinIO reais (upload, download pela URL assinada, expiração da URL, bucket sem acesso anônimo, corrida de requisições paralelas) e, depois, contra um bucket S3 real na AWS (URL assinada, acesso anônimo negado, CORS do preview, remoção);
- uso no navegador de cada fluxo, do formulário ao preview de documentos no admin;
- leitura dos diffs antes de cada commit.

## Limitações conhecidas

- **Token sem recuperação:** o token de consulta não pode ser recuperado se for perdido (H6); o comprovante `.txt` da confirmação ajuda o cliente a guardá-lo.
- **Cota de armazenamento aproximada:** a soma é feita a cada upload; dois uploads simultâneos podem passar um pouco do teto.
- **JWT em `sessionStorage`:** fica exposto a XSS; o mais seguro seria cookie `httpOnly` + `SameSite`. Foi escolhido pela simplicidade e porque o mesmo formato funciona no Swagger, no Supertest e no `requests.http`.
- **Upload pela memória da API:** até 50 MB por requisição.
- **Órfãos no S3:** quando o storage falha depois da escrita no Mongo, o objeto fica órfão (privado) e é só logado; não há job de limpeza.
- **Admin único:** sem cadastro de usuários nem papéis (H7).
- **Sem histórico:** não há registro de mudanças de status nem log de acesso aos documentos.
- **Sem testes de componente no frontend:** só a lógica pura (`lib/`) é testada.
- **Rate limit por instância:** fica em memória; com várias instâncias, cada uma conta separado.
- **Busca sem índice:** um trecho no meio do texto não usa índice, então a busca percorre a coleção. Serve para o volume do desafio; com muitos registros, o caminho é o Atlas Search.
- **Chave de deploy no GitHub:** o deploy usa a chave fixa de um usuário IAM só com as ações de publicar no Lightsail. O ideal seria OIDC (credencial temporária, sem chave guardada); ficou a chave pela simplicidade de configurar numa conta AWS nova.
- **Chave do S3 no Lightsail:** o Container Service não assume papel IAM, então a API usa a chave de um usuário IAM restrito ao prefixo `rental-requests/`; ela fica nas variáveis do deployment, visíveis no console do Lightsail para quem tem acesso à conta.
- **Confirmações nativas:** aprovar e cancelar usam o `confirm` do navegador.
- **Sem antivírus:** o preview seguro e a validação por magic bytes reduzem o risco, mas não detectam um arquivo malicioso; quem baixar e abrir fora do sistema ainda depende do próprio antivírus.
- **Correção de documento pelo cliente:** depois de enviar, o cliente não troca um arquivo pela tela de consulta; a correção depende de um pedido ao operador (H1).
- **Credenciais de demo na tela de login:** só aparecem com as variáveis `NEXT_PUBLIC_DEMO_ADMIN_*`. No deploy desta entrega estão ligadas, com uma senha só de demonstração, para quem avalia entrar no admin; num sistema real ficariam vazias.
- **Identidade visual enxuta:** paleta própria, uma home de apresentação e uma ilustração em SVG; sem design system completo nem teste de usabilidade.

## O que eu faria para evoluir

- **Upload direto ao S3:** URL pré-assinada de `PUT` para um prefixo de quarentena, com validação (magic bytes + antivírus) disparada por evento antes de mover para o prefixo final.
- **Limpeza de órfãos:** job que compara as chaves do bucket com os metadados do Mongo, ou padrão outbox com `PENDING_DELETE`.
- **Paginação por cursor** (`createdAt` + `_id`), que não degrada em páginas altas.
- **Atlas Search** para a busca: índice de texto com tolerância a erro de digitação, e busca também na descrição.
- **Usuários com papéis**, cookie `httpOnly` e refresh token.
- **`statusHistory`** com origem, destino, autor e data, e log de acesso aos documentos.
- **E-mail ao cliente** na criação e a cada mudança de status (fila + SES), o que também resolve o token perdido.
- **Rate limit em Redis**, compartilhado entre instâncias.
- **Cota por contador** atualizado a cada upload e remoção, em vez de somar a coleção a cada envio.
- **Logs estruturados**, métricas e tracing (OpenTelemetry).
- **Segredos no AWS Secrets Manager** em vez das variáveis do deployment, e limpeza automática das imagens antigas no Lightsail.
- **LGPD:** política de retenção e anonimização dos dados pessoais.

Nenhuma dessas mudanças exige reescrever o núcleo: as regras de status são funções puras, o storage está atrás de uma interface e a autorização está concentrada em guards.
