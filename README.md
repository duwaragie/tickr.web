# Tickr.web

Tickr.web is a full-stack, modern task management web application. It features a SvelteKit + TypeScript + Tailwind CSS frontend and a Node.js + Express + MongoDB backend. The app supports user authentication, task CRUD, drag-and-drop task management, statistics, and a responsive, themeable UI.

## Features

### Frontend (SvelteKit)
- User authentication (signup, login, logout, session persistence)
- Dashboard with task statistics and recent activity
- Kanban-style task management with drag-and-drop
- Create, update, delete, and filter tasks
- Task details with checklist, priority, due date, and status
- Responsive design with light/dark/system theme toggle
- Built with TypeScript, Tailwind CSS, and SvelteKit

### Backend (Node.js/Express)
- RESTful API for authentication and task management
- JWT-based authentication with secure cookies
- MongoDB (via Mongoose) for data storage
- User and Task models with validation
- Task statistics endpoint
- CORS, environment variable, and error handling

## Project Structure

```
backend/           # Express API server
  config/          # DB config
  controllers/     # Route controllers
  middleware/      # Auth middleware
  models/          # Mongoose models
  routes/          # API routes
  utils/           # Utility functions
  server.js        # Entry point
frontend/          # SvelteKit app
  src/
    lib/           # Components, stores
    routes/        # Pages & API endpoints
    app.html       # Main HTML
    app.css        # Global styles
  package.json     # Frontend dependencies
```

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- MongoDB instance (local or cloud)

### Backend Setup
1. `cd backend`
2. `npm install`
3. Create a `.env` file with:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```
4. `npm run dev` (starts server on port 5000)

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm run dev` (starts app on port 5173)

### Usage
- Visit `http://localhost:5173` in your browser
- Register a new account, log in, and start managing tasks!

## Scripts

### Backend
- `npm run dev` — Start backend with nodemon
- `npm start` — Start backend

### Frontend
- `npm run dev` — Start frontend dev server
- `npm run build` — Build frontend for production
- `npm run preview` — Preview production build

## Deployment


*Built with SvelteKit, Express, and ❤️ by [Your Name].*
