// Setup admin credentials and test backend connection
const fs = require('fs');
const path = require('path');

// Create admin credentials for testing
const adminCredentials = {
  email: 'admin@admin.com',
  password: 'admin123'
};

// Create .env file with admin credentials
const envContent = `
# Database - Using SQLite for development (no setup required)
DATABASE_URL="file:./dev.db"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-here-change-in-production"

# Admin Credentials
ADMIN_EMAIL="${adminCredentials.email}"
ADMIN_PASSWORD="${adminCredentials.password}"

# Server Port
PORT=3001
`;

// Write .env file
const envPath = path.join(__dirname, '.env');
fs.writeFileSync(envPath, envContent.trim());

console.log('✅ Admin credentials setup complete!');
console.log('📋 Admin Login Credentials:');
console.log(`   Email: ${adminCredentials.email}`);
console.log(`   Password: ${adminCredentials.password}`);
console.log('');
console.log('🔧 Environment file created at:', envPath);
console.log('');
console.log('🚀 Next steps:');
console.log('1. Start backend: npm run dev');
console.log('2. Start admin portal: cd ../campus-admin && npm run dev');
console.log('3. Login with the credentials above');
console.log('4. Test all admin features');
