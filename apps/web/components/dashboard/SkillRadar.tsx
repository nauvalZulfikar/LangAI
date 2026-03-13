'use client';

import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';

interface SkillRadarProps {
  skills: {
    vocabulary: number;
    grammar: number;
    listening: number;
    speaking: number;
    reading: number;
    writing: number;
  };
}

export function SkillRadar({ skills }: SkillRadarProps) {
  const data = [
    { skill: 'Vocabulary', value: skills.vocabulary },
    { skill: 'Grammar', value: skills.grammar },
    { skill: 'Listening', value: skills.listening },
    { skill: 'Speaking', value: skills.speaking },
    { skill: 'Reading', value: skills.reading },
    { skill: 'Writing', value: skills.writing },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Skill Breakdown</h3>
      <ResponsiveContainer width="100%" height={200}>
        <RadarChart data={data}>
          <PolarGrid stroke="#E5E7EB" />
          <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
          <Radar
            name="Skills"
            dataKey="value"
            stroke="#6C63FF"
            fill="#6C63FF"
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
