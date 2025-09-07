import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:3001/api';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = await this.getAuthToken();
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async register(name: string, email: string) {
    return this.request('/students/register', {
      method: 'POST',
      body: JSON.stringify({ name, email }),
    });
  }

  async login(email: string) {
    return this.request('/students/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async logout() {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('studentData');
  }

  // Events
  async getEvents() {
    return this.request('/students/me/events');
  }

  async registerForEvent(eventId: string) {
    return this.request(`/students/events/${eventId}/register`, {
      method: 'POST',
    });
  }

  async markAttendance(eventId: string) {
    return this.request(`/students/events/${eventId}/attendance`, {
      method: 'POST',
    });
  }

  async submitFeedback(eventId: string, rating: number, comments?: string) {
    return this.request(`/students/events/${eventId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ rating, comments }),
    });
  }

  // Storage helpers
  async saveAuthData(token: string, student: any) {
    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('studentData', JSON.stringify(student));
  }

  async getStoredStudent() {
    try {
      const studentData = await AsyncStorage.getItem('studentData');
      return studentData ? JSON.parse(studentData) : null;
    } catch (error) {
      console.error('Error getting stored student:', error);
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAuthToken();
    return !!token;
  }
}

export const api = new ApiClient(API_BASE_URL);
