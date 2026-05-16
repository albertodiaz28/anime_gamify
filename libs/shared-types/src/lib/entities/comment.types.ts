import { PublicUser } from './user.types';

export interface Comment {
  id: string;
  animeId: string;
  parentId: string | null;
  body: string;
  author: PublicUser;
  createdAt: string;
}
