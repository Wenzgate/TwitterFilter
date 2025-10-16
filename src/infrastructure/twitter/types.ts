export type TwitterLikeResponse = {
  data?: Array<{
    id: string;
    text?: string;
    created_at?: string;
    author_id?: string;
    attachments?: {
      media_keys?: string[];
    };
    public_metrics?: {
      like_count?: number;
      retweet_count?: number;
      reply_count?: number;
      quote_count?: number;
    };
    entities?: {
      hashtags?: { tag: string }[];
      mentions?: { username: string }[];
    };
  }>;
  includes?: {
    media?: Array<{
      media_key: string;
      type: 'photo' | 'video' | 'animated_gif';
      url?: string;
      preview_image_url?: string;
      width?: number;
      height?: number;
      duration_ms?: number;
      variants?: Array<{
        bit_rate?: number;
        content_type?: string;
        url?: string;
      }>;
    }>;
    users?: Array<{
      id: string;
      name: string;
      username: string;
      profile_image_url?: string;
      verified?: boolean;
    }>;
  };
  meta?: {
    result_count?: number;
    next_token?: string;
    newest_id?: string;
  };
};

export type TwitterLikedTweetsParams = {
  userId: string;
  paginationToken?: string;
  sinceId?: string;
  maxResults?: number;
};
