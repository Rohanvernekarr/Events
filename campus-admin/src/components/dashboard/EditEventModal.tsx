'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { College, Event } from '@/types';

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  event: Event;
  colleges: College[];
}

export default function EditEventModal({
  isOpen,
  onClose,
  onSubmit,
  event,
  colleges
}: EditEventModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    venue: '',
    category: 'WORKSHOP',
    maxCapacity: '',
    allowOtherColleges: false,
    collegeId: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    { value: 'WORKSHOP', label: 'Workshop' },
    { value: 'SEMINAR', label: 'Seminar' },
    { value: 'FEST', label: 'Fest' },
    { value: 'HACKATHON', label: 'Hackathon' },
    { value: 'TECH_TALK', label: 'Tech Talk' }
  ];

  useEffect(() => {
    if (event && isOpen) {
      // Format date for datetime-local input
      const eventDate = new Date(event.date);
      const formattedDate = eventDate.toISOString().slice(0, 16);
      
      setFormData({
        title: event.title,
        description: event.description || '',
        date: formattedDate,
        venue: event.venue,
        category: event.category,
        maxCapacity: event.maxCapacity?.toString() || '',
        allowOtherColleges: event.allowOtherColleges || false,
        collegeId: event.collegeId
      });
    }
  }, [event, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.venue.trim()) newErrors.venue = 'Venue is required';
    if (!formData.collegeId) newErrors.collegeId = 'College is required';

    // Validate capacity if provided
    if (formData.maxCapacity && parseInt(formData.maxCapacity) <= 0) {
      newErrors.maxCapacity = 'Capacity must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        maxCapacity: formData.maxCapacity ? parseInt(formData.maxCapacity) : null
      };
      await onSubmit(submitData);
      setErrors({});
    } catch (error) {
      console.error('Failed to update event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto text-zinc-700">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold leading-6 text-gray-900">
              Edit Event
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Update event information
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Event Title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  error={errors.title}
                  placeholder="Enter event title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  College
                </label>
                <select
                  className={`block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 ${
                    errors.collegeId ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                  value={formData.collegeId}
                  onChange={(e) => handleInputChange('collegeId', e.target.value)}
                  required
                >
                  <option value="">Select College</option>
                  {colleges.map(college => (
                    <option key={college.id} value={college.id}>
                      {college.name}
                    </option>
                  ))}
                </select>
                {errors.collegeId && <p className="text-sm text-red-600 mt-1">{errors.collegeId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Date & Time"
                type="datetime-local"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                error={errors.date}
                required
              />

              <Input
                label="Venue"
                value={formData.venue}
                onChange={(e) => handleInputChange('venue', e.target.value)}
                error={errors.venue}
                placeholder="Enter venue location"
                required
              />

              <Input
                label="Max Capacity (Optional)"
                type="number"
                value={formData.maxCapacity}
                onChange={(e) => handleInputChange('maxCapacity', e.target.value)}
                error={errors.maxCapacity}
                placeholder="Enter maximum capacity"
                min="1"
              />

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter event description"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.allowOtherColleges}
                    onChange={(e) => setFormData(prev => ({ ...prev, allowOtherColleges: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Allow students from other colleges to register
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Event'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
