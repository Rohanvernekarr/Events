import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data in correct order (respecting foreign key constraints)
  await prisma.attendance.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.event.deleteMany();
  await prisma.student.deleteMany();
  await prisma.college.deleteMany();

  console.log('🗑️  Cleared existing data');

  // Create minimal default colleges (developers can add more via API)
  const demoCollege = await prisma.college.create({
    data: {
      name: 'Demo University',
      emailDomain: '@demo.edu',
    },
  });

  const testCollege = await prisma.college.create({
    data: {
      name: 'Test College',
      emailDomain: '@test.edu',
    },
  });

  console.log('🏫 Created default colleges');

  // Create minimal demo students
  const students = await Promise.all([
    prisma.student.create({
      data: {
        name: 'Demo Student',
        email: 'student@demo.edu',
        isVerified: true,
        collegeId: demoCollege.id,
      },
    }),
    prisma.student.create({
      data: {
        name: 'Test User',
        email: 'user@test.edu',
        isVerified: true,
        collegeId: testCollege.id,
      },
    }),
  ]);

  console.log('👥 Created students');

  // Create minimal demo events
  const now = new Date();
  const events = await Promise.all([
    prisma.event.create({
      data: {
        title: 'Demo Workshop: Web Development',
        description: 'Introduction to modern web development with React and Node.js.',
        date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // Next week
        venue: 'Demo University Lab A',
        category: 'WORKSHOP',
        maxCapacity: 30,
        collegeId: demoCollege.id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Test Event: Programming Basics',
        description: 'Basic programming concepts and best practices.',
        date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        venue: 'Test College Room 101',
        category: 'SEMINAR',
        maxCapacity: 25,
        collegeId: testCollege.id,
      },
    }),
  ]);

  console.log('📅 Created events');

  // Create minimal registrations
  const registrations = await Promise.all([
    prisma.registration.create({
      data: {
        studentId: students[0].id,
        eventId: events[0].id, // Demo student -> Demo event
      },
    }),
    prisma.registration.create({
      data: {
        studentId: students[1].id,
        eventId: events[1].id, // Test student -> Test event
      },
    }),
  ]);

  console.log('✍️ Created registrations');

  // Create minimal attendance and feedback
  const attendanceRecords = await Promise.all([
    prisma.attendance.create({
      data: {
        registrationId: registrations[0].id, // Demo student attendance
      },
    }),
  ]);

  console.log('✅ Created attendance records');

  const feedbackRecords = await Promise.all([
    prisma.feedback.create({
      data: {
        registrationId: registrations[0].id, // Demo student feedback
        rating: 5,
        comments: 'Great demo workshop!',
      },
    }),
  ]);

  console.log('💬 Created feedback records');

  // Print summary
  const summary = {
    colleges: await prisma.college.count(),
    students: await prisma.student.count(),
    events: await prisma.event.count(),
    registrations: await prisma.registration.count(),
    attendance: await prisma.attendance.count(),
    feedback: await prisma.feedback.count(),
  };

  console.log('📊 Database seeded successfully!');
  console.log('Summary:', summary);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
