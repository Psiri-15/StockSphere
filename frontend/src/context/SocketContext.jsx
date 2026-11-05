import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [latestToast, setLatestToast] = useState(null);

  useEffect(() => {
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://stocksphere-api-gku2.onrender.com';
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('[Socket.IO] Connected to server with ID:', newSocket.id);
      if (user && user._id) {
        newSocket.emit('join_room', `user_${user._id}`);
        newSocket.emit('join_room', `role_${user.role}`);
      }
    });

    newSocket.on('notification', (data) => {
      setLatestToast(data);
      setTimeout(() => {
        setLatestToast((current) => (current === data ? null : current));
      }, 5000);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const dismissToast = () => setLatestToast(null);

  return (
    <SocketContext.Provider value={{ socket, latestToast, dismissToast }}>
      {children}
      {/* Real-time Toast Banner */}
      {latestToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-navy-900 text-white p-4 rounded-xl shadow-2xl border border-navy-700 animate-fade-in flex items-start space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-teal-400 mt-1.5 flex-shrink-0 animate-ping" />
          <div className="flex-1">
            <h4 className="font-semibold text-sm text-white flex items-center justify-between">
              {latestToast.title}
              <button
                onClick={dismissToast}
                className="text-slate-400 hover:text-white text-xs ml-2"
              >
                ✕
              </button>
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {latestToast.message}
            </p>
          </div>
        </div>
      )}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
