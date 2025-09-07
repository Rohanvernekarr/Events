'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { EventStats } from '@/types';

interface AttendanceChartProps {
  data: EventStats[];
}

export default function AttendanceChart({ data }: AttendanceChartProps) {
  const chartData = data.map(event => ({
    name: event.title.length > 12 ? event.title.substring(0, 12) + '...' : event.title,
    fullName: event.title,
    attendanceRate: event.attendancePercentage,
    registrations: event.totalRegistrations,
    attendance: event.totalAttendance
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="font-medium">{data.fullName}</p>
          <p className="text-green-600">
            <span className="font-medium">Attendance Rate:</span> {data.attendanceRate}%
          </p>
          <p className="text-gray-600 text-sm">
            {data.attendance}/{data.registrations} attended
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
          <div className="text-4xl mb-2">📈</div>
          <p>No attendance data available</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          angle={-45}
          textAnchor="end"
          height={80}
          fontSize={12}
        />
        <YAxis domain={[0, 100]} />
        <Tooltip content={<CustomTooltip />} />
        <Line 
          type="monotone" 
          dataKey="attendanceRate" 
          stroke="#10B981" 
          strokeWidth={3}
          dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
