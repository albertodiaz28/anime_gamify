const HTML_TAG = /<\/?[^>]+>/g;
const SCRIPT_BLOCK = /<script[\s\S]*?<\/script>/gi;
const STYLE_BLOCK = /<style[\s\S]*?<\/style>/gi;
const WHITESPACE = /\s+/g;

export function sanitizeCommentBody(raw: string): string {
  const stripped = raw
    .replace(SCRIPT_BLOCK, '')
    .replace(STYLE_BLOCK, '')
    .replace(HTML_TAG, '');
  return stripped.replace(WHITESPACE, ' ').trim();
}
