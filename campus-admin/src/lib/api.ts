const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorData}`);
      }

      return response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async loginAdmin(email: string, password: string) {
    return this.request('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Event methods (Admin access - no auth middleware on these routes)
  async getEvents(collegeId?: string) {
    const query = collegeId ? `?collegeId=${collegeId}` : '';
    return this.request(`/events${query}`);
  }

  async createEvent(eventData: any) {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async updateEvent(id: string, eventData: any) {
    return this.request(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  }

  async deleteEvent(id: string) {
    return this.request(`/events/${id}`, {
      method: 'DELETE',
    });
  }

  // College methods
  async getColleges() {
    return this.request('/colleges');
  }

  async createCollege(collegeData: any) {
    return this.request('/colleges', {
      method: 'POST',
      body: JSON.stringify(collegeData),
    });
  }

  // Student methods
  async getStudents(collegeId?: string) {
    const query = collegeId ? `?collegeId=${collegeId}` : '';
    return this.request(`/students${query}`);
  }

  // Reports methods
  async getEventPopularity(collegeId?: string) {
    const query = collegeId ? `?collegeId=${collegeId}` : '';
    return this.request(`/reports/event-popularity${query}`);
  }

  async getStudentParticipation(collegeId?: string) {
    const query = collegeId ? `?collegeId=${collegeId}` : '';
    return this.request(`/reports/student-participation${query}`);
  }

  async getTopActiveStudents(collegeId?: string) {
    const query = collegeId ? `?collegeId=${collegeId}` : '';
    return this.request(`/reports/top-active-students${query}`);
  }

  async getOverallStats(collegeId?: string) {
    const query = collegeId ? `?collegeId=${collegeId}` : '';
    return this.request(`/reports/overall-stats${query}`);
  }

  // Additional admin methods for complete backend integration
  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async getEventById(id: string) {
    return this.request(`/events/${id}`);
  }

  async getRegistrations(eventId?: string, studentId?: string) {
    if (eventId) {
      return this.request(`/registrations/event/${eventId}`);
    }
    if (studentId) {
      return this.request(`/registrations/student/${studentId}`);
    }
    return this.request('/registrations');
  }

  async getAttendance(eventId?: string) {
    if (eventId) {
      return this.request(`/attendance/event/${eventId}`);
    }
    return this.request('/attendance');
  }

  async getFeedback(eventId?: string) {
    if (eventId) {
      return this.request(`/feedback/event/${eventId}`);
    }
    return this.request('/feedback');
  }
}

export const api = new ApiClient();
