'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Event } from '@/types';
import { api } from '@/lib/api';

interface ViewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
}

interface Registration {
  id: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
  registeredAt: string;
  attendance?: {
    id: string;
    checkedInAt: string;
  };
  feedback?: {
    id: string;
    rating: number;
    comments: string;
  };
}

export default function ViewEventModal({ isOpen, onClose, event }: ViewEventModalProps) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && event) {
      fetchRegistrations();
    }
  }, [isOpen, event]);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const data = await api.request(`/registrations/event/${event.id}`);
      setRegistrations(data);
    } catch (error) {
      console.error('Failed to fetch registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const attendedCount = registrations.filter(reg => reg.attendance).length;
  const feedbackCount = registrations.filter(reg => reg.feedback).length;
  const averageRating = feedbackCount > 0
    ? registrations
        .filter(reg => reg.feedback)
        .reduce((sum, reg) => sum + (reg.feedback?.rating || 0), 0) / feedbackCount
    : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
          <div className="mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold leading-6 text-gray-900">
                  {event.title}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {event.college?.name}
                </p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                event.category === 'WORKSHOP' ? 'bg-blue-100 text-blue-800' :
                event.category === 'SEMINAR' ? 'bg-green-100 text-green-800' :
                event.category === 'FEST' ? 'bg-purple-100 text-purple-800' :
                event.category === 'HACKATHON' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {event.category.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Event Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <h4 className="text-lg font-medium">Event Information</h4>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Date & Time</dt>
                      <dd className="text-sm text-gray-900">{formatDate(event.date)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Venue</dt>
                      <dd className="text-sm text-gray-900">{event.venue}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Max Capacity</dt>
                      <dd className="text-sm text-gray-900">
                        {event.maxCapacity ? `${event.maxCapacity} people` : 'Unlimited'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="text-sm text-gray-900">
                        {new Date(event.date) > new Date() ? (
                          <span className="text-green-600">🟢 Upcoming</span>
                        ) : (
                          <span className="text-red-600">🔴 Completed</span>
                        )}
                      </dd>
                    </div>
                  </dl>
                  {event.description && (
                    <div className="mt-4">
                      <dt className="text-sm font-medium text-gray-500 mb-2">Description</dt>
                      <dd className="text-sm text-gray-900">{event.description}</dd>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Registrations List */}
              <Card>
                <CardHeader>
                  <h4 className="text-lg font-medium">
                    Registered Students ({registrations.length})
                  </h4>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-4">Loading registrations...</div>
                  ) : registrations.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No students registered yet
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Student
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Registered
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Attendance
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Feedback
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {registrations.map((registration) => (
                            <tr key={registration.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {registration.student.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {registration.student.email}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(registration.registeredAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {registration.attendance ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    ✅ Present
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    ⭕ Absent
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {registration.feedback ? (
                                  <div className="flex items-center">
                                    <span className="text-yellow-400">
                                      {'★'.repeat(registration.feedback.rating)}
                                    </span>
                                    <span className="ml-1 text-sm text-gray-500">
                                      ({registration.feedback.rating}/5)
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-400">No feedback</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Statistics */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <h4 className="text-lg font-medium">Statistics</h4>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Total Registrations</span>
                      <span className="text-lg font-semibold text-gray-900">
                        {registrations.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Attendance</span>
                      <span className="text-lg font-semibold text-gray-900">
                        {attendedCount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Attendance Rate</span>
                      <span className="text-lg font-semibold text-gray-900">
                        {registrations.length > 0
                          ? Math.round((attendedCount / registrations.length) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Feedbacks</span>
                      <span className="text-lg font-semibold text-gray-900">
                        {feedbackCount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Average Rating</span>
                      <span className="text-lg font-semibold text-gray-900">
                        {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
                        {averageRating > 0 && <span className="text-yellow-400 ml-1">★</span>}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {event.maxCapacity && (
                <Card>
                  <CardHeader>
                    <h4 className="text-lg font-medium">Capacity</h4>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Registered</span>
                        <span>{registrations.length}/{event.maxCapacity}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min((registrations.length / event.maxCapacity) * 100, 100)}%`
                          }}
                        />
                      </div>
                      <div className="text-xs text-gray-500">
                        {event.maxCapacity - registrations.length > 0
                          ? `${event.maxCapacity - registrations.length} spots remaining`
                          : 'Event is full'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
