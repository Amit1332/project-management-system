// client/src/services/socket.js

import { io } from "socket.io-client";

let socket = null;

export const initSocket = (token) => {
  if (socket) {
    socket.disconnect();
  }

  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || "http://localhost:3001";

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    transports: ["websocket", "polling"],
    autoConnect: true,
  });

  socket.on("connect", () => {
    console.log("Realtime socket connected:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.warn("Socket connection error:", err.message);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinRoom = (roomType, id) => {
  if (socket && id) {
    socket.emit(`join:${roomType}`, id);
  }
};

export const leaveRoom = (roomType, id) => {
  if (socket && id) {
    socket.emit(`leave:${roomType}`, id);
  }
};
