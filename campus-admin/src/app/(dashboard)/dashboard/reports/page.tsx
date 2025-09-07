'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { College, EventStats, StudentStats } from '@/types';
import EventPopularityChart from '@/components/reports/EventPopularityChart';
import StudentParticipationChart from '@/components/reports/StudentParticipationChart';
import AttendanceChart from '@/components/reports/AttendanceChart';
import TopActiveStudents from '@/components/reports/TopActiveStudents';
import OverallStatsCards from '@/components/reports/OverallStatsCards';

export default function ReportsPage() {
  const [eventStats, setEventStats] = useState<EventStats[]>([]);
  const [studentStats, setStudentStats] = useState<StudentStats[]>([]);
  const [topStudents, setTopStudents] = useState<StudentStats[]>([]);
  const [overallStats, setOverallStats] = useState<any>(null);
  const [colleges, setColleges] = useState<College[]>([]);
  const [selectedCollege, setSelectedCollege] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, [selectedCollege]);

  const fetchAllData = async () => {
    const isInitialLoad = loading;
    if (!isInitialLoad) setRefreshing(true);

    try {
      const collegeFilter = selectedCollege || undefined;
      
      const [
        eventPopularityData,
        studentParticipationData,
        topStudentsData,
        overallStatsData,
        collegesData
      ] = await Promise.all([
        api.getEventPopularity(collegeFilter),
        api.getStudentParticipation(collegeFilter),
        api.getTopActiveStudents(collegeFilter),
        api.getOverallStats(collegeFilter),
        colleges.length === 0 ? api.getColleges() : Promise.resolve(colleges)
      ]);

      setEventStats(eventPopularityData);
      setStudentStats(studentParticipationData);
      setTopStudents(topStudentsData);
      setOverallStats(overallStatsData);
      if (colleges.length === 0) setColleges(collegesData);
    } catch (error) {
      console.error('Failed to fetch reports data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchAllData();
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-80 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Analytics & Reports</h1>
          <p className="mt-2 text-sm text-gray-700">
            Comprehensive insights into event management and student participation
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <select
            className="rounded-md text-zinc-700 border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            value={selectedCollege}
            onChange={(e) => setSelectedCollege(e.target.value)}
          >
            <option value="">All Colleges</option>
            {colleges.map(college => (
              <option key={college.id} value={college.id}>
                {college.name}
              </option>
            ))}
          </select>
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            size="sm"
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Overall Stats Cards */}
      <OverallStatsCards stats={overallStats} />

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Popularity Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <h3 className="text-lg font-medium">📊 Event Popularity</h3>
            <p className="text-sm text-gray-500">Events ranked by total registrations</p>
          </CardHeader>
          <CardContent>
            <EventPopularityChart data={eventStats.slice(0, 10)} />
          </CardContent>
        </Card>

        {/* Attendance Rate Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <h3 className="text-lg font-medium">📈 Attendance Rates</h3>
            <p className="text-sm text-gray-500">Attendance percentage by event</p>
          </CardHeader>
          <CardContent>
            <AttendanceChart data={eventStats.slice(0, 8)} />
          </CardContent>
        </Card>

        {/* Student Participation Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <h3 className="text-lg font-medium">👥 Student Participation</h3>
            <p className="text-sm text-gray-500">Top 10 most active students</p>
          </CardHeader>
          <CardContent>
            <StudentParticipationChart data={studentStats.slice(0, 10)} />
          </CardContent>
        </Card>

        {/* Top Active Students */}
        <Card className="col-span-1">
          <CardHeader>
            <h3 className="text-lg font-medium">🏆 Top 3 Most Active Students</h3>
            <p className="text-sm text-gray-500">Students with highest attendance</p>
          </CardHeader>
          <CardContent>
            <TopActiveStudents data={topStudents} />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 gap-6">
        {/* Event Details Table */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">📅 Detailed Event Analytics</h3>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      College
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registrations
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {eventStats.slice(0, 15).map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {event.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {event.category} • {new Date(event.date).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {event.college}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {event.totalRegistrations}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {event.totalAttendance}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${event.attendancePercentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-900">
                            {event.attendancePercentage}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-yellow-400">
                            {'★'.repeat(Math.floor(event.averageRating))}
                          </span>
                          <span className="ml-1 text-sm text-gray-500">
                            ({event.averageRating}/5)
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
