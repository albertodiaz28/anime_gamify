import { USER_AGENTS } from '../constants/scraping.constants';

export function pickUserAgent(): string {
  const index = Math.floor(Math.random() * USER_AGENTS.length);
  return USER_AGENTS[index] ?? USER_AGENTS[0];
}
