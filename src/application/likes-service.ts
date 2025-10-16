import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { Tweet } from '@/domain/entities';

export const likesQuerySchema = z.object({
  sort: z
    .enum(['likes_desc', 'likes_asc', 'date_desc', 'date_asc', 'retweets_desc', 'retweets_asc'])
    .default('date_desc'),
  type: z.enum(['image', 'video', 'gif', 'any']).default('any'),
  q: z.string().max(280).optional(),
  author: z.string().regex(/^@?\w{1,30}$/).optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12)
});

export type LikesQueryInput = z.infer<typeof likesQuerySchema>;

const mediaTypeMap: Record<string, string> = {
  image: 'photo',
  video: 'video',
  gif: 'animated_gif'
};

export class LikesService {
  constructor(private readonly prisma: PrismaClient) {}

  async list(input: LikesQueryInput) {
    const { page, pageSize, sort, type, q, author, from, to } = input;

    const where: Parameters<typeof this.prisma.tweet.findMany>[0]['where'] = {
      media: {
        some: type === 'any' ? {} : { type: mediaTypeMap[type] ?? type }
      }
    };

    if (q) {
      const terms = q.toLowerCase().split(/[\s,]+/).filter(Boolean);
      where.OR = [
        { text: { contains: q, mode: 'insensitive' } },
        { hashtags: { hasSome: terms } },
        {
          author: {
            username: {
              contains: q.replace('@', ''),
              mode: 'insensitive'
            }
          }
        }
      ];
    }

    if (author) {
      where.author = {
        username: {
          equals: author.replace('@', ''),
          mode: 'insensitive'
        }
      };
    }

    if (from || to) {
      where.createdAt = {};
      if (from) {
        where.createdAt.gte = new Date(`${from}T00:00:00Z`);
      }
      if (to) {
        where.createdAt.lte = new Date(`${to}T23:59:59Z`);
      }
    }

    const orderBy = (() => {
      switch (sort) {
        case 'likes_asc':
          return { likeCount: 'asc' } as const;
        case 'likes_desc':
          return { likeCount: 'desc' } as const;
        case 'retweets_asc':
          return { retweetCount: 'asc' } as const;
        case 'retweets_desc':
          return { retweetCount: 'desc' } as const;
        case 'date_asc':
          return { createdAt: 'asc' } as const;
        case 'date_desc':
        default:
          return { createdAt: 'desc' } as const;
      }
    })();

    const [total, tweets] = await this.prisma.$transaction([
      this.prisma.tweet.count({ where }),
      this.prisma.tweet.findMany({
        where,
        include: { media: true, author: true },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize
      })
    ]);

    return {
      total,
      page,
      pageSize,
      items: tweets.map((tweet) => this.toDomain(tweet))
    };
  }

  async get(id: string) {
    const tweet = await this.prisma.tweet.findUnique({
      where: { id },
      include: { media: true, author: true }
    });

    return tweet ? this.toDomain(tweet) : null;
  }

  private toDomain(tweet: any): Tweet {
    return {
      id: tweet.id,
      text: tweet.text,
      createdAt: tweet.createdAt,
      metrics: {
        likeCount: tweet.likeCount,
        retweetCount: tweet.retweetCount,
        replyCount: tweet.replyCount,
        quoteCount: tweet.quoteCount
      },
      authorId: tweet.authorId,
      permalink: tweet.permalink,
      hashtags: tweet.hashtags,
      mentions: tweet.mentions,
      media: tweet.media,
      author: tweet.author ?? undefined
    } satisfies Tweet;
  }
}
