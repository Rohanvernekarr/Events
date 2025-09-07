'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { EventStats } from '@/types';

interface EventPopularityChartProps {
  data: EventStats[];
}

export default function EventPopularityChart({ data }: EventPopularityChartProps) {
  const chartData = data.map(event => ({
    name: event.title.length > 15 ? event.title.substring(0, 15) + '...' : event.title,
    fullName: event.title,
    registrations: event.totalRegistrations,
    attendance: event.totalAttendance,
    category: event.category
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="font-medium">{data.fullName}</p>
          <p className="text-sm text-gray-600">{data.category}</p>
          <p className="text-blue-600">
            <span className="font-medium">Registrations:</span> {data.registrations}
          </p>
          <p className="text-green-600">
            <span className="font-medium">Attendance:</span> {data.attendance}
          </p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p>No event data available</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          angle={-45}
          textAnchor="end"
          height={80}
          fontSize={12}
        />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="registrations" fill="#3B82F6" name="Registrations" />
        <Bar dataKey="attendance" fill="#10B981" name="Attendance" />
      </BarChart>
    </ResponsiveContainer>
  );
}
