# Campus Event Platform

A full-stack campus event management platform with three main components:
- **Backend**: Node.js/Express API with Prisma ORM and SQLite database
- **Campus Admin**: Next.js admin dashboard for event management
- **Campus Student**: React Native(Expo) mobile app for students

#Setup instruction
Make sure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** 
- **Git**

### 1. Clone the Repository
git clone <your-repo-url>
cd campus-event-platform
npm install

cd backend
npm install
Create a `.env` file in the `backend` directory:
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-here"
PORT=3001
NODE_ENV=development

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Seed the database with initial data
npx prisma db seed

npm run dev

## Admin Dashboard Setup

cd campus-admin
npm install

Create a `.env.local` file in the `campus-admin` directory:

NEXT_PUBLIC_API_URL=http://localhost:3001/api

npm run dev

## 📱 Student Mobile App Setup

cd campus-student  
npm install

Create a `.env` file in the `campus-student` directory:
EXPO_PUBLIC_API_URL=http://localhost:3001/api
npm start
  

  
