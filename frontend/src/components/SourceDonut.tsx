import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const data = [
  { name: 'Reddit', value: 400 },
  { name: 'Twitter/X', value: 300 },
  { name: 'News API', value: 300 },
  { name: 'HackerNews', value: 200 },
];

const COLORS = ['#FF4500', '#1DA1F2', '#8B5CF6', '#F97316'];

export default function SourceDonut() {
  return (
    <div className="w-full h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            animationDuration={1000}
            animationBegin={200}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#FAF9F6', border: '1px solid rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}
            itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#2C302E' }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            formatter={(value) => <span className="text-xs text-text-muted ml-1">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
