# Collaborative Whiteboard

A real-time collaborative whiteboard web application. Users can create or join rooms and draw together, with live cursor sharing and persistent drawing data.

## Features

- Create or join a room with a unique code
- Real-time collaborative drawing (multiple users)
- Live user cursor indicators
- Room list and browsing
- Responsive design for both desktop and tablet use
- Display cursors with different colors for each user
- Hide cursor when user is inactive
- Clean up old room data (rooms inactive for 24+ hours)
- Connection status indicator
- User count display
- Export whiteboard as image(.png)

## Tech Stack

- **Frontend:** React.js
- **Backend:** Node.js/Express.js
- **Database:** MongoDB
- **Real-time Communication:** Socket.io

## Getting Started (Setup Instruction):

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB (local or remote)

### Installation

1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd board
   ```

2. **Install server dependencies:**
   ```sh
   cd server
   npm install
   ```

3. **Install client dependencies:**
   ```sh
   cd ../client
   npm install
   ```

### Running the App

1. **Start MongoDB** (if not already running):
   ```sh
   mongod
   ```

2. **Start the backend server:**
   ```sh
   cd server
   node server.js
   ```
   The server runs on `http://localhost:5100`.

3. **Start the frontend:**
   ```sh
   cd ../client
   npm start
   ```
   The app runs on `http://localhost:3000`.

### Usage

- Open the app in your browser.
- Create a new room or join an existing one using a 6-8 character code.
- Share the room code with others to collaborate in real-time.
- Export whiteboard as image(.png).

## Architecture Overview

The application follows a client-server architecture:

- **Frontend (React):** Handles the user interface, drawing canvas, room management, and real-time updates via Socket.IO. Deployed as a static site (e.g., on Vercel).
- **Backend (Node.js/Express/Socket.IO):** Provides REST API endpoints for room management and real-time collaboration using WebSockets. Persists drawing data and room info in MongoDB. Deployed on a cloud platform (e.g., Render, Railway, Heroku).
- **Database (MongoDB):** Stores room and drawing data with TTL for automatic cleanup.

**Data Flow:**
- Users interact with the React frontend, which communicates with the backend via REST API and Socket.IO for real-time features.
- The backend manages room state, drawing data, and broadcasts updates to all connected clients in a room.


### Project Structure

```
board/
  client/                  # React frontend
    public/
    src/
      components/
        DrawingCanvas.js
        RoomJoin.js
        Toolbar.js
        UserCursors.js
        Whiteboard.js
      App.js
      index.js
  server/                  # Node.js backend
    models/
      Room.js              # Mongoose schema
    routes/
      rooms.js             # Room-related API routes
    socket/
      whiteboard.js        # Socket.IO handlers
    server.js              # Entry point
  README.md
  package.json

```

### API Endpoints

- `POST /api/rooms/create` — Create a new room
- `POST /api/rooms/join` — Join (or create) a room
- `GET /api/rooms` — List active rooms (last 24h)
- `GET /api/rooms/:roomId` — Get room info

### Environment Variables

- The backend connects to `mongodb://localhost:27017/whiteboard`.
- To change the port or MongoDB URI, set `PORT` and `MONGODB_URI` in your environment.


## Deployment Guide

### Backend Deployment (Render/Railway/Heroku)
1. Push the `server/` folder to a GitHub repository.
2. Create a new project on your chosen platform and connect your repo.
3. Set environment variables:
   - `MONGODB_URI` (your MongoDB connection string)
   - `CLIENT_ORIGIN` (your Vercel frontend URL, e.g., `https://your-app.vercel.app`)
   - `PORT` (usually set automatically by the platform)
4. Deploy and note the backend URL (e.g., `https://your-backend.onrender.com`).

### Frontend Deployment (Vercel)
1. Push the `client/` folder to a GitHub repository.
2. Import the repo into Vercel and deploy.
3. In your React app, update all API and Socket.IO URLs to use your backend’s public URL (e.g., `https://your-backend.onrender.com`).
4. Redeploy if you make changes to the backend URL.

### License

MIT
