import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CatalogSort } from '@anime-gamify/shared-types';
import { API_URL } from '../../core/services/api.config';
import { CatalogStore } from './catalog.store';

const API = 'http://test.local/api';

describe('CatalogStore', () => {
  let store: CatalogStore;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: API },
        CatalogStore,
      ],
    });
    store = TestBed.inject(CatalogStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads first page on reload', async () => {
    const promise = store.reload();
    const req = httpMock.expectOne((r) => r.url === `${API}/animes`);
    expect(req.request.method).toBe('GET');
    req.flush({ items: [{ id: 'a1' }], nextCursor: 'c1' });
    await promise;

    expect(store.results().length).toBe(1);
    expect(store.cursor()).toBe('c1');
    expect(store.hasMore()).toBe(true);
  });

  it('appends next page on loadNext', async () => {
    await loadInitial(store, httpMock);
    const promise = store.loadNext();
    const req = httpMock.expectOne((r) => r.url === `${API}/animes`);
    expect(req.request.params.get('cursor')).toBe('c1');
    req.flush({ items: [{ id: 'a2' }], nextCursor: null });
    await promise;

    expect(store.results().length).toBe(2);
    expect(store.hasMore()).toBe(false);
  });

  it('applies sort filter to query', async () => {
    store.patchFilters({ sort: CatalogSort.RATING_DESC });
    const req = httpMock.expectOne((r) => r.url === `${API}/animes`);
    expect(req.request.params.get('sort')).toBe(CatalogSort.RATING_DESC);
    req.flush({ items: [], nextCursor: null });
  });
});

async function loadInitial(store: CatalogStore, httpMock: HttpTestingController): Promise<void> {
  const promise = store.reload();
  const req = httpMock.expectOne((r) => r.url === `${API}/animes`);
  req.flush({ items: [{ id: 'a1' }], nextCursor: 'c1' });
  await promise;
}
