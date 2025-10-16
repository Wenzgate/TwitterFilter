'use client';

import { ResponsiveContainer, Tooltip, Treemap } from 'recharts';
import { StatsResponse } from '@/utils/types';

export function TopHashtagsChart({ data }: { data: StatsResponse['topHashtags'] }) {
  const chartData = data.map((item) => ({ name: `#${item.tag}`, size: item.count }));
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={chartData}
          dataKey="size"
          aspectRatio={4 / 3}
          stroke="#0f172a"
          fill="#0ea5e9"
        >
          <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a' }} />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}
