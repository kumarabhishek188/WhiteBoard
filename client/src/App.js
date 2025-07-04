import React, { useState } from 'react';
import RoomJoin from './components/RoomJoin';
import Whiteboard from './components/Whiteboard';
import './App.css';

function App() {
  const [roomCode, setRoomCode] = useState(null);

  return (
    <div className="App">
      {!roomCode ? (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh',
          padding: 'clamp(16px, 4vw, 32px)',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff'
        }}>
          <h1 style={{ 
            fontSize: 'clamp(24px, 6vw, 48px)',
            margin: '0 0 clamp(16px, 4vw, 32px) 0',
            textAlign: 'center',
            fontWeight: 'bold',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            Collaborative Whiteboard
          </h1>
          <p style={{ 
            fontSize: 'clamp(14px, 3vw, 18px)',
            margin: '0 0 clamp(24px, 6vw, 48px) 0',
            textAlign: 'center',
            opacity: 0.9,
            maxWidth: '500px'
          }}>
            Create or join a room to start drawing together in real-time
          </p>
          <RoomJoin onJoin={setRoomCode} />
        </div>
      ) : (
        <Whiteboard roomCode={roomCode} />
      )}
    </div>
  );
}

export default App;
