const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Path to the SQLite database
const dbPath = path.join(__dirname, 'prisma', 'dev.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    return;
  }
  console.log('Connected to SQLite database');
});

// Insert colleges
const insertColleges = () => {
  const colleges = [
    { name: 'Demo University', emailDomain: '@demo.edu' },
    { name: 'Test College', emailDomain: '@test.edu' }
  ];

  colleges.forEach(college => {
    db.run(
      `INSERT OR REPLACE INTO College (name, emailDomain, createdAt, updatedAt) 
       VALUES (?, ?, datetime('now'), datetime('now'))`,
      [college.name, college.emailDomain],
      function(err) {
        if (err) {
          console.error('Error inserting college:', err);
        } else {
          console.log(`Inserted ${college.name} with domain ${college.emailDomain}`);
        }
      }
    );
  });
};

// Check if colleges table exists and insert data
db.serialize(() => {
  insertColleges();
  
  // Verify insertion
  db.all("SELECT * FROM College", [], (err, rows) => {
    if (err) {
      console.error('Error querying colleges:', err);
    } else {
      console.log('Current colleges in database:');
      rows.forEach(row => {
        console.log(`- ${row.name} (${row.emailDomain})`);
      });
    }
    
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('Database connection closed');
      }
    });
  });
});
