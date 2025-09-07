'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, UserIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { Registration, Event } from '@/types';

interface RegistrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
}

export default function RegistrationsModal({ isOpen, onClose, event }: RegistrationsModalProps) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);
  const [duplicateWarnings, setDuplicateWarnings] = useState<string[]>([]);
  const [feedbackReminders, setFeedbackReminders] = useState<string[]>([]);
  const [sendingReminders, setSendingReminders] = useState(false);

  useEffect(() => {
    if (isOpen && event) {
      fetchRegistrations();
    }
  }, [isOpen, event]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const data = await api.request(`/events/${event.id}/registrations`);
      setRegistrations(data);
      
      // Check for potential duplicates (same student registered multiple times)
      const studentEmails = data.map((reg: Registration) => reg.student.email);
      const duplicates = studentEmails.filter((email: string, index: number) => studentEmails.indexOf(email) !== index);
      setDuplicateWarnings(duplicates);

      // Check for missing feedback from attended students (only for past events)
      const eventDate = new Date(event.date);
      const now = new Date();
      if (eventDate < now) {
        const attendedWithoutFeedback = data
          .filter((reg: Registration) => reg.attendance && !reg.feedback)
          .map((reg: Registration) => reg.student.email);
        setFeedbackReminders(attendedWithoutFeedback);
      }
    } catch (error) {
      console.error('Failed to fetch registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendFeedbackReminders = async () => {
    try {
      setSendingReminders(true);
      await api.request(`/events/${event.id}/send-feedback-reminders`, {
        method: 'POST',
      });
      alert('Feedback reminders sent successfully!');
    } catch (error) {
      console.error('Failed to send feedback reminders:', error);
      alert('Failed to send feedback reminders. Please try again.');
    } finally {
      setSendingReminders(false);
    }
  };

  const handleMarkAttendance = async (registrationId: string) => {
    try {
      await api.request(`/registrations/${registrationId}/attendance`, {
        method: 'POST'
      });
      await fetchRegistrations();
    } catch (error) {
      console.error('Failed to mark attendance:', error);
    }
  };

  const handleRemoveRegistration = async (registrationId: string) => {
    if (!confirm('Are you sure you want to remove this registration?')) return;
    
    try {
      await api.request(`/registrations/${registrationId}`, {
        method: 'DELETE'
      });
      await fetchRegistrations();
    } catch (error) {
      console.error('Failed to remove registration:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500"
              onClick={onClose}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold leading-6 text-gray-900">
              Event Registrations
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {event.title} - {formatDate(event.date)}
            </p>
            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
              <span>📍 {event.venue}</span>
              <span>👥 {registrations.length} registered</span>
              {event.maxCapacity && (
                <span>📊 {Math.round((registrations.length / event.maxCapacity) * 100)}% capacity</span>
              )}
            </div>
          </div>

          {/* Duplicate Warnings */}
          {duplicateWarnings.length > 0 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Duplicate Registrations Detected
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>The following students appear to be registered multiple times:</p>
                    <ul className="list-disc list-inside mt-1">
                      {duplicateWarnings.map((email, index) => (
                        <li key={index}>{email}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {feedbackReminders.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Missing Feedback
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>The following students attended but haven't provided feedback:</p>
                    <ul className="list-disc list-inside mt-1">
                      {feedbackReminders.map((email, index) => (
                        <li key={index}>{email}</li>
                      ))}
                    </ul>
                    <p className="mt-2 text-xs">Consider sending feedback reminders to improve event evaluation.</p>
                    <div className="mt-3">
                      <Button
                        size="sm"
                        onClick={handleSendFeedbackReminders}
                        disabled={sendingReminders}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {sendingReminders ? 'Sending...' : 'Send Feedback Reminders'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : registrations.length === 0 ? (
            <div className="text-center py-8">
              <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No registrations yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Students haven't registered for this event yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{registrations.length}</div>
                      <div className="text-sm text-gray-500">Total Registered</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {registrations.filter(r => r.attendance).length}
                      </div>
                      <div className="text-sm text-gray-500">Attended</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {registrations.filter(r => r.feedback).length}
                      </div>
                      <div className="text-sm text-gray-500">Feedback Given</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {registrations.filter(r => !r.feedback && r.attendance).length}
                      </div>
                      <div className="text-sm text-gray-500">Missing Feedback</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Registrations List */}
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        College
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registered
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Feedback
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {registrations.map((registration) => (
                      <tr key={registration.id} className={duplicateWarnings.includes(registration.student.email) ? 'bg-yellow-50' : ''}>
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {registration.student.college?.name || 'Unknown'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(registration.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {registration.attendance ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircleIcon className="w-4 h-4 mr-1" />
                              Attended
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              <XCircleIcon className="w-4 h-4 mr-1" />
                              Registered
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {registration.feedback ? (
                            <div className="text-sm">
                              <div className="text-yellow-500">
                                {'★'.repeat(registration.feedback.rating)}{'☆'.repeat(5 - registration.feedback.rating)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {registration.feedback.comments ? 'With comments' : 'Rating only'}
                              </div>
                            </div>
                          ) : registration.attendance ? (
                            <span className="text-xs text-orange-600 font-medium">Missing Feedback</span>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            {!registration.attendance && new Date(event.date) <= new Date() && (
                              <Button
                                size="sm"
                                onClick={() => handleMarkAttendance(registration.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Mark Present
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleRemoveRegistration(registration.id)}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              Remove
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
