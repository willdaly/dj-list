import { io } from 'socket.io-client';

let socket;

export function initSockets() {
  socket = io('/app');
  return socket;
}
