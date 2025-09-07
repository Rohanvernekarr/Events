import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createData() {
  try {
    console.log('Creating colleges and events...');
    
    // Create Demo University
    const demoCollege = await prisma.college.create({
      data: {
        name: 'Demo University',
        emailDomain: '@demo.edu',
      },
    }).catch(async (error) => {
      if (error.code === 'P2002') {
        // College already exists, fetch it
        return await prisma.college.findFirst({
          where: { emailDomain: '@demo.edu' }
        });
      }
      throw error;
    });
    
    console.log('✓ Demo University:', demoCollege.name);

    // Create Test College
    const testCollege = await prisma.college.create({
      data: {
        name: 'Test College',
        emailDomain: '@test.edu',
      },
    }).catch(async (error) => {
      if (error.code === 'P2002') {
        // College already exists, fetch it
        return await prisma.college.findFirst({
          where: { emailDomain: '@test.edu' }
        });
      }
      throw error;
    });
    
    console.log('✓ Test College:', testCollege.name);

    // Create sample events
    const now = new Date();
    const futureDate1 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const futureDate2 = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const event1 = await prisma.event.create({
      data: {
        title: 'Web Development Workshop',
        description: 'Learn modern web development with React and Node.js',
        date: futureDate1,
        venue: 'Demo University Lab A',
        category: 'WORKSHOP',
        maxCapacity: 30,
        allowOtherColleges: true,
        collegeId: demoCollege.id,
      },
    }).catch(() => null);
    
    if (event1) console.log('✓ Created event:', event1.title);

    const event2 = await prisma.event.create({
      data: {
        title: 'Programming Fundamentals',
        description: 'Basic programming concepts and best practices',
        date: futureDate2,
        venue: 'Test College Room 101',
        category: 'SEMINAR',
        maxCapacity: 25,
        allowOtherColleges: false,
        collegeId: testCollege.id,
      },
    }).catch(() => null);
    
    if (event2) console.log('✓ Created event:', event2.title);

    console.log('\n🎉 Setup completed! You can now register with:');
    console.log('- yourname@demo.edu');
    console.log('- yourname@test.edu');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createData();
