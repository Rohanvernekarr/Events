# Project Overview: Campus Event Management System

This project is a full-stack Campus Event Management portal designed to manage events of colleges.Firstly I have designed the backend of the portal how it shd work bcz there are two endpoint for auth student in mobile and clg staff in web i have designed a backend system architecture,based on that i have designed the backend . I have maintained a one large dataset for all the college giving them unique id's 


## 1. Backend
- **Location:** `Events/backend`
- **Tech Stack:**
  - Node.js
  - Express.js
  - Prisma ORM
  - Postgresql
  - TypeScript
- **Features:**
  - RESTful API initialized for event, student, college, registration, attendance, and feedback management
  - Database schema and seed scripts
  - Authentication and validation middleware
  - Automated tests and scripts for setup 

## 2. Campus Admin Portal
- **Location:** `Events/campus-admin`
- **Tech Stack:**
  - Next.js (React framework)
  - TypeScript
  - Tailwind CSS/PostCSS
- **Features:**
  - Admin dashboard for managing events, colleges, and registrations
  - Authentication and secure access

## 3. Campus Student App
- **Location:** `campus-student`
- **Tech Stack:**
  - React Native (Expo)
  - TypeScript
- **Features:**
  - Mobile app for students to view, register, and give feedback on events
  - Students can register in the events organized by college

---

For setup instructions, see the main `README.md` in the project root.
