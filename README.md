# Collaborative Whiteboard

A real-time collaborative whiteboard web application. Users can create or join rooms and draw together, with live cursor sharing and persistent drawing data.

## Features

- Create or join a room with a unique code
- Real-time collaborative drawing (multiple users)
- Live user cursor indicators
- Room list and browsing
- Drawing data persists for 24 hours (MongoDB TTL)
- Responsive, modern UI (React)
- Service worker support for offline/PWA
- Export whiteboard as image

## Tech Stack

- **Frontend:** React, socket.io-client, Create React App
- **Backend:** Node.js, Express, Socket.io, MongoDB (Mongoose)
- **Other:** Service Worker (PWA), CORS

## Getting Started

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

### Project Structure

```
board/
  client/      # React frontend
    src/
      components/
        DrawingCanvas.js
        RoomJoin.js
        Toolbar.js
        UserCursors.js
        Whiteboard.js
      App.js
      ...
  server/      # Node.js backend
    models/
      Room.js
    routes/
      rooms.js
    socket/
      whiteboard.js
    server.js
```

### API Endpoints

- `POST /api/rooms/create` — Create a new room
- `POST /api/rooms/join` — Join (or create) a room
- `GET /api/rooms` — List active rooms (last 24h)
- `GET /api/rooms/:roomId` — Get room info

### Environment Variables

- By default, the backend connects to `mongodb://localhost:27017/whiteboard`.
- To change the port or MongoDB URI, set `PORT` and `MONGODB_URI` in your environment.

### License

MIT
