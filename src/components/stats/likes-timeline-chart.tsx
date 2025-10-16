'use client';

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { StatsResponse } from '@/utils/types';

export function LikesTimelineChart({ data }: { data: StatsResponse['timeline'] }) {
  const chartData = data.map((item) => ({
    date: item.date,
    likes: item.likes
  }));

  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="likes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1d9bf0" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#1d9bf0" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" stroke="#d4d4d8" />
          <YAxis stroke="#d4d4d8" />
          <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a' }} />
          <Area type="monotone" dataKey="likes" stroke="#1d9bf0" fill="url(#likes)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
