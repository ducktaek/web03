const { Server } = require('socket.io');

const socketHandler = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('New connection:', socket.id);

    socket.on('join room', (roomname) => {
      socket.join(roomname);
      socket.to(roomname).emit('welcome', socket.id);
    });

    socket.on('offer', (offer, roomname, targetSocketId) => {
      io.to(targetSocketId).emit('offer', offer, socket.id);
    });

    socket.on('answer', (answer, roomname, targetSocketId) => {
      io.to(targetSocketId).emit('answer', answer, socket.id);
    });

    socket.on('ice', (ice, roomname, targetSocketId) => {
      io.to(targetSocketId).emit('ice', ice, socket.id);
    });

    // 채팅 메시지 이벤트 처리
    socket.on('chat message', (data, roomname) => {
      io.to(roomname).emit('chat message', { id: socket.id, message: data.message, timestamp: data.timestamp });
      console.log(`[${data.timestamp}] ${socket.id}: ${data.message}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      io.emit('user disconnected', socket.id);
    });
  });
};

module.exports = socketHandler;
