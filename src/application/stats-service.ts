import { PrismaClient } from '@prisma/client';
import type { StatsResponse } from '@/utils/types';

export class StatsService {
  constructor(private readonly prisma: PrismaClient) {}

  async getStats(): Promise<StatsResponse> {
    const [topAuthors, media, tweets] = await Promise.all([
      this.prisma.tweet.groupBy({
        by: ['authorId'],
        _sum: {
          likeCount: true
        },
        _count: {
          _all: true
        },
        orderBy: {
          _sum: {
            likeCount: 'desc'
          }
        },
        take: 10
      }),
      this.prisma.media.groupBy({
        by: ['type'],
        _count: { _all: true }
      }),
      this.prisma.tweet.findMany({
        select: {
          createdAt: true,
          likeCount: true,
          hashtags: true
        },
        orderBy: { createdAt: 'asc' }
      })
    ]);

    const authors = await this.prisma.author.findMany({
      where: { id: { in: topAuthors.map((item) => item.authorId) } }
    });
    const authorMap = new Map(authors.map((author) => [author.id, author]));

    const hashtagsMap = new Map<string, number>();
    let cumulative = 0;
    const timeline = tweets.map((tweet) => {
      cumulative += tweet.likeCount;
      tweet.hashtags.forEach((hashtag) => {
        const key = hashtag.toLowerCase();
        hashtagsMap.set(key, (hashtagsMap.get(key) ?? 0) + 1);
      });
      return {
        date: tweet.createdAt.toISOString().slice(0, 10),
        likes: cumulative
      };
    });

    const topHashtags = Array.from(hashtagsMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([tag, count]) => ({ tag, count }));

    return {
      topAuthors: topAuthors.map((entry) => ({
        author: authorMap.get(entry.authorId) ?? null,
        likes: entry._sum.likeCount ?? 0,
        tweets: entry._count._all
      })),
      mediaDistribution: media.map((item) => ({ type: item.type, count: item._count._all })),
      timeline,
      topHashtags
    };
  }
}
