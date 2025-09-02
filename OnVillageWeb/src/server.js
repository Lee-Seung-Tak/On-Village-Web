import { io } from 'socket.io-client';
const socket = io('http://localhost:3174');

export default socket;
