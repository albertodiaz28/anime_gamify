import { Server } from './server.types';

export interface Episode {
  id: string;
  animeId: string;
  number: number;
  title: string;
  servers?: Server[];
}
