'use client';

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { StatsResponse } from '@/utils/types';

export function TopAuthorsChart({ data }: { data: StatsResponse['topAuthors'] }) {
  const chartData = data.map((item) => ({
    name: item.author?.username ?? item.author?.name ?? 'Inconnu',
    likes: item.likes
  }));

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <XAxis dataKey="name" stroke="#d4d4d8" angle={-20} textAnchor="end" height={70} interval={0} />
          <YAxis stroke="#d4d4d8" />
          <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a' }} />
          <Bar dataKey="likes" fill="#1d9bf0" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
