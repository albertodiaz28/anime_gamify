import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import type { AnimeDetail } from '@anime-gamify/shared-types';
import { AnimeApi } from '../../core/services/anime.api';

export const animeDetailResolver: ResolveFn<Observable<AnimeDetail>> = (route) => {
  const id = route.paramMap.get('id') ?? '';
  return inject(AnimeApi).getAnime(id);
};
