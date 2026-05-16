import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Language } from '@anime-gamify/shared-types';
import { EpisodeEntity } from './entities/episode.entity';
import { ServerEntity } from './entities/server.entity';
import { EpisodesService } from './episodes.service';

const makeQb = <T>(rows: T[]) => ({
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  addOrderBy: jest.fn().mockReturnThis(),
  getMany: jest.fn().mockResolvedValue(rows),
});

describe('EpisodesService', () => {
  let episodesRepo: jest.Mocked<Repository<EpisodeEntity>>;
  let serversRepo: jest.Mocked<Repository<ServerEntity>>;
  let service: EpisodesService;

  beforeEach(() => {
    episodesRepo = {
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<EpisodeEntity>>;
    serversRepo = {
      createQueryBuilder: jest.fn(),
    } as unknown as jest.Mocked<Repository<ServerEntity>>;
    service = new EpisodesService(episodesRepo, serversRepo);
  });

  it('lists episodes for an anime', async () => {
    const rows = [
      { id: 'e-1', animeId: 'a-1', number: 1, title: 'Ep 1' } as EpisodeEntity,
    ];
    episodesRepo.createQueryBuilder.mockReturnValue(makeQb(rows) as never);

    const result = await service.findByAnime('a-1');

    expect(result).toEqual([{ id: 'e-1', animeId: 'a-1', number: 1, title: 'Ep 1' }]);
  });

  it('throws when servers requested for missing episode', async () => {
    episodesRepo.findOne.mockResolvedValue(null);
    await expect(service.findServers('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('groups servers by language', async () => {
    episodesRepo.findOne.mockResolvedValue({ id: 'e-1' } as EpisodeEntity);
    const serverRows: ServerEntity[] = [
      {
        id: 's-1',
        episodeId: 'e-1',
        name: 'srvA',
        embedUrl: 'u1',
        language: Language.ES,
      } as ServerEntity,
      {
        id: 's-2',
        episodeId: 'e-1',
        name: 'srvB',
        embedUrl: 'u2',
        language: Language.ES,
      } as ServerEntity,
      {
        id: 's-3',
        episodeId: 'e-1',
        name: 'srvC',
        embedUrl: 'u3',
        language: Language.JP_SUB,
      } as ServerEntity,
    ];
    serversRepo.createQueryBuilder.mockReturnValue(makeQb(serverRows) as never);

    const result = await service.findServers('e-1');

    expect(result[Language.ES]).toHaveLength(2);
    expect(result[Language.JP_SUB]).toHaveLength(1);
  });
});
