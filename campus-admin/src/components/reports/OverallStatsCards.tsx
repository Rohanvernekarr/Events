'use client';

import { Card, CardContent } from '@/components/ui/Card';

interface OverallStatsCardsProps {
  stats: {
    totalStudents: number;
    totalEvents: number;
    totalRegistrations: number;
    totalAttendance: number;
    totalFeedbacks: number;
    overallAttendanceRate: number;
  } | null;
}

export default function OverallStatsCards({ stats }: OverallStatsCardsProps) {
  if (!stats) return null;

  const statCards = [
    { 
      name: 'Total Students', 
      value: stats.totalStudents || 0, 
      icon: '👥',
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    { 
      name: 'Total Events', 
      value: stats.totalEvents || 0, 
      icon: '📅',
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    { 
      name: 'Total Registrations', 
      value: stats.totalRegistrations || 0, 
      icon: '✍️',
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    { 
      name: 'Overall Attendance Rate', 
      value: `${stats.overallAttendanceRate || 0}%`, 
      icon: '📊',
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((item) => (
        <Card key={item.name} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${item.bg} p-3 rounded-lg`}>
                <span className="text-2xl">{item.icon}</span>
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {item.name}
                  </dt>
                  <dd className={`text-2xl font-bold ${item.color}`}>
                    {item.value}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
