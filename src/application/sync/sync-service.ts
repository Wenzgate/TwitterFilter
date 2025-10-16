import { PrismaClient } from '@prisma/client';
import { TwitterClient } from '@/infrastructure/twitter/client';
import { mapTwitterResponseToDomain } from '@/domain/mappers';
import { logger } from '@/server/logger';

export class SyncService {
  constructor(private readonly prisma: PrismaClient, private readonly twitter: TwitterClient) {}

  async syncLikes({ userId }: { userId: string }) {
    const state = await this.prisma.syncState.findUnique({ where: { userId } });
    let nextToken = state?.nextToken ?? undefined;
    let sinceId = state?.sinceId ?? undefined;
    let imported = 0;

    const now = new Date();
    for (let page = 0; page < 10; page += 1) {
      const response = await this.twitter.fetchLikedTweets({
        userId,
        paginationToken: nextToken,
        sinceId
      });

      const tweets = mapTwitterResponseToDomain(response);
      if (!tweets.length) {
        logger.info({ userId, page }, 'No more tweets to import');
        break;
      }

      for (const tweet of tweets) {
        if (tweet.author) {
          await this.prisma.author.upsert({
            where: { id: tweet.author.id },
            update: {
              name: tweet.author.name,
              username: tweet.author.username,
              profileImageUrl: tweet.author.profileImageUrl,
              verified: tweet.author.verified
            },
            create: {
              id: tweet.author.id,
              name: tweet.author.name,
              username: tweet.author.username,
              profileImageUrl: tweet.author.profileImageUrl,
              verified: tweet.author.verified
            }
          });
        } else {
          await this.prisma.author.upsert({
            where: { id: tweet.authorId },
            update: {},
            create: {
              id: tweet.authorId,
              name: tweet.authorId,
              username: tweet.authorId,
              profileImageUrl: null,
              verified: false
            }
          });
        }

        await this.prisma.tweet.upsert({
          where: { id: tweet.id },
          update: {
            text: tweet.text,
            createdAt: tweet.createdAt,
            likeCount: tweet.metrics.likeCount,
            retweetCount: tweet.metrics.retweetCount,
            replyCount: tweet.metrics.replyCount,
            quoteCount: tweet.metrics.quoteCount,
            authorId: tweet.authorId,
            permalink: tweet.permalink,
            hashtags: tweet.hashtags,
            mentions: tweet.mentions,
            media: {
              deleteMany: {},
              create: tweet.media.map((media) => ({
                id: media.id,
                type: media.type,
                url: media.url,
                previewUrl: media.previewImageUrl,
                width: media.width,
                height: media.height,
                durationMs: media.durationMs
              }))
            }
          },
          create: {
            id: tweet.id,
            text: tweet.text,
            createdAt: tweet.createdAt,
            likeCount: tweet.metrics.likeCount,
            retweetCount: tweet.metrics.retweetCount,
            replyCount: tweet.metrics.replyCount,
            quoteCount: tweet.metrics.quoteCount,
            authorId: tweet.authorId,
            permalink: tweet.permalink,
            hashtags: tweet.hashtags,
            mentions: tweet.mentions,
            media: {
              create: tweet.media.map((media) => ({
                id: media.id,
                type: media.type,
                url: media.url,
                previewUrl: media.previewImageUrl,
                width: media.width,
                height: media.height,
                durationMs: media.durationMs
              }))
            }
          }
        });
      }

      imported += tweets.length;
      nextToken = response.meta?.next_token ?? undefined;
      sinceId = response.meta?.newest_id ?? sinceId;

      if (!nextToken) {
        break;
      }
    }

    await this.prisma.syncState.upsert({
      where: { userId },
      update: {
        nextToken,
        sinceId,
        syncedAt: now
      },
      create: {
        userId,
        nextToken,
        sinceId,
        syncedAt: now
      }
    });

    return { imported };
  }
}
