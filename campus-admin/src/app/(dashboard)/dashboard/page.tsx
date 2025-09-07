'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { api } from '@/lib/api';
import { Event } from '@/types';

interface OverallStats {
  totalStudents: number;
  totalEvents: number;
  totalRegistrations: number;
  totalAttendance: number;
  totalFeedbacks: number;
  overallAttendanceRate: number;
}

interface RecentActivity {
  id: string;
  type: 'registration' | 'event' | 'student';
  title: string;
  description: string;
  time: string;
  icon: string;
}

interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  registrations: number;
  maxCapacity: number;
  status: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<OverallStats | null>(null);
  const [upcomingEventsData, setUpcomingEventsData] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data from backend...');
        const [statsData, eventsData] = await Promise.all([
          api.getOverallStats(),
          api.getEvents()
        ]);
        console.log('Stats received:', statsData);
        console.log('Events received:', eventsData);
        
        setStats(statsData);
        
        // Filter and format upcoming events
        const now = new Date();
        const upcoming = eventsData
          .filter((event: Event) => new Date(event.date) > now)
          .sort((a: Event, b: Event) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 3)
          .map((event: Event) => ({
            id: event.id,
            title: event.title,
            date: new Date(event.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            registrations: event._count?.registrations || 0,
            maxCapacity: event.maxCapacity || 100,
            status: event.maxCapacity && event._count?.registrations 
              ? (event._count.registrations / event.maxCapacity > 0.8 ? 'Almost Full' : 'Open')
              : 'Open'
          }));
        
        setUpcomingEventsData(upcoming);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        // Set default stats if API fails
        setStats({
          totalStudents: 0,
          totalEvents: 0,
          totalRegistrations: 0,
          totalAttendance: 0,
          totalFeedbacks: 0,
          overallAttendanceRate: 0
        });
        setUpcomingEventsData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { 
      name: 'Active Students', 
      value: stats?.totalStudents || 0, 
      icon: '👥',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      change: '+12%',
      changeType: 'increase'
    },
    { 
      name: 'Live Events', 
      value: stats?.totalEvents || 0, 
      icon: '🎯',
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      change: '+8%',
      changeType: 'increase'
    },
    { 
      name: 'Event Registrations', 
      value: stats?.totalRegistrations || 0, 
      icon: '📝',
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      change: '+23%',
      changeType: 'increase'
    },
    { 
      name: 'Attendance Rate', 
      value: `${stats?.overallAttendanceRate || 0}%`, 
      icon: '📊',
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      change: '+5%',
      changeType: 'increase'
    },
    { 
      name: 'Total Attendance', 
      value: stats?.totalAttendance || 0, 
      icon: '✅',
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      change: '+18%',
      changeType: 'increase'
    },
    { 
      name: 'Feedback Received', 
      value: stats?.totalFeedbacks || 0, 
      icon: '💬',
      color: 'bg-pink-500',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600',
      change: '+15%',
      changeType: 'increase'
    },
  ];

  const recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'registration',
      title: 'New Student Registration',
      description: '5 new students registered today',
      time: '2 hours ago',
      icon: '👥'
    },
    {
      id: '2',
      type: 'event',
      title: 'Tech Workshop Created',
      description: 'AI & Machine Learning Workshop scheduled',
      time: '4 hours ago',
      icon: '🎯'
    },
    {
      id: '3',
      type: 'registration',
      title: 'High Registration Activity',
      description: '25 students registered for upcoming events',
      time: '6 hours ago',
      icon: '📝'
    }
  ];


  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campus Dashboard</h1>
          <p className="mt-2 text-lg text-gray-600">
            Welcome back! Here's what's happening on your campus today.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Last updated</p>
          <p className="text-sm font-medium text-gray-900">{new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((item) => (
          <Card key={item.name} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${item.bgColor}`}>
                      <span className="text-xl">{item.icon}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500 truncate">
                      {item.name}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {item.value}
                    </p>
                    <div className="flex items-center mt-2">
                      <span className={`text-xs font-medium ${item.textColor}`}>
                        {item.change}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">vs last month</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <h3 className="text-xl font-semibold text-gray-900">Quick Actions</h3>
            <p className="text-sm text-gray-500">Manage your campus efficiently</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <a
                href="/dashboard/events"
                className="flex items-center p-4 text-left bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-200 group"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg">📅</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-blue-900">Create New Event</p>
                  <p className="text-xs text-blue-700">Schedule workshops, seminars & more</p>
                </div>
              </a>
              
              <a
                href="/dashboard/students"
                className="flex items-center p-4 text-left bg-gradient-to-r from-green-50 to-green-100 rounded-lg hover:from-green-100 hover:to-green-200 transition-all duration-200 group"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg">👥</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-green-900">Manage Students</p>
                  <p className="text-xs text-green-700">View & verify student accounts</p>
                </div>
              </a>
              
              <a
                href="/dashboard/colleges"
                className="flex items-center p-4 text-left bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all duration-200 group"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg">🏫</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-purple-900">View Colleges</p>
                  <p className="text-xs text-purple-700">Browse registered institutions</p>
                </div>
              </a>
              
              <a
                href="/dashboard/reports"
                className="flex items-center p-4 text-left bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg hover:from-orange-100 hover:to-orange-200 transition-all duration-200 group"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg">📊</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-orange-900">Analytics & Reports</p>
                  <p className="text-xs text-orange-700">View detailed insights</p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <h3 className="text-xl font-semibold text-gray-900">Upcoming Events</h3>
            <p className="text-sm text-gray-500">Events happening soon</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEventsData.map((event: UpcomingEvent) => (
                <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">
                        {event.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">{event.date}</p>
                      <div className="flex items-center mt-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${(event.registrations / event.maxCapacity) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600 ml-2">
                          {event.registrations}/{event.maxCapacity}
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      event.status === 'Almost Full' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
            <p className="text-sm text-gray-500">Latest updates and notifications</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm">{activity.icon}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
