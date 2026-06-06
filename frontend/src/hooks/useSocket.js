import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useDispatch } from 'react-redux';
import { addNotification } from '../store/uiSlice.js';
import { showToast } from '../components/common/Toast.jsx';

let socket;

export function useSocket(userId) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!userId) return;

    const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000/api' : '/api');
    const socketUrl = apiUrl.replace(/\/api$/, '') || '/'; // Get base URL or relative root

    socket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket']
    });

    socket.on('connect', () => {
      socket.emit('join', userId);
    });

    socket.on('notification', (data) => {
      dispatch(addNotification(data));
      showToast(data.message, 'info');
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [userId, dispatch]);

  return socket;
}
