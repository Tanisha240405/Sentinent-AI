import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', pos: 65, neg: 20, neu: 15 },
  { name: 'Tue', pos: 59, neg: 25, neu: 16 },
  { name: 'Wed', pos: 80, neg: 10, neu: 10 },
  { name: 'Thu', pos: 81, neg: 15, neu: 4 },
  { name: 'Fri', pos: 56, neg: 30, neu: 14 },
  { name: 'Sat', pos: 55, neg: 35, neu: 10 },
  { name: 'Sun', pos: 70, neg: 20, neu: 10 },
];

export default function SentimentTimeline() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6EE7B7" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#6EE7B7" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorNeg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F87171" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#F87171" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorNeu" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#879EC6" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#879EC6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#8c8c8c" strokeOpacity={0.1} vertical={false} />
        <XAxis dataKey="name" stroke="#8c8c8c" strokeOpacity={0.5} tick={{fill: '#8c8c8c', fontSize: 12}} tickLine={false} axisLine={false} />
        <YAxis stroke="#8c8c8c" strokeOpacity={0.5} tick={{fill: '#8c8c8c', fontSize: 12}} tickLine={false} axisLine={false} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#FAF9F6', border: '1px solid rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}
          itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
          labelStyle={{ color: '#2C302E', marginBottom: '4px' }}
        />
        <Area type="monotone" dataKey="pos" stroke="#6EE7B7" strokeWidth={2} fillOpacity={1} fill="url(#colorPos)" name="Positive" animationDuration={1200} />
        <Area type="monotone" dataKey="neu" stroke="#879EC6" strokeWidth={2} fillOpacity={1} fill="url(#colorNeu)" name="Neutral" animationDuration={1200} />
        <Area type="monotone" dataKey="neg" stroke="#F87171" strokeWidth={2} fillOpacity={1} fill="url(#colorNeg)" name="Negative" animationDuration={1200} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
