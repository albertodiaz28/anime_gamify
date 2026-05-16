export interface CommentCursor {
  createdAt: string;
  id: string;
}

export function encodeCommentCursor(payload: CommentCursor): string {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
}

export function decodeCommentCursor(raw: string): CommentCursor | null {
  try {
    const json = Buffer.from(raw, 'base64url').toString('utf8');
    const parsed = JSON.parse(json) as CommentCursor;
    if (parsed && typeof parsed.id === 'string' && typeof parsed.createdAt === 'string') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}
