import { HttpStatus } from '@nestjs/common';
import { AppException } from './app-exception';
import { ParseObjectIdPipe } from './parse-object-id.pipe';

describe('ParseObjectIdPipe', () => {
  const pipe = new ParseObjectIdPipe();

  it('aceita ObjectId hex de 24 chars', () => {
    expect(pipe.transform('665f1c2b9a1e4b0012345678')).toBe(
      '665f1c2b9a1e4b0012345678',
    );
  });

  // 'abcdefghijkl' tem 12 chars: Types.ObjectId.isValid sozinho aceitaria
  it.each(['abc', '', 'abcdefghijkl', '665f1c2b9a1e4b001234567z'])(
    'recusa %p com 400 INVALID_ID',
    (value) => {
      try {
        pipe.transform(value);
        fail('deveria lancar');
      } catch (e) {
        expect(e).toBeInstanceOf(AppException);
        expect((e as AppException).code).toBe('INVALID_ID');
        expect((e as AppException).getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    },
  );
});
