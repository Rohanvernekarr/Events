// Simple setup script to add colleges
const fs = require('fs');
const path = require('path');

// Create a simple SQL file and execute it
const sqlCommands = `
INSERT OR IGNORE INTO College (id, name, emailDomain, createdAt, updatedAt) VALUES 
('clm1demo001', 'Demo University', '@demo.edu', datetime('now'), datetime('now')),
('clm1test001', 'Test College', '@test.edu', datetime('now'), datetime('now'));
`;

const dbPath = path.join(__dirname, 'prisma', 'dev.db');
const sqlPath = path.join(__dirname, 'setup.sql');

// Write SQL to file
fs.writeFileSync(sqlPath, sqlCommands);

console.log('Created SQL setup file');
console.log('Database path:', dbPath);
console.log('SQL commands:', sqlCommands);

// Try to execute using sqlite3 command
const { exec } = require('child_process');

exec(`sqlite3 "${dbPath}" ".read setup.sql"`, (error, stdout, stderr) => {
  if (error) {
    console.log('SQLite3 command not available, trying alternative...');
    
    // Alternative: Try using node-sqlite3 if available
    try {
      const Database = require('better-sqlite3');
      const db = new Database(dbPath);
      
      db.exec(sqlCommands);
      console.log('Colleges added successfully using better-sqlite3!');
      
      const colleges = db.prepare('SELECT * FROM College').all();
      console.log('Current colleges:', colleges);
      
      db.close();
    } catch (e) {
      console.log('better-sqlite3 not available either. Please run manually:');
      console.log(`sqlite3 "${dbPath}" ".read setup.sql"`);
    }
  } else {
    console.log('Colleges added successfully!');
    if (stdout) console.log(stdout);
  }
  
  if (stderr) console.error(stderr);
});
