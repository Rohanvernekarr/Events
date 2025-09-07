export interface College {
    id: string;
    name: string;
    emailDomain: string;
    createdAt: string;
    updatedAt: string;
    _count?: {
      students: number;
      events: number;
    };
  }
  
  export interface Student {
    id: string;
    name: string;
    email: string;
    isVerified: boolean;
    collegeId: string;
    college: College;
    createdAt: string;
    updatedAt: string;
    _count?: {
      registrations: number;
    };
  }
  
  export interface Event {
    id: string;
    title: string;
    description?: string;
    date: string;
    venue: string;
    category: 'WORKSHOP' | 'SEMINAR' | 'FEST' | 'HACKATHON' | 'TECH_TALK';
    maxCapacity?: number;
    status?: 'ACTIVE' | 'CANCELLED' | 'COMPLETED';
    allowOtherColleges?: boolean;
    collegeId: string;
    college: College;
    createdAt: string;
    updatedAt: string;
    _count?: {
      registrations: number;
    };
  }

  export interface Registration {
    id: string;
    studentId: string;
    eventId: string;
    student: Student;
    event: Event;
    createdAt: string;
    attendance?: Attendance;
    feedback?: Feedback;
  }

  export interface Attendance {
    id: string;
    registrationId: string;
    createdAt: string;
  }

  export interface Feedback {
    id: string;
    registrationId: string;
    rating: number;
    comments?: string;
    createdAt: string;
  }
  
  export interface EventStats {
    id: string;
    title: string;
    date: string;
    venue: string;
    category: string;
    college: string;
    totalRegistrations: number;
    totalAttendance: number;
    attendancePercentage: number;
    averageRating: number;
    totalFeedbacks: number;
  }
  
  export interface StudentStats {
    id: string;
    name: string;
    email: string;
    college: string;
    totalRegistrations: number;
    totalAttendance: number;
    attendanceRate: number;
  }
  