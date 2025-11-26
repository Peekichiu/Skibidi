import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Activity } from '../types';
import { getActivitiesForChart } from '../utils/scheduler';

interface WorkloadChartProps {
  activities: Activity[];
}

const WorkloadChart: React.FC<WorkloadChartProps> = ({ activities }) => {
  const data = getActivitiesForChart(activities);

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center bg-gray-900 rounded-xl border border-gray-800 text-gray-500">
        No data to display
      </div>
    );
  }

  return (
    <div className="bg-gray-900 p-6 rounded-xl shadow-md border border-gray-800">
      <h3 className="text-lg font-semibold text-white mb-4">Daily Workload (Minutes)</h3>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis 
              dataKey="date" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: '#9CA3AF' }} // gray-400
            />
            <YAxis 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: '#9CA3AF' }} // gray-400
            />
            <Tooltip 
              cursor={{fill: '#374151'}} // gray-700
              contentStyle={{ 
                backgroundColor: '#1f2937', // gray-800 
                borderRadius: '8px', 
                border: '1px solid #374151', // gray-700
                color: '#fff',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)' 
              }}
              itemStyle={{ color: '#e5e7eb' }}
            />
            <Bar dataKey="load" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.load > 180 ? '#ef4444' : '#6366f1'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WorkloadChart;