import { describe, expect, it } from 'vitest';
import { mapTwitterResponseToDomain } from '@/domain/mappers';
import type { TwitterLikeResponse } from '@/infrastructure/twitter/types';

describe('mapTwitterResponseToDomain', () => {
  it('mappe correctement un tweet avec média', () => {
    const payload: TwitterLikeResponse = {
      data: [
        {
          id: '1',
          text: 'Hello world',
          created_at: '2024-05-01T10:00:00Z',
          author_id: '42',
          attachments: {
            media_keys: ['media1']
          },
          public_metrics: {
            like_count: 10,
            retweet_count: 2,
            reply_count: 1,
            quote_count: 0
          },
          entities: {
            hashtags: [{ tag: 'AI' }],
            mentions: [{ username: 'openai' }]
          }
        }
      ],
      includes: {
        media: [
          {
            media_key: 'media1',
            type: 'photo',
            url: 'https://pbs.twimg.com/media/media1.jpg',
            width: 1920,
            height: 1080
          }
        ],
        users: [
          {
            id: '42',
            name: 'Ada Lovelace',
            username: 'ada',
            profile_image_url: 'https://pbs.twimg.com/profile_images/ada.jpg',
            verified: true
          }
        ]
      }
    };

    const tweets = mapTwitterResponseToDomain(payload);
    expect(tweets).toHaveLength(1);
    expect(tweets[0]).toMatchObject({
      id: '1',
      hashtags: ['ai'],
      mentions: ['openai'],
      metrics: { likeCount: 10 },
      author: { username: 'ada', verified: true }
    });
  });
});
