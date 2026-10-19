# Learner's Guide Platform

A production-ready education management platform for institutes, connecting **Admin, Teacher, Student, and Parent portals** with secure role-based access.

## 🚀 Features

### 👨‍💼 Admin Portal
- Student management
- Teacher management
- Batch/class management
- Attendance overview
- Leave request approval
- Fees management
- Results and academic management
- Platform administration

### 👨‍🏫 Teacher Portal
- Assigned student management
- Attendance entry
- Academic updates
- Marks and results management
- Batch-based access control

### 🎓 Student Portal
- Personal profile
- Attendance tracking
- Marks and test results
- Study materials
- Leave requests
- Academic progress view

### 👨‍👩‍👧 Parent Portal
- Linked student overview
- Attendance monitoring
- Fees tracking
- Results and marks viewing
- Leave request submission
- Student performance summary

## 📚 Academic Features

### Attendance System
- Role-based attendance access
- Student attendance tracking
- Admin and teacher management flow

### Leave Management
- Student/parent leave requests
- Admin approval workflow
- Attendance integration after approval

### Fees Tracking
- Student fee information
- Parent fee visibility
- Admin management controls

### Results & Analytics
- Marks display
- Test results
- Academic progress tracking

### Study Materials
- Digital learning resources
- Student access controls

## 🔐 Security

- Supabase authentication
- Row Level Security (RLS)
- Role-based permissions
- Protected student data access
- Private repository deployment support

## 🛠 Technology Stack

- React + Vite
- Tailwind CSS
- React Router
- Supabase
- PostgreSQL
- Vercel deployment
- Progressive Web App (PWA)

## 📱 PWA Installation

The platform can be installed as an app from supported browsers.

## ⚙️ Local Setup

1. Clone repository
2. Create `.env` file
3. Add:

```env
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

4. Install dependencies:

```bash
npm install
```

5. Run:

```bash
npm run dev
```

## 🚀 Deployment

Recommended production setup:

- Private GitHub repository
- Vercel deployment
- Supabase RLS enabled
- No service-role keys in frontend

## 📄 Documentation

Additional documents:
- Privacy Policy
- Terms & Conditions
- License
- User/Admin Guide

## Project Structure

- `src/components` - reusable UI components
- `src/pages` - application pages
- `src/contexts` - authentication/session handling
- `src/services` - Supabase services
- `supabase` - database schema

---

## Project links

- **GitHub profile:** https://github.com/Mahin98250
- **Portfolio repository:** https://github.com/Mahin98250/Porfolio
- **More projects:** https://github.com/Mahin98250?tab=repositories

> Live demo links will be added only after the deployment URL is verified.
