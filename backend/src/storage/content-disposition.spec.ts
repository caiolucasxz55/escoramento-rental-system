import { attachmentDisposition } from './content-disposition';

describe('attachmentDisposition', () => {
  it('forca download com o nome', () => {
    expect(attachmentDisposition('contrato.pdf')).toBe(
      `attachment; filename="contrato.pdf"; filename*=UTF-8''contrato.pdf`,
    );
  });

  it('acentos: ASCII no filename, UTF-8 no filename*', () => {
    expect(attachmentDisposition('orçamento obra.pdf')).toBe(
      `attachment; filename="or_amento obra.pdf"; filename*=UTF-8''or%C3%A7amento%20obra.pdf`,
    );
  });

  it('aspas e barra invertida nao fecham o header', () => {
    const header = attachmentDisposition('a"b\\c.pdf');

    expect(header).toContain('filename="a_b_c.pdf"');
    expect(header.match(/"/g)).toHaveLength(2);
  });
});
