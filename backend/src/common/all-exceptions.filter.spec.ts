import {
  ArgumentsHost,
  BadRequestException,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AllExceptionsFilter, ErrorBody } from './all-exceptions.filter';
import { AppException } from './app-exception';

function run(exception: unknown) {
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  const host = {
    switchToHttp: () => ({
      getRequest: () => ({ method: 'GET', path: '/api/x' }),
      getResponse: () => ({ status }),
    }),
  } as unknown as ArgumentsHost;

  new AllExceptionsFilter().catch(exception, host);
  return {
    status: status.mock.calls[0][0] as number,
    body: json.mock.calls[0][0] as ErrorBody,
  };
}

describe('AllExceptionsFilter', () => {
  let logError: jest.SpyInstance;
  beforeEach(() => {
    logError = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
  });
  afterEach(() => jest.restoreAllMocks());

  it('AppException sai com o code estavel', () => {
    const { status, body } = run(
      new AppException('INVALID_STATUS_TRANSITION', HttpStatus.CONFLICT, 'msg'),
    );

    expect(status).toBe(409);
    expect(body).toMatchObject({
      statusCode: 409,
      error: 'INVALID_STATUS_TRANSITION',
      message: 'msg',
      path: '/api/x',
    });
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
  });

  it('erros do ValidationPipe viram VALIDATION_ERROR com as mensagens juntas', () => {
    const { body } = run(
      new BadRequestException(['property status should not exist', 'b']),
    );

    expect(body.error).toBe('VALIDATION_ERROR');
    expect(body.message).toBe('property status should not exist; b');
  });

  it('HttpException do Nest usa o code padrao do status', () => {
    const { body } = run(new NotFoundException('nada aqui'));

    expect(body).toMatchObject({ error: 'NOT_FOUND', message: 'nada aqui' });
  });

  it('erro inesperado vira 500 generico, sem stack nem mensagem interna', () => {
    const { status, body } = run(new Error('senha do banco: hunter2'));
    const raw = JSON.stringify(body);

    expect(status).toBe(500);
    expect(body).toMatchObject({
      error: 'INTERNAL_ERROR',
      message: 'Erro interno inesperado',
    });
    expect(raw).not.toContain('hunter2');
    expect(raw).not.toContain('at ');
  });

  it('erro inesperado e logado com stack', () => {
    run(new Error('boom'));

    expect(logError).toHaveBeenCalledWith(
      'GET /api/x',
      expect.stringContaining('Error: boom'),
    );
  });
});
