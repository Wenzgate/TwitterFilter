export type TweetPublicMetrics = {
  likeCount: number;
  retweetCount: number;
  replyCount: number;
  quoteCount: number;
};

export type MediaVariant = {
  contentType?: string | null;
  url?: string | null;
  bitrate?: number | null;
};

export type Media = {
  id: string;
  tweetId: string;
  type: 'photo' | 'video' | 'animated_gif';
  url?: string | null;
  previewImageUrl?: string | null;
  width?: number | null;
  height?: number | null;
  durationMs?: number | null;
  variants?: MediaVariant[];
};

export type Author = {
  id: string;
  name: string;
  username: string;
  profileImageUrl?: string | null;
  verified: boolean;
};

export type Tweet = {
  id: string;
  text: string;
  createdAt: Date;
  metrics: TweetPublicMetrics;
  authorId: string;
  permalink: string;
  hashtags: string[];
  mentions: string[];
  media: Media[];
  author?: Author;
};

export type SyncCursor = {
  nextToken?: string | null;
  sinceId?: string | null;
  syncedAt: Date;
};
