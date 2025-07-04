const Room = require('../models/Room');

module.exports = (io) => {
  // Track users in rooms for presence
  const roomUsers = {};

  io.on('connection', (socket) => {
    let currentRoom = null;

    socket.on('join-room', async (roomId) => {
      socket.join(roomId);
      currentRoom = roomId;
      roomUsers[roomId] = roomUsers[roomId] || new Set();
      roomUsers[roomId].add(socket.id);
      // Send user count
      io.to(roomId).emit('user-count', roomUsers[roomId].size);
      // Send existing drawing data
      const room = await Room.findOne({ roomId });
      if (room) {
        socket.emit('init-drawing', room.drawingData);
      }
    });

    socket.on('leave-room', (roomId) => {
      socket.leave(roomId);
      if (roomUsers[roomId]) {
        roomUsers[roomId].delete(socket.id);
        io.to(roomId).emit('user-count', roomUsers[roomId].size);
      }
    });

    socket.on('cursor-move', (data) => {
      if (currentRoom) {
        socket.to(currentRoom).emit('cursor-move', { ...data, id: socket.id });
      }
    });

    // Helper to add id to each segment in a batch
    function addIdToBatch(data, id) {
      if (Array.isArray(data)) {
        return data.map(seg => ({ ...seg, id }));
      } else {
        return { ...data, id };
      }
    }

    socket.on('draw-start', async (data) => {
      if (currentRoom) {
        const toSend = addIdToBatch(data, socket.id);
        socket.to(currentRoom).emit('draw-start', toSend);
        // Save to DB
        await Room.updateOne(
          { roomId: currentRoom },
          { $push: { drawingData: { type: 'stroke', data, timestamp: new Date() } }, $set: { lastActivity: new Date() } }
        );
      }
    });

    socket.on('draw-move', async (data) => {
      if (currentRoom) {
        const toSend = addIdToBatch(data, socket.id);
        socket.to(currentRoom).emit('draw-move', toSend);
        // Save to DB
        await Room.updateOne(
          { roomId: currentRoom },
          { $push: { drawingData: { type: 'stroke', data, timestamp: new Date() } }, $set: { lastActivity: new Date() } }
        );
      }
    });

    socket.on('draw-end', async (data) => {
      if (currentRoom) {
        const toSend = addIdToBatch(data, socket.id);
        socket.to(currentRoom).emit('draw-end', toSend);
        // Save to DB
        await Room.updateOne(
          { roomId: currentRoom },
          { $push: { drawingData: { type: 'stroke', data, timestamp: new Date() } }, $set: { lastActivity: new Date() } }
        );
      }
    });

    socket.on('clear-canvas', async () => {
      if (currentRoom) {
        io.to(currentRoom).emit('clear-canvas');
        await Room.updateOne(
          { roomId: currentRoom },
          { $push: { drawingData: { type: 'clear', data: {}, timestamp: new Date() } }, $set: { lastActivity: new Date() } }
        );
      }
    });

    socket.on('disconnect', () => {
      if (currentRoom && roomUsers[currentRoom]) {
        roomUsers[currentRoom].delete(socket.id);
        io.to(currentRoom).emit('user-count', roomUsers[currentRoom].size);
      }
    });
  });
}; 