import { PrismaClient } from '@prisma/client';
import seedData from '../data/mock-likes.json';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with mock likes...');

  const devUserId = 'dev-user';
  await prisma.user.upsert({
    where: { id: devUserId },
    update: {
      name: 'Dev User',
      username: 'devuser',
      email: 'dev@example.com'
    },
    create: {
      id: devUserId,
      name: 'Dev User',
      username: 'devuser',
      email: 'dev@example.com'
    }
  });

  for (const author of seedData.authors) {
    await prisma.author.upsert({
      where: { id: author.id },
      update: {
        name: author.name,
        username: author.username,
        profileImageUrl: author.profileImageUrl,
        verified: author.verified
      },
      create: {
        id: author.id,
        name: author.name,
        username: author.username,
        profileImageUrl: author.profileImageUrl,
        verified: author.verified
      }
    });
  }

  for (const tweet of seedData.tweets) {
    await prisma.tweet.upsert({
      where: { id: tweet.id },
      update: {
        text: tweet.text,
        createdAt: new Date(tweet.createdAt),
        likeCount: tweet.likeCount,
        retweetCount: tweet.retweetCount,
        replyCount: tweet.replyCount,
        quoteCount: tweet.quoteCount,
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
            previewUrl: media.previewUrl,
            width: media.width,
            height: media.height,
            durationMs: media.durationMs ?? null
          }))
        }
      },
      create: {
        id: tweet.id,
        text: tweet.text,
        createdAt: new Date(tweet.createdAt),
        likeCount: tweet.likeCount,
        retweetCount: tweet.retweetCount,
        replyCount: tweet.replyCount,
        quoteCount: tweet.quoteCount,
        authorId: tweet.authorId,
        permalink: tweet.permalink,
        hashtags: tweet.hashtags,
        mentions: tweet.mentions,
        media: {
          create: tweet.media.map((media) => ({
            id: media.id,
            type: media.type,
            url: media.url,
            previewUrl: media.previewUrl,
            width: media.width,
            height: media.height,
            durationMs: media.durationMs ?? null
          }))
        }
      }
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
