-- Insert colleges if they don't exist
INSERT OR IGNORE INTO College (id, name, emailDomain, createdAt, updatedAt) 
VALUES 
  ('demo-college-id', 'Demo University', '@demo.edu', datetime('now'), datetime('now')),
  ('test-college-id', 'Test College', '@test.edu', datetime('now'), datetime('now'));
