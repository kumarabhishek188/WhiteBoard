import React, { useState, useRef, useEffect } from 'react';
import DrawingCanvas from './DrawingCanvas';
import Toolbar from './Toolbar';
import UserCursors from './UserCursors';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5100';

const Whiteboard = ({ roomCode }) => {
  const [tool, setTool] = useState({ color: 'black', width: 4 });
  const [userCount, setUserCount] = useState(0);
  const [initDrawing, setInitDrawing] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connected', 'disconnected', 'connecting'
  const canvasRef = useRef(); // for imperative DrawingCanvas methods
  const canvasElRef = useRef(); // for actual canvas DOM node
  const socketRef = useRef();

  useEffect(() => {
    setUserCount(0); // Reset user count to 0 on room change
    setConnectionStatus('connecting');
    const socket = io(SOCKET_URL);
    socketRef.current = socket;
    socket.emit('join-room', roomCode);
    socket.on('user-count', setUserCount);
    socket.on('init-drawing', setInitDrawing);
    socket.on('connect', () => setConnectionStatus('connected'));
    socket.on('disconnect', () => setConnectionStatus('disconnected'));
    socket.on('connect_error', () => setConnectionStatus('disconnected'));
    return () => {
      socket.emit('leave-room', roomCode);
      socket.disconnect();
    };
  }, [roomCode]);

  // Callback ref to get the canvas DOM node from DrawingCanvas
  const handleCanvasEl = (el) => {
    if (el) canvasElRef.current = el;
  };

  // Connection status indicator
  const statusColor =
    connectionStatus === 'connected' ? '#28a745' :
    connectionStatus === 'connecting' ? '#ffc107' :
    '#dc3545';
  const statusText =
    connectionStatus === 'connected' ? 'Connected' :
    connectionStatus === 'connecting' ? 'Connecting...' :
    'Disconnected';

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      minHeight: '100vh',
      overflow: 'hidden'
    }}>
      {/* Header/Toolbar Section */}
      <div style={{ 
        padding: '12px 16px', 
        background: '#f5f5f5', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        borderBottom: '1px solid #ddd',
        minHeight: '60px'
      }}>
        <div style={{ 
          fontSize: 'clamp(14px, 2.5vw, 18px)',
          fontWeight: '500',
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          gap: 16
        }}>
          <span>Room: <b>{roomCode}</b> | Users: <b>{userCount}</b></span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              display: 'inline-block',
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: statusColor,
              border: '1px solid #bbb',
              marginRight: 4
            }} />
            <span style={{ fontSize: 'clamp(12px, 2vw, 14px)', color: statusColor }}>{statusText}</span>
          </span>
        </div>
        <Toolbar tool={tool} setTool={setTool} canvasRef={canvasRef} canvasElRef={canvasElRef} />
      </div>
      
      {/* Canvas Section */}
      <div style={{ 
        flex: 1, 
        position: 'relative',
        minHeight: 0,
        overflow: 'hidden'
      }}>
        <DrawingCanvas ref={canvasRef} tool={tool} roomCode={roomCode} socket={socketRef.current} initDrawing={initDrawing} canvasElRef={handleCanvasEl} />
        <UserCursors roomCode={roomCode} socket={socketRef.current} tool={tool} />
      </div>
    </div>
  );
};

export default Whiteboard; 