const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedUpcomingEvents() {
  try {
    // Get existing colleges
    const colleges = await prisma.college.findMany();
    
    if (colleges.length === 0) {
      console.log('No colleges found. Please seed colleges first.');
      return;
    }

    // Create upcoming events with future dates
    const upcomingEvents = [
      {
        title: 'AI & Machine Learning Workshop',
        description: 'Hands-on workshop covering the fundamentals of AI and ML with practical projects using Python and TensorFlow.',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        venue: 'Computer Science Lab A',
        category: 'WORKSHOP',
        maxCapacity: 50,
        collegeId: colleges[0].id
      },
      {
        title: 'Campus Tech Fest 2024',
        description: 'Annual technology festival featuring coding competitions, tech talks, and innovation showcases.',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
        venue: 'Main Auditorium',
        category: 'FEST',
        maxCapacity: 200,
        collegeId: colleges[0].id
      },
      {
        title: 'Career Guidance Seminar',
        description: 'Expert guidance on career opportunities in technology, industry insights, and interview preparation.',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        venue: 'Conference Hall B',
        category: 'SEMINAR',
        maxCapacity: 100,
        collegeId: colleges[0].id
      },
      {
        title: 'Hackathon 2024: Innovation Challenge',
        description: '48-hour coding marathon to solve real-world problems with innovative technology solutions.',
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
        venue: 'Innovation Hub',
        category: 'HACKATHON',
        maxCapacity: 80,
        collegeId: colleges.length > 1 ? colleges[1].id : colleges[0].id
      },
      {
        title: 'Blockchain & Cryptocurrency Tech Talk',
        description: 'Deep dive into blockchain technology, cryptocurrency, and decentralized applications.',
        date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), // 4 weeks from now
        venue: 'Tech Center Room 301',
        category: 'TECH_TALK',
        maxCapacity: 75,
        collegeId: colleges.length > 1 ? colleges[1].id : colleges[0].id
      },
      {
        title: 'Web Development Bootcamp',
        description: 'Intensive bootcamp covering modern web development with React, Node.js, and cloud deployment.',
        date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 5 weeks from now
        venue: 'Computer Lab C',
        category: 'WORKSHOP',
        maxCapacity: 40,
        collegeId: colleges[0].id
      }
    ];

    console.log('Creating upcoming events...');
    
    for (const eventData of upcomingEvents) {
      const event = await prisma.event.create({
        data: eventData,
        include: {
          college: true,
          _count: {
            select: {
              registrations: true
            }
          }
        }
      });
      
      console.log(`✅ Created event: ${event.title} on ${event.date.toLocaleDateString()}`);
    }

    console.log(`\n🎉 Successfully created ${upcomingEvents.length} upcoming events!`);
    
  } catch (error) {
    console.error('Error seeding upcoming events:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedUpcomingEvents();
