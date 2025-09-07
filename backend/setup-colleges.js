const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupColleges() {
  try {
    console.log('Setting up colleges...');
    
    // Create Demo University
    const demoCollege = await prisma.college.upsert({
      where: { emailDomain: '@demo.edu' },
      update: {},
      create: {
        name: 'Demo University',
        emailDomain: '@demo.edu',
      },
    });
    console.log('✓ Demo University created/updated:', demoCollege.name);

    // Create Test College
    const testCollege = await prisma.college.upsert({
      where: { emailDomain: '@test.edu' },
      update: {},
      create: {
        name: 'Test College',
        emailDomain: '@test.edu',
      },
    });
    console.log('✓ Test College created/updated:', testCollege.name);

    // Create some sample events
    const now = new Date();
    const futureDate1 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week from now
    const futureDate2 = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 2 weeks from now

    const event1 = await prisma.event.upsert({
      where: { id: 'demo-event-1' },
      update: {},
      create: {
        id: 'demo-event-1',
        title: 'Web Development Workshop',
        description: 'Learn modern web development with React and Node.js',
        date: futureDate1,
        venue: 'Demo University Lab A',
        category: 'WORKSHOP',
        maxCapacity: 30,
        allowOtherColleges: true,
        collegeId: demoCollege.id,
      },
    });
    console.log('✓ Demo event created:', event1.title);

    const event2 = await prisma.event.upsert({
      where: { id: 'test-event-1' },
      update: {},
      create: {
        id: 'test-event-1',
        title: 'Programming Fundamentals',
        description: 'Basic programming concepts and best practices',
        date: futureDate2,
        venue: 'Test College Room 101',
        category: 'SEMINAR',
        maxCapacity: 25,
        allowOtherColleges: false,
        collegeId: testCollege.id,
      },
    });
    console.log('✓ Test event created:', event2.title);

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\nYou can now register with:');
    console.log('- yourname@demo.edu (Demo University)');
    console.log('- yourname@test.edu (Test College)');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupColleges();
