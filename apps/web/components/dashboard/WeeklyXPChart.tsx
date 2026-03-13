'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface WeeklyXPChartProps {
  data: number[];
}

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function WeeklyXPChart({ data }: WeeklyXPChartProps) {
  const today = new Date().getDay();
  const todayIndex = today === 0 ? 6 : today - 1;

  const chartData = dayLabels.map((day, i) => ({
    day,
    xp: data[i] ?? 0,
    isToday: i === todayIndex,
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Weekly XP</h3>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: '#1F2937',
              border: 'none',
              borderRadius: '8px',
              color: '#F9FAFB',
              fontSize: '12px',
            }}
            formatter={(value) => [`${value} XP`, '']}
          />
          <Bar dataKey="xp" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.isToday ? '#6C63FF' : entry.xp > 0 ? '#A5A0FF' : '#E5E7EB'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
        Total this week: <span className="font-bold text-primary-500">{data.reduce((a, b) => a + b, 0)} XP</span>
      </div>
    </div>
  );
}
