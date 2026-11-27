import { searchDigits, searchPattern } from './search';

const matches = (term: string, text: string) =>
  new RegExp(searchPattern(term), 'i').test(text);

describe('searchPattern', () => {
  it('ignora acentos nos dois sentidos', () => {
    expect(matches('joao', 'João Silva')).toBe(true);
    expect(matches('joão', 'Joao Silva')).toBe(true);
    expect(matches('CONCEICAO', 'Conceição')).toBe(true);
  });

  it('casa trecho, em qualquer posicao', () => {
    expect(matches('constr', 'Grupo Construtora Sul')).toBe(true);
    expect(matches('@exemplo', 'contato@exemplo.com')).toBe(true);
  });

  it('caracteres de regex sao literais: "(.*" nao casa tudo', () => {
    expect(matches('(.*', 'qualquer coisa')).toBe(false);
    expect(matches('(.*', 'Obra (.*) teste')).toBe(true);
    expect(matches('a+b', 'aab')).toBe(false);
    expect(() => new RegExp(searchPattern('[(?<\\'))).not.toThrow();
  });
});

describe('searchDigits', () => {
  it('usa so os digitos, a partir de 4', () => {
    expect(searchDigits('(11) 98765')).toBe('1198765');
    expect(searchDigits('11 9')).toBeNull();
    expect(searchDigits('joao')).toBeNull();
  });
});
