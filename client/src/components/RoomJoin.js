import React, { useState } from 'react';
import axios from 'axios';

const RoomJoin = ({ onJoin }) => {
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRooms, setShowRooms] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(false);

  const isValidCode = roomCode.trim().length >= 6 && roomCode.trim().length <= 8;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isValidCode) {
      setLoading(true);
      try {
        const res = await axios.post('http://localhost:5100/api/rooms/join', { roomId: roomCode.trim() });
        if (res.data.success) {
          onJoin(res.data.roomId);
        } else {
          alert(res.data.message || 'Failed to join room');
        }
      } catch (err) {
        alert('Error joining room');
      } finally {
        setLoading(false);
      }
    } else {
      alert('Room code must be 6-8 alphanumeric characters.');
    }
  };

  const handleCreateRoom = async () => {
    if (!isValidCode) {
      alert('Room code must be 6-8 alphanumeric characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5100/api/rooms/create', { roomId: roomCode.trim() });
      if (res.data.success) {
        onJoin(res.data.roomId);
      } else {
        alert(res.data.message || 'Failed to create room');
      }
    } catch (err) {
      if (err.response && err.response.status === 409) {
        alert('Room already exists. Please choose a different code.');
      } else {
        alert('Error creating room');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBrowseRooms = async () => {
    setShowRooms(true);
    setRoomsLoading(true);
    try {
      const res = await axios.get('http://localhost:5100/api/rooms');
      if (res.data.success) {
        setRooms(res.data.rooms);
      } else {
        setRooms([]);
      }
    } catch {
      setRooms([]);
    } finally {
      setRoomsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: 'clamp(12px, 3vw, 20px)',
        padding: 'clamp(20px, 5vw, 40px)',
        maxWidth: '400px',
        width: '100%'
      }}>
        <input
          type="text"
          value={roomCode}
          onChange={e => setRoomCode(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
          placeholder="Enter room code"
          maxLength={8}
          minLength={6}
          style={{ 
            fontSize: 'clamp(16px, 4vw, 18px)', 
            padding: 'clamp(8px, 2vw, 12px)', 
            letterSpacing: '2px',
            width: '100%',
            maxWidth: '300px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            textAlign: 'center'
          }}
          required
          disabled={loading}
        />
        <div style={{ 
          display: 'flex', 
          gap: 'clamp(8px, 2vw, 12px)',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <button 
            type="submit" 
            style={{ 
              fontSize: 'clamp(14px, 3vw, 18px)', 
              padding: 'clamp(8px, 2vw, 12px) clamp(16px, 3vw, 24px)',
              border: '1px solid #ccc',
              borderRadius: '4px',
              background: '#007bff',
              color: '#fff',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }} 
            disabled={loading || !isValidCode}
          >
            {loading ? 'Joining...' : 'Join Room'}
          </button>
          <button 
            type="button" 
            style={{ 
              fontSize: 'clamp(14px, 3vw, 18px)', 
              padding: 'clamp(8px, 2vw, 12px) clamp(16px, 3vw, 24px)',
              border: '1px solid #ccc',
              borderRadius: '4px',
              background: '#28a745',
              color: '#fff',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }} 
            disabled={loading || !isValidCode} 
            onClick={handleCreateRoom}
          >
            {loading ? 'Creating...' : 'Create Room'}
          </button>
        </div>
        <button 
          type="button" 
          style={{ 
            fontSize: 'clamp(14px, 3vw, 16px)', 
            padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 2vw, 16px)',
            border: '1px solid #ccc',
            borderRadius: '4px',
            background: '#6c757d',
            color: '#fff',
            cursor: 'pointer'
          }} 
          onClick={handleBrowseRooms} 
          disabled={loading}
        >
          Browse Rooms
        </button>
      </form>
      {showRooms && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100vh', 
          background: 'rgba(0,0,0,0.3)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 10000,
          padding: 'clamp(16px, 4vw, 32px)'
        }}>
          <div style={{ 
            background: '#fff', 
            padding: 'clamp(20px, 5vw, 32px)', 
            borderRadius: '8px', 
            minWidth: '280px',
            maxWidth: '90vw',
            maxHeight: '80vh', 
            overflowY: 'auto',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ 
              fontSize: 'clamp(18px, 4vw, 24px)',
              margin: '0 0 clamp(16px, 4vw, 24px) 0'
            }}>Active Rooms (last 24h)</h3>
            {roomsLoading ? (
              <div style={{ fontSize: 'clamp(14px, 3vw, 16px)' }}>Loading...</div>
            ) : (
              rooms.length === 0 ? (
                <div style={{ fontSize: 'clamp(14px, 3vw, 16px)' }}>No active rooms found.</div>
              ) : (
                <ul style={{ 
                  listStyle: 'none', 
                  padding: 0,
                  margin: 0
                }}>
                  {rooms.map(r => (
                    <li key={r.roomId} style={{ 
                      margin: 'clamp(8px, 2vw, 12px) 0', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}>
                      <span style={{ 
                        fontFamily: 'monospace', 
                        fontSize: 'clamp(16px, 3vw, 18px)',
                        fontWeight: 'bold',
                        color: '#333',
                        background: '#f8f9fa',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid #dee2e6'
                      }}>{r.roomId}</span>
                      <button 
                        style={{ 
                          padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 2vw, 16px)',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          background: '#007bff',
                          color: '#fff',
                          cursor: 'pointer',
                          fontSize: 'clamp(12px, 2.5vw, 14px)'
                        }} 
                        onClick={() => { setShowRooms(false); onJoin(r.roomId); }}
                      >
                        Join
                      </button>
                    </li>
                  ))}
                </ul>
              )
            )}
            <button 
              style={{ 
                marginTop: 'clamp(16px, 4vw, 24px)',
                padding: 'clamp(8px, 2vw, 12px) clamp(16px, 3vw, 24px)',
                border: '1px solid #ccc',
                borderRadius: '4px',
                background: '#6c757d',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 'clamp(14px, 3vw, 16px)'
              }} 
              onClick={() => setShowRooms(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default RoomJoin; 