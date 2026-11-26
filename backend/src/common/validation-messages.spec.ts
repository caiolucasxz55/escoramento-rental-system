import type { ValidationError } from 'class-validator';
import { validationMessages } from './validation-messages';

const error = (
  property: string,
  constraints: Record<string, string>,
  children: ValidationError[] = [],
): ValidationError => ({ property, constraints, children });

describe('validationMessages', () => {
  it('usa a mensagem do DTO', () => {
    expect(
      validationMessages([
        error('description', {
          isLength: 'A descrição deve ter entre 10 e 2000 caracteres.',
        }),
      ]),
    ).toEqual(['A descrição deve ter entre 10 e 2000 caracteres.']);
  });

  it('campo fora do DTO vira mensagem em portugues com o nome do campo', () => {
    expect(
      validationMessages([
        error('status', {
          whitelistValidation: 'property status should not exist',
        }),
      ]),
    ).toEqual(['O campo "status" não é permitido.']);
  });

  it('junta varios campos e erros aninhados', () => {
    expect(
      validationMessages([
        error('email', { isEmail: 'Informe um e-mail válido.' }),
        error('outer', {}, [error('inner', { whitelistValidation: 'x' })]),
      ]),
    ).toEqual([
      'Informe um e-mail válido.',
      'O campo "inner" não é permitido.',
    ]);
  });
});
