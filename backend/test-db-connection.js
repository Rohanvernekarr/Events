const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Check if tables exist and have data
    const collegeCount = await prisma.college.count();
    const studentCount = await prisma.student.count();
    const eventCount = await prisma.event.count();
    
    console.log(`📊 Current data counts:`);
    console.log(`   Colleges: ${collegeCount}`);
    console.log(`   Students: ${studentCount}`);
    console.log(`   Events: ${eventCount}`);
    
    if (collegeCount === 0) {
      console.log('🌱 No data found, creating test data...');
      
      // Create test college
      const college = await prisma.college.create({
        data: {
          name: 'Test University',
          emailDomain: '@test.edu'
        }
      });
      console.log('✅ Created test college');
      
      // Create test student
      const student = await prisma.student.create({
        data: {
          name: 'Test Student',
          email: 'student@test.edu',
          isVerified: true,
          collegeId: college.id
        }
      });
      console.log('✅ Created test student');
      
      // Create test event
      const event = await prisma.event.create({
        data: {
          title: 'Test Event',
          description: 'A test event',
          date: new Date('2024-06-01T10:00:00'),
          venue: 'Test Venue',
          category: 'WORKSHOP',
          maxCapacity: 50,
          collegeId: college.id
        }
      });
      console.log('✅ Created test event');
      
      console.log('🎉 Test data created successfully!');
    } else {
      console.log('✅ Database already contains data');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
