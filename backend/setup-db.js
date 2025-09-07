const { PrismaClient } = require('./generated/prisma');

const prisma = new PrismaClient();

async function setupDatabase() {
  console.log('🌱 Setting up database with test data...');

  try {
    // Clear existing data
    await prisma.attendance.deleteMany();
    await prisma.feedback.deleteMany();
    await prisma.registration.deleteMany();
    await prisma.event.deleteMany();
    await prisma.student.deleteMany();
    await prisma.college.deleteMany();
    console.log('✅ Cleared existing data');

    // Create colleges
    const mit = await prisma.college.create({
      data: {
        name: 'Massachusetts Institute of Technology',
        emailDomain: '@mit.edu',
      },
    });

    const stanford = await prisma.college.create({
      data: {
        name: 'Stanford University',
        emailDomain: '@stanford.edu',
      },
    });

    const berkeley = await prisma.college.create({
      data: {
        name: 'UC Berkeley',
        emailDomain: '@berkeley.edu',
      },
    });
    console.log('✅ Created colleges');

    // Create students
    const john = await prisma.student.create({
      data: {
        name: 'John Doe',
        email: 'johndoe@mit.edu',
        isVerified: true,
        collegeId: mit.id,
      },
    });

    const jane = await prisma.student.create({
      data: {
        name: 'Jane Smith',
        email: 'janesmith@stanford.edu',
        isVerified: true,
        collegeId: stanford.id,
      },
    });

    const bob = await prisma.student.create({
      data: {
        name: 'Bob Johnson',
        email: 'bobjohnson@berkeley.edu',
        isVerified: true,
        collegeId: berkeley.id,
      },
    });
    console.log('✅ Created students');

    // Create events
    const workshop = await prisma.event.create({
      data: {
        title: 'Web Development Workshop',
        description: 'Learn modern web development with React and Node.js',
        date: new Date('2024-01-15T10:00:00'),
        venue: 'MIT Building 34, Room 101',
        category: 'WORKSHOP',
        maxCapacity: 50,
        collegeId: mit.id,
      },
    });

    const seminar = await prisma.event.create({
      data: {
        title: 'AI in Healthcare Seminar',
        description: 'Exploring AI applications in modern healthcare',
        date: new Date('2024-01-20T14:00:00'),
        venue: 'Stanford Main Auditorium',
        category: 'SEMINAR',
        maxCapacity: 200,
        collegeId: stanford.id,
      },
    });

    const techFest = await prisma.event.create({
      data: {
        title: 'Tech Fest 2024',
        description: 'Annual technology festival',
        date: new Date('2024-02-01T09:00:00'),
        venue: 'Berkeley Campus Center',
        category: 'FEST',
        maxCapacity: 1000,
        collegeId: berkeley.id,
      },
    });
    console.log('✅ Created events');

    // Create registrations
    const reg1 = await prisma.registration.create({
      data: {
        studentId: john.id,
        eventId: workshop.id,
      },
    });

    const reg2 = await prisma.registration.create({
      data: {
        studentId: jane.id,
        eventId: seminar.id,
      },
    });

    const reg3 = await prisma.registration.create({
      data: {
        studentId: bob.id,
        eventId: techFest.id,
      },
    });
    console.log('✅ Created registrations');

    // Create attendance
    await prisma.attendance.create({
      data: {
        registrationId: reg1.id,
      },
    });
    console.log('✅ Created attendance records');

    // Create feedback
    await prisma.feedback.create({
      data: {
        registrationId: reg1.id,
        rating: 5,
        comments: 'Excellent workshop!',
      },
    });
    console.log('✅ Created feedback');

    // Print summary
    const counts = {
      colleges: await prisma.college.count(),
      students: await prisma.student.count(),
      events: await prisma.event.count(),
      registrations: await prisma.registration.count(),
      attendance: await prisma.attendance.count(),
      feedback: await prisma.feedback.count(),
    };

    console.log('📊 Database setup complete!');
    console.log('Summary:', counts);

  } catch (error) {
    console.error('❌ Error setting up database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase();
