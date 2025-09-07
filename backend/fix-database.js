const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Create .env file with SQLite database
const envContent = `# Database - SQLite for development
DATABASE_URL="file:./dev.db"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-here-change-in-production"

# Admin Credentials
ADMIN_EMAIL="admin@admin.com"
ADMIN_PASSWORD="admin123"

# Server Port
PORT=3001
`;

// Write .env file
fs.writeFileSync(path.join(__dirname, '.env'), envContent);
console.log('✅ Created .env file with SQLite database');

// Test database connection
async function testDatabase() {
  try {
    const prisma = new PrismaClient();
    
    console.log('🔍 Testing database connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected');
    
    // Create test data
    console.log('🌱 Creating test data...');
    
    // Clear existing data
    await prisma.attendance.deleteMany();
    await prisma.feedback.deleteMany();
    await prisma.registration.deleteMany();
    await prisma.event.deleteMany();
    await prisma.student.deleteMany();
    await prisma.college.deleteMany();
    
    // Create college
    const college = await prisma.college.create({
      data: {
        name: 'Test University',
        emailDomain: '@test.edu'
      }
    });
    
    // Create student
    const student = await prisma.student.create({
      data: {
        name: 'Test Student',
        email: 'student@test.edu',
        isVerified: true,
        collegeId: college.id
      }
    });
    
    // Create event
    const event = await prisma.event.create({
      data: {
        title: 'Test Event',
        description: 'A test event',
        date: new Date('2024-06-15T10:00:00'),
        venue: 'Test Venue',
        category: 'WORKSHOP',
        maxCapacity: 50,
        collegeId: college.id
      }
    });
    
    // Create registration
    const registration = await prisma.registration.create({
      data: {
        studentId: student.id,
        eventId: event.id
      }
    });
    
    console.log('✅ Test data created successfully');
    
    // Test queries
    const colleges = await prisma.college.count();
    const students = await prisma.student.count();
    const events = await prisma.event.count();
    
    console.log('📊 Data counts:');
    console.log(`   Colleges: ${colleges}`);
    console.log(`   Students: ${students}`);
    console.log(`   Events: ${events}`);
    
    await prisma.$disconnect();
    console.log('🎉 Database setup complete!');
    
  } catch (error) {
    console.error('❌ Database error:', error);
  }
}

testDatabase();
