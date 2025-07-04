import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';

const BATCH_SIZE = 10;
const FLUSH_DELAY = 40; // ms

const DrawingCanvas = forwardRef(({ tool, socket, roomCode, initDrawing, canvasElRef }, ref) => {
  const canvasRef = useRef();
  const drawing = useRef(false);
  const lastPoint = useRef(null);
  const userId = useRef(Math.random().toString(36).substr(2, 9));
  const batchBuffer = useRef([]);
  const flushTimeout = useRef();

  useImperativeHandle(ref, () => ({
    clear: () => {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      if (socket) socket.emit('clear-canvas');
    }
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 56;
  }, []);

  // Draw a single stroke
  const drawStroke = (ctx, data) => {
    if (!data || !data.from || !data.to || typeof data.from.x !== 'number' || typeof data.from.y !== 'number' || typeof data.to.x !== 'number' || typeof data.to.y !== 'number') return;
    ctx.strokeStyle = data.color || 'black';
    ctx.lineWidth = data.width || 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(data.from.x, data.from.y);
    ctx.lineTo(data.to.x, data.to.y);
    ctx.stroke();
  };

  // Render initial drawing data
  useEffect(() => {
    if (!initDrawing || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    for (const cmd of initDrawing) {
      if (cmd.type === 'stroke' && cmd.data && cmd.data.from && cmd.data.to) {
        if (Array.isArray(cmd.data)) {
          // Batch: replay all segments
          cmd.data.forEach(seg => drawStroke(ctx, seg));
        } else {
          drawStroke(ctx, cmd.data);
        }
      } else if (cmd.type === 'clear') {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }, [initDrawing]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;
    const ctx = canvasRef.current.getContext('2d');
    socket.on('draw-start', data => {
      if (data.id !== userId.current) {
        if (Array.isArray(data)) {
          data.forEach(seg => drawStroke(ctx, seg));
        } else {
          drawStroke(ctx, data);
        }
      }
    });
    socket.on('draw-move', data => {
      if (data.id !== userId.current) {
        if (Array.isArray(data)) {
          data.forEach(seg => drawStroke(ctx, seg));
        } else {
          drawStroke(ctx, data);
        }
      }
    });
    socket.on('draw-end', data => {
      // Optionally handle end of stroke
    });
    socket.on('clear-canvas', () => {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    });
    return () => {
      socket.off('draw-start');
      socket.off('draw-move');
      socket.off('draw-end');
      socket.off('clear-canvas');
    };
  }, [socket]);

  const getPos = (e) => {
    if (e.touches) {
      const touch = e.touches[0];
      return { x: touch.clientX, y: touch.clientY };
    }
    return { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
  };

  // Flush batch buffer
  const flushBatch = (eventType) => {
    if (batchBuffer.current.length === 0) return;
    if (socket) {
      socket.emit(eventType, batchBuffer.current.length === 1 ? batchBuffer.current[0] : [...batchBuffer.current]);
    }
    batchBuffer.current = [];
    if (flushTimeout.current) {
      clearTimeout(flushTimeout.current);
      flushTimeout.current = null;
    }
  };

  const startDraw = (e) => {
    drawing.current = true;
    lastPoint.current = getPos(e);
    batchBuffer.current = [];
    flushBatch('draw-start');
  };

  const draw = (e) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const pos = getPos(e);
    if (lastPoint.current && pos) {
      const seg = { from: lastPoint.current, to: pos, color: tool.color, width: tool.width };
      drawStroke(ctx, seg);
      batchBuffer.current.push(seg);
      if (batchBuffer.current.length >= BATCH_SIZE) {
        flushBatch('draw-move');
      } else {
        if (flushTimeout.current) clearTimeout(flushTimeout.current);
        flushTimeout.current = setTimeout(() => flushBatch('draw-move'), FLUSH_DELAY);
      }
      lastPoint.current = pos;
    }
  };

  const endDraw = (e) => {
    if (!drawing.current) return;
    drawing.current = false;
    flushBatch('draw-move');
    flushBatch('draw-end');
    lastPoint.current = null;
  };

  const handleStart = (e) => {
    startDraw(e);
    if (socket) {
      const pos = getPos(e);
      socket.emit('draw-start', { from: pos, to: pos, color: tool.color, width: tool.width });
    }
  };

  return (
    <canvas
      ref={el => {
        canvasRef.current = el;
        if (canvasElRef) canvasElRef(el);
      }}
      style={{ width: '100%', height: '100%', background: '#fff', display: 'block', touchAction: 'none', cursor: 'none' }}
      onMouseDown={handleStart}
      onMouseMove={draw}
      onMouseUp={endDraw}
      onMouseLeave={endDraw}
      onTouchStart={handleStart}
      onTouchMove={draw}
      onTouchEnd={endDraw}
    />
  );
});

export default DrawingCanvas; 