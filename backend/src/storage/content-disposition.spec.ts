import { buildContentDisposition } from './content-disposition';

describe('buildContentDisposition', () => {
  it('attachment forca download com o nome', () => {
    expect(buildContentDisposition('attachment', 'contrato.pdf')).toBe(
      `attachment; filename="contrato.pdf"; filename*=UTF-8''contrato.pdf`,
    );
  });

  it('inline exibe no navegador mantendo o nome', () => {
    expect(buildContentDisposition('inline', 'contrato.pdf')).toBe(
      `inline; filename="contrato.pdf"; filename*=UTF-8''contrato.pdf`,
    );
  });

  it('acentos: ASCII no filename, UTF-8 no filename*', () => {
    expect(buildContentDisposition('attachment', 'orçamento obra.pdf')).toBe(
      `attachment; filename="or_amento obra.pdf"; filename*=UTF-8''or%C3%A7amento%20obra.pdf`,
    );
  });

  it('aspas e barra invertida nao fecham o header', () => {
    const header = buildContentDisposition('inline', 'a"b\\c.pdf');

    expect(header).toContain('filename="a_b_c.pdf"');
    expect(header.match(/"/g)).toHaveLength(2);
  });
});
