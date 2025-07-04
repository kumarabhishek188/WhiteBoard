import React, { useEffect, useRef, useState } from 'react';

// Generate a random color for each user
const getRandomColor = () => {
  const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22', '#1abc9c', '#34495e'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const CURSOR_THROTTLE_MS = 33; // ~30 times per second

const UserCursors = ({ roomCode, socket, tool }) => {
  const [cursors, setCursors] = useState({});
  const [myCursor, setMyCursor] = useState(null);
  const [showArrow, setShowArrow] = useState(false);
  const [active, setActive] = useState(true);
  const userId = useRef(Math.random().toString(36).substr(2, 9));
  const myColor = useRef(getRandomColor());
  const timers = useRef({});
  const myTimer = useRef();
  const lastSent = useRef(0);

  // Track and send local cursor position, only show arrow over whiteboard area
  useEffect(() => {
    const handleMove = (e) => {
      let x, y;
      if (e.touches && e.touches[0]) {
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
      } else {
        x = e.clientX;
        y = e.clientY;
      }
      setMyCursor({ x, y });
      // Check if over canvas or whiteboard area
      const el = document.elementFromPoint(x, y);
      if (el && (el.tagName === 'CANVAS' || el.classList.contains('whiteboard-area'))) {
        setShowArrow(true);
      } else {
        setShowArrow(false);
      }
      setActive(true);
      if (myTimer.current) clearTimeout(myTimer.current);
      myTimer.current = setTimeout(() => setActive(false), 5000);
      // Throttle cursor-move events
      const now = Date.now();
      if (socket && now - lastSent.current > CURSOR_THROTTLE_MS) {
        socket.emit('cursor-move', { x, y, id: userId.current, color: myColor.current });
        lastSent.current = now;
      }
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      if (myTimer.current) clearTimeout(myTimer.current);
    };
  }, [socket]);

  // Handle remote cursors
  useEffect(() => {
    if (!socket) return;
    const handleMove = (data) => {
      if (data.id !== userId.current) {
        if (timers.current[data.id]) clearTimeout(timers.current[data.id]);
        timers.current[data.id] = setTimeout(() => {
          setCursors(prev => {
            const copy = { ...prev };
            delete copy[data.id];
            return copy;
          });
        }, 5000);
        setCursors(prev => ({ ...prev, [data.id]: { x: data.x, y: data.y, color: data.color } }));
      }
    };
    socket.on('cursor-move', handleMove);
    return () => {
      socket.off('cursor-move', handleMove);
      Object.values(timers.current).forEach(clearTimeout);
    };
  }, [socket]);

  return (
    <>
      {/* Local user's cursor arrow, colored by current tool color, only over whiteboard, and only if active */}
      {myCursor && showArrow && active && (
        <svg
          style={{
            position: 'fixed',
            left: myCursor.x + 2,
            top: myCursor.y + 2,
            pointerEvents: 'none',
            zIndex: 1000,
            transform: 'translate(-50%, -50%)',
          }}
          width={24}
          height={24}
        >
          <polygon
            points="12,0 24,24 12,18 0,24"
            fill={tool?.color || 'black'}
            stroke="#fff"
            strokeWidth={1}
          />
        </svg>
      )}
      {/* Remote users' colored dots */}
      {Object.entries(cursors).map(([id, pos]) => (
        <div
          key={id}
          style={{
            position: 'fixed',
            left: pos.x + 2,
            top: pos.y + 2,
            pointerEvents: 'none',
            zIndex: 1000,
            background: pos.color,
            color: '#fff',
            borderRadius: '50%',
            width: 18,
            height: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 'bold',
            boxShadow: '0 0 4px rgba(0,0,0,0.2)',
            transform: 'translate(-50%, -50%)',
          }}
        >
          ●
        </div>
      ))}
    </>
  );
};

export default UserCursors; 