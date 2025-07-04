const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

// Helper to validate room code
function isValidRoomCode(code) {
  return /^[a-zA-Z0-9]{6,8}$/.test(code);
}

// GET /api/rooms - list rooms with recent activity (last 24h)
router.get('/', async (req, res) => {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const rooms = await Room.find({ lastActivity: { $gte: since } }, { roomId: 1, lastActivity: 1, _id: 0 });
  res.json({ success: true, rooms });
});

// POST /api/rooms/create - create a new room only if it does not exist
router.post('/create', async (req, res) => {
  const { roomId } = req.body;
  if (!isValidRoomCode(roomId)) {
    return res.status(400).json({ success: false, message: 'Invalid room code' });
  }
  let room = await Room.findOne({ roomId });
  if (room) {
    return res.status(409).json({ success: false, message: 'Room already exists' });
  }
  room = new Room({ roomId });
  await room.save();
  res.json({ success: true, roomId: room.roomId });
});

// POST /api/rooms/join
router.post('/join', async (req, res) => {
  const { roomId } = req.body;
  if (!isValidRoomCode(roomId)) {
    return res.status(400).json({ success: false, message: 'Invalid room code' });
  }
  let room = await Room.findOne({ roomId });
  if (!room) {
    room = new Room({ roomId });
    await room.save();
  }
  res.json({ success: true, roomId: room.roomId });
});

// GET /api/rooms/:roomId
router.get('/:roomId', async (req, res) => {
  const { roomId } = req.params;
  if (!isValidRoomCode(roomId)) {
    return res.status(400).json({ success: false, message: 'Invalid room code' });
  }
  const room = await Room.findOne({ roomId });
  if (!room) {
    return res.status(404).json({ success: false, message: 'Room not found' });
  }
  res.json({ success: true, room });
});

module.exports = router; 