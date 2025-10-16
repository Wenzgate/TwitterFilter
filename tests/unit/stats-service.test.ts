import { describe, expect, it, vi } from 'vitest';
import { StatsService } from '@/application/stats-service';

const prismaMock = {
  tweet: {
    groupBy: vi.fn(),
    findMany: vi.fn()
  },
  media: {
    groupBy: vi.fn()
  },
  author: {
    findMany: vi.fn()
  }
} as any;

describe('StatsService', () => {
  it('agrège les métriques attendues', async () => {
    prismaMock.tweet.groupBy.mockResolvedValueOnce([
      {
        authorId: '123',
        _sum: { likeCount: 100 },
        _count: { _all: 2 }
      }
    ]);
    prismaMock.media.groupBy.mockResolvedValueOnce([{ type: 'photo', _count: { _all: 2 } }]);
    prismaMock.tweet.findMany.mockResolvedValueOnce([
      { createdAt: new Date('2024-01-01T00:00:00Z'), likeCount: 50, hashtags: ['AI'] },
      { createdAt: new Date('2024-01-02T00:00:00Z'), likeCount: 50, hashtags: ['ML'] }
    ]);
    prismaMock.author.findMany.mockResolvedValueOnce([
      { id: '123', name: 'Ada', username: 'ada', profileImageUrl: null, verified: true }
    ]);

    const service = new StatsService(prismaMock);
    const stats = await service.getStats();

    expect(stats.topAuthors[0]).toMatchObject({ likes: 100, tweets: 2 });
    expect(stats.mediaDistribution[0]).toMatchObject({ type: 'photo', count: 2 });
    expect(stats.timeline).toHaveLength(2);
    expect(stats.topHashtags.map((item) => item.tag)).toContain('ai');
  });
});
