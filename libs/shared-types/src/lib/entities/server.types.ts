import { Language } from '../enums/language.enum';

export interface Server {
  id: string;
  episodeId: string;
  name: string;
  embedUrl: string;
  language: Language;
}
