import { Server } from 'socket.io';
import config from './index.js';

let io;

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: config.app.clientUrl,
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    socket.on('join', (userId) => {
      socket.join(`user:${userId}`);
      console.log(`Socket client joined room user:${userId}`);
    });

    socket.on('disconnect', () => {
      console.log('Socket client disconnected');
    });
  });

  return io;
}

export function emitToUser(userId, event, data) {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}
