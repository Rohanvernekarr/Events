const { PrismaClient } = require('./generated/prisma');

const prisma = new PrismaClient();

async function createColleges() {
  try {
    console.log('Creating colleges...');
    
    // Check if colleges already exist
    const existingColleges = await prisma.college.findMany();
    console.log('Existing colleges:', existingColleges.length);
    
    if (existingColleges.length === 0) {
      // Create Demo University
      const demoCollege = await prisma.college.create({
        data: {
          name: 'Demo University',
          emailDomain: '@demo.edu',
        },
      });
      console.log('Created Demo University:', demoCollege);

      // Create Test College
      const testCollege = await prisma.college.create({
        data: {
          name: 'Test College',
          emailDomain: '@test.edu',
        },
      });
      console.log('Created Test College:', testCollege);
    } else {
      console.log('Colleges already exist:');
      existingColleges.forEach(college => {
        console.log(`- ${college.name} (${college.emailDomain})`);
      });
    }
    
  } catch (error) {
    console.error('Error creating colleges:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createColleges();
