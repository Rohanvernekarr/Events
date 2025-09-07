const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Test data
let adminToken = '';
let studentToken = '';
let collegeId = '';
let eventId = '';
let studentId = '';
let registrationId = '';

async function testEndpoint(method, url, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    console.log(`✅ ${method.toUpperCase()} ${url} - Status: ${response.status}`);
    return response.data;
  } catch (error) {
    console.log(`❌ ${method.toUpperCase()} ${url} - Error: ${error.response?.status} ${error.response?.statusText}`);
    if (error.response?.data) {
      console.log('   Error details:', error.response.data);
    }
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting API endpoint tests...\n');

  // 1. Test root endpoint
  console.log('=== Testing Root Endpoint ===');
  await testEndpoint('GET', '/../');

  // 2. Test colleges endpoints
  console.log('\n=== Testing Colleges Endpoints ===');
  
  // Get all colleges
  const colleges = await testEndpoint('GET', '/colleges');
  if (colleges && colleges.length > 0) {
    collegeId = colleges[0].id;
    console.log(`   Using college ID: ${collegeId}`);
  }

  // Create a new college
  const newCollege = await testEndpoint('POST', '/colleges', {
    name: 'Test University',
    emailDomain: '@test.edu'
  });

  // Get college by ID
  if (collegeId) {
    await testEndpoint('GET', `/colleges/${collegeId}`);
  }

  // 3. Test auth endpoints (without authentication middleware for now)
  console.log('\n=== Testing Auth Endpoints ===');
  
  // Admin login (will fail without proper credentials)
  const adminLogin = await testEndpoint('POST', '/auth/admin/login', {
    email: 'admin@admin.com',
    password: 'admin123'
  });

  if (adminLogin && adminLogin.token) {
    adminToken = adminLogin.token;
    console.log('   Admin token obtained');
  }

  // Student registration
  if (collegeId) {
    const studentReg = await testEndpoint('POST', '/auth/student/register', {
      name: 'Test Student',
      email: 'teststudent@mit.edu',
      collegeId: collegeId
    });
  }

  // 4. Test events endpoints
  console.log('\n=== Testing Events Endpoints ===');
  
  // Get all events (requires student auth)
  const events = await testEndpoint('GET', '/events', null, {
    Authorization: `Bearer ${studentToken}`
  });

  // Create event (requires admin auth)
  if (collegeId && adminToken) {
    const newEvent = await testEndpoint('POST', '/events', {
      title: 'Test Event',
      description: 'A test event',
      date: '2024-06-01T10:00:00Z',
      venue: 'Test Venue',
      category: 'WORKSHOP',
      maxCapacity: 50,
      collegeId: collegeId
    }, {
      Authorization: `Bearer ${adminToken}`
    });

    if (newEvent && newEvent.id) {
      eventId = newEvent.id;
      console.log(`   Using event ID: ${eventId}`);
    }
  }

  // Get event by ID
  if (eventId) {
    await testEndpoint('GET', `/events/${eventId}`);
    await testEndpoint('GET', `/events/${eventId}/capacity`);
  }

  // 5. Test students endpoints
  console.log('\n=== Testing Students Endpoints ===');
  
  // Get all students
  const students = await testEndpoint('GET', '/students');
  if (students && students.length > 0) {
    studentId = students[0].id;
    console.log(`   Using student ID: ${studentId}`);
  }

  // Get student by ID
  if (studentId) {
    await testEndpoint('GET', `/students/${studentId}`);
  }

  // 6. Test registrations endpoints
  console.log('\n=== Testing Registrations Endpoints ===');
  
  // Create registration
  if (studentId && eventId) {
    const registration = await testEndpoint('POST', '/registrations', {
      studentId: studentId,
      eventId: eventId
    });

    if (registration && registration.id) {
      registrationId = registration.id;
      console.log(`   Using registration ID: ${registrationId}`);
    }
  }

  // Get registrations
  await testEndpoint('GET', '/registrations');
  
  if (eventId) {
    await testEndpoint('GET', `/registrations/event/${eventId}`);
  }

  if (studentId) {
    await testEndpoint('GET', `/registrations/student/${studentId}`);
  }

  // 7. Test attendance endpoints
  console.log('\n=== Testing Attendance Endpoints ===');
  
  // Mark attendance
  if (registrationId) {
    await testEndpoint('POST', '/attendance', {
      registrationId: registrationId
    });
  }

  // Get attendance
  if (eventId) {
    await testEndpoint('GET', `/attendance/event/${eventId}`);
  }

  // 8. Test feedback endpoints
  console.log('\n=== Testing Feedback Endpoints ===');
  
  // Submit feedback
  if (registrationId) {
    await testEndpoint('POST', '/feedback', {
      registrationId: registrationId,
      rating: 5,
      comments: 'Great event!'
    });
  }

  // Get feedback
  if (eventId) {
    await testEndpoint('GET', `/feedback/event/${eventId}`);
  }

  // 9. Test reports endpoints
  console.log('\n=== Testing Reports Endpoints ===');
  
  await testEndpoint('GET', '/reports/event-popularity');
  await testEndpoint('GET', '/reports/student-participation');
  await testEndpoint('GET', '/reports/top-active-students');
  await testEndpoint('GET', '/reports/attendance-percentage');
  await testEndpoint('GET', '/reports/average-feedback');
  await testEndpoint('GET', '/reports/overall-stats');

  console.log('\n🏁 API endpoint testing completed!');
}

// Run the tests
runTests().catch(console.error);
