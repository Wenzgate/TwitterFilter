import { TwitterLikeResponse, TwitterLikedTweetsParams } from './types';
import { InMemoryCache } from '@/infrastructure/cache/in-memory-cache';
import { logger } from '@/server/logger';

const API_BASE_URL = 'https://api.twitter.com/2';
const DEFAULT_MAX_RESULTS = 100;

export class TwitterClient {
  private readonly cache = new InMemoryCache<TwitterLikeResponse>(60_000);

  constructor(private readonly options: { accessToken: string }) {}

  async fetchLikedTweets({ userId, paginationToken, sinceId, maxResults = DEFAULT_MAX_RESULTS }: TwitterLikedTweetsParams) {
    if (!this.options.accessToken) {
      logger.warn('Twitter access token missing, returning empty payload');
      return { data: [], meta: {} } satisfies TwitterLikeResponse;
    }

    const cacheKey = [userId, paginationToken, sinceId, maxResults].filter(Boolean).join(':');
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const searchParams = new URLSearchParams({
      'tweet.fields': 'created_at,public_metrics,entities',
      expansions: 'attachments.media_keys,author_id',
      'media.fields': 'url,preview_image_url,type,variants,duration_ms,width,height',
      'user.fields': 'name,username,profile_image_url,verified',
      max_results: String(Math.min(maxResults, 100))
    });

    if (paginationToken) searchParams.set('pagination_token', paginationToken);
    if (sinceId) searchParams.set('since_id', sinceId);

    const url = `${API_BASE_URL}/users/${userId}/liked_tweets?${searchParams.toString()}`;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.options.accessToken}`
        },
        cache: 'no-store'
      });

      if (response.status === 429) {
        const resetHeader = response.headers.get('x-rate-limit-reset');
        const reset = resetHeader ? Number(resetHeader) * 1000 : NaN;
        const waitMs = Number.isFinite(reset) ? Math.max(reset - Date.now(), 0) : (attempt + 1) * 1000;
        logger.warn({ waitMs }, 'Twitter rate limit hit, backing off');
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        continue;
      }

      if (!response.ok) {
        const text = await response.text();
        logger.error({ status: response.status, text }, 'Twitter API error');
        throw new Error(`Twitter API error: ${response.status}`);
      }

      const json = (await response.json()) as TwitterLikeResponse;
      this.cache.set(cacheKey, json);
      return json;
    }

    throw new Error('Rate limit exceeded');
  }
}
