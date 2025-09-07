'use client';

import { useEffect, useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { api } from '@/lib/api';
import { Event, College } from '@/types';
import CreateEventModal from '@/components/dashboard/CreateEventModal';
import EditEventModal from '@/components/dashboard/EditEventModal';
import ViewEventModal from '@/components/dashboard/ViewEventModal'; 
import DeleteConfirmModal from '@/components/dashboard/DeleteConfirmModal';
import RegistrationsModal from '@/components/dashboard/RegistrationsModal';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'upcoming', 'past'
  const [userCollegeId, setUserCollegeId] = useState<string | null>(null);
  
  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [showRegistrationsModal, setShowRegistrationsModal] = useState(false);
  const [selectedEventForRegistrations, setSelectedEventForRegistrations] = useState<Event | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const categories = ['WORKSHOP', 'SEMINAR', 'FEST', 'HACKATHON', 'TECH_TALK'];

  useEffect(() => {
    fetchData();
  }, [selectedCollege]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsData, collegesData] = await Promise.all([
        api.getEvents(selectedCollege || undefined),
        api.getColleges()
      ]);
      setEvents(eventsData);
      setColleges(collegesData);
      
      // Since backend now filters events by user's college, all events belong to user's college
      // We can get the college ID from any event or assume all events are editable
      if (eventsData.length > 0) {
        setUserCollegeId(eventsData[0].collegeId);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (eventData: any) => {
    try {
      await api.createEvent(eventData);
      await fetchData();
      setCreateModalOpen(false);
    } catch (error) {
      console.error('Failed to create event:', error);
      throw error;
    }
  };

  const handleUpdateEvent = async (eventData: any) => {
    if (!selectedEvent) return;
    try {
      await api.updateEvent(selectedEvent.id, eventData);
      await fetchData();
      setEditModalOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Failed to update event:', error);
      throw error;
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    try {
      await api.deleteEvent(selectedEvent.id);
      await fetchData();
      setDeleteModalOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  const handleCancelEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to cancel this event? This action cannot be undone.')) return;
    
    try {
      await api.request(`/events/${eventId}/cancel`, {
        method: 'PUT'
      });
      await fetchData();
    } catch (error) {
      console.error('Failed to cancel event:', error);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.venue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || event.category === selectedCategory;
    
    // Time filter logic
    const eventDate = new Date(event.date);
    const now = new Date();
    const matchesTime = timeFilter === 'all' || 
                       (timeFilter === 'upcoming' && eventDate > now) ||
                       (timeFilter === 'past' && eventDate <= now);
    
    return matchesSearch && matchesCategory && matchesTime;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if user can edit/delete this event (belongs to their college)
  const canEditEvent = (event: Event) => {
    return userCollegeId && event.collegeId === userCollegeId;
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded"></div>
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
          <h1 className="text-2xl font-semibold text-gray-900">Events Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Create and manage events across all colleges
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)} className="mt-4 sm:mt-0">
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input
            className='text-zinc-700'
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="block w-full rounded-md border text-zinc-700 border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
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
            <select
              className="block w-full rounded-md border text-zinc-700 border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.replace('_', ' ')}
                </option>
              ))}
            </select>
            <select
              className="block w-full rounded-md border text-zinc-700 border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <option value="all">All Events</option>
              <option value="upcoming">🟢 Upcoming Only</option>
              <option value="past">🔴 Past Events</option>
            </select>
            <div className="text-sm text-gray-500 flex items-center">
              {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedCategory || selectedCollege || timeFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by creating your first event'}
            </p>
            {!searchTerm && !selectedCategory && !selectedCollege && timeFilter === 'all' && (
              <Button onClick={() => setCreateModalOpen(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {event.title}
                    </h3>
                    <p className="text-sm text-gray-500">{event.college?.name}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    event.category === 'WORKSHOP' ? 'bg-blue-100 text-blue-800' :
                    event.category === 'SEMINAR' ? 'bg-green-100 text-green-800' :
                    event.category === 'FEST' ? 'bg-purple-100 text-purple-800' :
                    event.category === 'HACKATHON' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {event.category.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {event.description || 'No description provided'}
                  </p>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>📅 {formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>📍 {event.venue}</span>
                  </div>
                  {event.maxCapacity && (
                    <div className="flex items-center text-sm text-gray-500">
                      <span>👥 Max: {event.maxCapacity}</span>
                      {event._count && (
                        <span className="ml-2">• Registered: {event._count.registrations}</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedEvent(event);
                        setViewModalOpen(true);
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="View Details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedEventForRegistrations(event);
                        setShowRegistrationsModal(true);
                      }}
                      className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                      title="View Registrations"
                    >
                      👥
                    </button>
                    {canEditEvent(event) && event.status !== 'CANCELLED' && (
                      <button
                        onClick={() => {
                          setSelectedEvent(event);
                          setEditModalOpen(true);
                        }}
                        className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
                        title="Edit Event"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    )}
                    {canEditEvent(event) && event.status !== 'CANCELLED' && new Date(event.date) > new Date() && (
                      <button
                        onClick={() => handleCancelEvent(event.id)}
                        className="p-1 text-gray-400 hover:text-orange-600 transition-colors"
                        title="Cancel Event"
                      >
                        ❌
                      </button>
                    )}
                    {canEditEvent(event) && (
                      <button
                        onClick={() => {
                          setSelectedEvent(event);
                          setDeleteModalOpen(true);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete Event"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {event.status === 'CANCELLED' ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        ❌ Cancelled
                      </span>
                    ) : new Date(event.date) > new Date() ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        🟢 Upcoming
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        🔴 Past
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateEventModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateEvent}
      />

      {selectedEvent && (
        <>
          <EditEventModal
            isOpen={editModalOpen}
            onClose={() => {
              setEditModalOpen(false);
              setSelectedEvent(null);
            }}
            onSubmit={handleUpdateEvent}
            event={selectedEvent}
            colleges={colleges}
          />

          <ViewEventModal
            isOpen={viewModalOpen}
            onClose={() => {
              setViewModalOpen(false);
              setSelectedEvent(null);
            }}
            event={selectedEvent}
          />

          <DeleteConfirmModal
            isOpen={deleteModalOpen}
            onClose={() => {
              setDeleteModalOpen(false);
              setSelectedEvent(null);
            }}
            onConfirm={handleDeleteEvent}
            eventTitle={selectedEvent.title}
          />
        </>
      )}

      {/* Registrations Modal */}
      {selectedEventForRegistrations && (
        <RegistrationsModal
          isOpen={showRegistrationsModal}
          onClose={() => {
            setShowRegistrationsModal(false);
            setSelectedEventForRegistrations(null);
          }}
          event={selectedEventForRegistrations}
        />
      )}
    </div>
  );
}
