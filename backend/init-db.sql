-- Create colleges
INSERT OR REPLACE INTO College (id, name, emailDomain, createdAt, updatedAt) VALUES 
('demo-college-123', 'Demo University', '@demo.edu', datetime('now'), datetime('now')),
('test-college-456', 'Test College', '@test.edu', datetime('now'), datetime('now'));

-- Create sample events
INSERT OR REPLACE INTO Event (id, title, description, date, venue, category, status, maxCapacity, allowOtherColleges, collegeId, createdAt, updatedAt) VALUES 
('demo-event-123', 'Web Development Workshop', 'Learn modern web development with React and Node.js', datetime('now', '+7 days'), 'Demo University Lab A', 'WORKSHOP', 'ACTIVE', 30, 1, 'demo-college-123', datetime('now'), datetime('now')),
('test-event-456', 'Programming Fundamentals', 'Basic programming concepts and best practices', datetime('now', '+14 days'), 'Test College Room 101', 'SEMINAR', 'ACTIVE', 25, 0, 'test-college-456', datetime('now'), datetime('now'));
