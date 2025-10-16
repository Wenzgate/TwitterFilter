import { Author, Media, Tweet } from './entities';
import { TwitterLikeResponse } from '@/infrastructure/twitter/types';

const TWITTER_URL = 'https://twitter.com';

export function mapTwitterResponseToDomain(payload: TwitterLikeResponse): Tweet[] {
  const mediaMap = new Map(payload.includes?.media?.map((media) => [media.media_key, media]) ?? []);
  const userMap = new Map(payload.includes?.users?.map((user) => [user.id, user]) ?? []);

  return (
    payload.data?.
      filter((tweet) => tweet.attachments?.media_keys?.length)
      .map<Tweet>((tweet) => {
        const author = userMap.get(tweet.author_id ?? '');
        const hashtags = tweet.entities?.hashtags?.map((tag) => tag.tag.toLowerCase()) ?? [];
        const mentions = tweet.entities?.mentions?.map((mention) => mention.username.toLowerCase()) ?? [];
        const mediaItems: Media[] =
          tweet.attachments?.media_keys?.map((key) => {
            const raw = mediaMap.get(key);
            return {
              id: key,
              tweetId: tweet.id,
              type: (raw?.type as Media['type']) ?? 'photo',
              url: raw?.url ?? raw?.variants?.find((variant) => variant.content_type?.includes('mp4'))?.url ?? null,
              previewImageUrl: raw?.preview_image_url ?? raw?.url ?? null,
              width: raw?.width ?? null,
              height: raw?.height ?? null,
              durationMs: raw?.duration_ms ?? null,
              variants: raw?.variants?.map((variant) => ({
                contentType: variant.content_type,
                url: variant.url,
                bitrate: variant.bit_rate
              }))
            } satisfies Media;
          }) ?? [];

        const domainAuthor: Author | undefined = author
          ? {
              id: author.id,
              name: author.name,
              username: author.username,
              profileImageUrl: author.profile_image_url,
              verified: Boolean(author.verified)
            }
          : undefined;

        return {
          id: tweet.id,
          text: tweet.text ?? '',
          createdAt: new Date(tweet.created_at ?? Date.now()),
          metrics: {
            likeCount: tweet.public_metrics?.like_count ?? 0,
            retweetCount: tweet.public_metrics?.retweet_count ?? 0,
            replyCount: tweet.public_metrics?.reply_count ?? 0,
            quoteCount: tweet.public_metrics?.quote_count ?? 0
          },
          authorId: tweet.author_id ?? 'unknown',
          permalink: `${TWITTER_URL}/${author?.username ?? 'unknown'}/status/${tweet.id}`,
          hashtags,
          mentions,
          media: mediaItems,
          author: domainAuthor
        } satisfies Tweet;
      }) ?? []
  );
}
