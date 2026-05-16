export interface CategorySeed {
  slug: string;
  name: string;
}

export const CATEGORIES_SEED: readonly CategorySeed[] = Object.freeze([
  { slug: 'accion', name: 'Acción' },
  { slug: 'aventura', name: 'Aventura' },
  { slug: 'comedia', name: 'Comedia' },
  { slug: 'drama', name: 'Drama' },
  { slug: 'fantasia', name: 'Fantasía' },
  { slug: 'mecha', name: 'Mecha' },
  { slug: 'misterio', name: 'Misterio' },
  { slug: 'romance', name: 'Romance' },
  { slug: 'sci-fi', name: 'Ciencia Ficción' },
  { slug: 'seinen', name: 'Seinen' },
  { slug: 'shounen', name: 'Shounen' },
  { slug: 'slice-of-life', name: 'Slice of Life' },
  { slug: 'deportes', name: 'Deportes' },
  { slug: 'terror', name: 'Terror' },
]);
