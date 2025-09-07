'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface CreateCollegeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export default function CreateCollegeModal({
  isOpen,
  onClose,
  onSubmit
}: CreateCollegeModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    emailDomain: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'College name is required';
    if (!formData.emailDomain.trim()) {
      newErrors.emailDomain = 'Email domain is required';
    } else if (!formData.emailDomain.startsWith('@')) {
      newErrors.emailDomain = 'Email domain must start with @';
    } else if (!formData.emailDomain.includes('.')) {
      newErrors.emailDomain = 'Email domain must include a valid domain extension';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
      
      // Reset form
      setFormData({
        name: '',
        emailDomain: ''
      });
      setErrors({});
    } catch (error) {
      console.error('Failed to create college:', error);
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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold leading-6 text-gray-900">
              Add New College
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Add a new college to the system
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="College Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={errors.name}
              placeholder="Enter college name"
              required
            />

            <Input
              label="Email Domain"
              value={formData.emailDomain}
              onChange={(e) => handleInputChange('emailDomain', e.target.value)}
              error={errors.emailDomain}
              placeholder="@example.edu"
              required
            />

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
                {loading ? 'Creating...' : 'Create College'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
