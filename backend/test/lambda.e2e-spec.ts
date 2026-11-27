import type { Context } from 'aws-lambda';
import { createLambdaApp, LambdaApp } from '../src/lambda';

// evento no formato da Function URL (payload v2)
const functionUrlEvent = (
  method: string,
  path: string,
  headers: Record<string, string> = {},
) => ({
  version: '2.0',
  routeKey: '$default',
  rawPath: path,
  rawQueryString: '',
  headers: {
    host: 'abc123.lambda-url.us-east-2.on.aws',
    'x-forwarded-for': '203.0.113.7',
    'x-forwarded-proto': 'https',
    ...headers,
  },
  requestContext: {
    accountId: 'anonymous',
    apiId: 'abc123',
    domainName: 'abc123.lambda-url.us-east-2.on.aws',
    domainPrefix: 'abc123',
    http: {
      method,
      path,
      protocol: 'HTTP/1.1',
      sourceIp: '203.0.113.7',
      userAgent: 'jest',
    },
    requestId: 'req-1',
    routeKey: '$default',
    stage: '$default',
    time: '26/Nov/2026:20:00:00 +0000',
    timeEpoch: Date.now(),
  },
  isBase64Encoded: false,
});

interface LambdaResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

// app sem listen: o handler recebe o evento e devolve a resposta HTTP
describe('Handler do Lambda (e2e)', () => {
  let lambda: LambdaApp;
  beforeAll(async () => (lambda = await createLambdaApp()));
  afterAll(() => lambda?.app.close());

  const invoke = async (event: object) =>
    (await lambda.handler(
      event,
      {} as Context,
      () => undefined,
    )) as LambdaResponse;

  it('GET /api/health por evento de Function URL: 200', async () => {
    const res = await invoke(functionUrlEvent('GET', '/api/health'));

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ status: 'ok', mongo: 'up' });
  });

  it('erro sai no formato padrao da API', async () => {
    const res = await invoke(
      functionUrlEvent('GET', '/api/public/requests/abc/status'),
    );

    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body)).toMatchObject({ error: 'INVALID_ID' });
  });

  it('preflight do frontend recebe o CORS da API', async () => {
    const res = await invoke(
      functionUrlEvent('OPTIONS', '/api/public/requests', {
        origin: 'http://localhost:3000',
        'access-control-request-method': 'POST',
      }),
    );

    expect(res.headers['access-control-allow-origin']).toBe(
      'http://localhost:3000',
    );
  });
});
