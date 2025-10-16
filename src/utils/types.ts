import { Tweet } from '@/domain/entities';

export type PaginatedLikesResponse = {
  total: number;
  page: number;
  pageSize: number;
  items: Tweet[];
};

export type StatsResponse = {
  topAuthors: Array<{
    author: {
      id: string;
      name: string;
      username: string;
      profileImageUrl: string | null;
      verified: boolean;
    } | null;
    likes: number;
    tweets: number;
  }>;
  mediaDistribution: Array<{ type: string; count: number }>;
  timeline: Array<{ date: string; likes: number }>;
  topHashtags: Array<{ tag: string; count: number }>;
};
