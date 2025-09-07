'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { College } from '@/types';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export default function CreateEventModal({
  isOpen,
  onClose,
  onSubmit
}: CreateEventModalProps) {
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
  const [duplicateWarning, setDuplicateWarning] = useState('');

  const categories = [
    { value: 'WORKSHOP', label: 'Workshop' },
    { value: 'SEMINAR', label: 'Seminar' },
    { value: 'FEST', label: 'Fest' },
    { value: 'HACKATHON', label: 'Hackathon' },
    { value: 'TECH_TALK', label: 'Tech Talk' }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.venue.trim()) newErrors.venue = 'Venue is required';
    
    // Check if date is in the future (at least 1 hour from now)
    const eventDate = new Date(formData.date);
    const minDate = new Date();
    minDate.setHours(minDate.getHours() + 1);
    
    if (formData.date && eventDate <= minDate) {
      newErrors.date = 'Event date must be at least 1 hour in the future';
    }

    // Check if date is not too far in the future (max 2 years)
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 2);
    
    if (formData.date && eventDate > maxDate) {
      newErrors.date = 'Event date cannot be more than 2 years in the future';
    }

    // Validate capacity if provided
    if (formData.maxCapacity && parseInt(formData.maxCapacity) <= 0) {
      newErrors.maxCapacity = 'Capacity must be greater than 0';
    }

    if (formData.maxCapacity && parseInt(formData.maxCapacity) > 10000) {
      newErrors.maxCapacity = 'Capacity cannot exceed 10,000';
    }

    // Validate title length
    if (formData.title.trim().length > 100) {
      newErrors.title = 'Title cannot exceed 100 characters';
    }

    // Validate description length
    if (formData.description.length > 1000) {
      newErrors.description = 'Description cannot exceed 1000 characters';
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
        title: formData.title,
        description: formData.description,
        date: formData.date,
        venue: formData.venue,
        category: formData.category,
        maxCapacity: formData.maxCapacity ? parseInt(formData.maxCapacity) : null,
        allowOtherColleges: formData.allowOtherColleges
      };
      await onSubmit(submitData);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        date: '',
        venue: '',
        category: 'WORKSHOP',
        maxCapacity: '',
        allowOtherColleges: false,
        collegeId: ''
      });
      setErrors({});
    } catch (error) {
      console.error('Failed to create event:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkForDuplicates = async (title: string, date: string, venue: string) => {
    if (!title.trim() || !date || !venue.trim()) return;
    
    try {
      // In a real implementation, you would call an API to check for duplicates
      // For now, we'll simulate this check
      const eventDate = new Date(date);
      const sameDay = eventDate.toDateString();
      
      // Simple duplicate check simulation
      if (title.toLowerCase().includes('duplicate') || venue.toLowerCase().includes('duplicate')) {
        setDuplicateWarning(`⚠️ Similar event "${title}" might already exist at ${venue} on ${sameDay}`);
      } else {
        setDuplicateWarning('');
      }
    } catch (error) {
      console.error('Error checking for duplicates:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    const processedValue = field === 'allowOtherColleges' ? value === 'true' : value;
    setFormData(prev => ({ ...prev, [field]: processedValue }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Check for potential duplicates when key fields change
    if (field === 'title' || field === 'date' || field === 'venue') {
      const updatedData = { ...formData, [field]: value };
      checkForDuplicates(updatedData.title, updatedData.date, updatedData.venue);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold leading-6 text-gray-900">
              Create New Event
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Add a new event to the system
            </p>
          </div>

          {/* Duplicate Warning */}
          {duplicateWarning && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-800">{duplicateWarning}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-zinc-700">
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

              {/* College selection removed - admin can only create events for their own college */}

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

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowOtherColleges"
                  checked={formData.allowOtherColleges}
                  onChange={(e) => handleInputChange('allowOtherColleges', e.target.checked.toString())}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="allowOtherColleges" className="ml-2 block text-sm text-gray-700">
                  Allow students from other colleges to register
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                  <span className="text-xs text-gray-500 ml-1">
                    ({formData.description.length}/1000 characters)
                  </span>
                </label>
                <textarea
                  className={`block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 ${
                    errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter event description"
                  maxLength={1000}
                />
                {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
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
                {loading ? 'Creating...' : 'Create Event'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
