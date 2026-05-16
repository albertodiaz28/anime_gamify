import { sanitizeCommentBody } from './comments.sanitize';

describe('sanitizeCommentBody', () => {
  it('removes html tags', () => {
    expect(sanitizeCommentBody('<b>hello</b>')).toBe('hello');
  });

  it('removes script blocks entirely', () => {
    expect(sanitizeCommentBody('hi<script>alert(1)</script> there')).toBe('hi there');
  });

  it('removes style blocks entirely', () => {
    expect(sanitizeCommentBody('a<style>x{}</style>b')).toBe('ab');
  });

  it('collapses whitespace', () => {
    expect(sanitizeCommentBody('  a   b\n\tc  ')).toBe('a b c');
  });

  it('keeps plain text', () => {
    expect(sanitizeCommentBody('Just a comment')).toBe('Just a comment');
  });
});
