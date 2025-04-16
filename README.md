# Internship Tracker

Internship Tracker is a web application designed to manage and track interns' attendance, profiles, and roles. Built with a modern tech stack, it provides role-based access for admins, mentors, and interns.

## Features

- **Role-Based Access Control**:
  - Admins can manage interns, mentors, and settings.
  - Mentors can view and manage their assigned interns.
  - Interns can view their attendance and profile.
- **Attendance Management**:
  - Filter attendance records by date, intern, and status.
- **Responsive Design**:
  - Fully responsive layout for all screen sizes.
- **User Authentication**:
  - Secure login and logout functionality.

## Tech Stack

### Frontend
- **React**: Component-based UI library.
- **Vite**: Fast development environment.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **React Router**: For routing and navigation.

### Backend
- **Node.js**: JavaScript runtime for the server.
- **Express**: Web framework for building APIs.
- **MongoDB**: NoSQL database for storing data.

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally or on a cloud service)

### Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/internee-tracker.git
   cd internee-tracker
   ```

## Project Structure

```
internee-tracker/
├── backend/          # Backend code (Node.js + Express)
│   ├── controllers/  # API controllers
│   ├── models/       # Mongoose models
│   ├── routes/       # API routes
│   └── server.js     # Entry point for the backend
├── frontend/         # Frontend code (React + Vite)
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── pages/      # Page components
│   │   ├── store/      # Redux store and slices
│   │   └── App.jsx     # Main React component
│   └── vite.config.js  # Vite configuration
└── README.md         # Project documentation
```
