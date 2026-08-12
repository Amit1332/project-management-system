// client/src/services/socket.js

import { io } from "socket.io-client";

let socket = null;

const activeRooms = new Set();

export const joinRoom = (roomType, id) => {
  if (!id) return;
  const roomKey = `${roomType}:${id}`;
  activeRooms.add(roomKey);

  if (socket && socket.connected) {
    socket.emit(`join:${roomType}`, id);
  }
};

export const leaveRoom = (roomType, id) => {
  if (!id) return;
  const roomKey = `${roomType}:${id}`;
  activeRooms.delete(roomKey);

  if (socket && socket.connected) {
    socket.emit(`leave:${roomType}`, id);
  }
};

export const initSocket = (token) => {
  if (socket) {
    socket.disconnect();
  }

  const isProductionDomain =
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1";

  const defaultBackendUrl = isProductionDomain
    ? "https://project-management-system-31oc.onrender.com"
    : "http://localhost:3001";

  const rawSocketUrl =
    import.meta.env.VITE_SOCKET_URL ||
    import.meta.env.VITE_API_URL ||
    defaultBackendUrl;

  const SOCKET_URL = rawSocketUrl.replace(/\/+$/, "").replace(/\/api$/, "");

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    transports: ["websocket", "polling"],
    autoConnect: true,
  });

  socket.on("connect", () => {
    console.log("Realtime socket connected:", socket.id);
    activeRooms.forEach((roomKey) => {
      const [type, id] = roomKey.split(":");
      socket.emit(`join:${type}`, id);
    });
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

export const onSocketEvent = (event, callback) => {
  if (!event || typeof callback !== "function") return () => {};

  let intervalId = null;

  if (socket) {
    socket.on(event, callback);
  } else {
    intervalId = setInterval(() => {
      if (socket) {
        socket.on(event, callback);
        clearInterval(intervalId);
        intervalId = null;
      }
    }, 200);
  }

  return () => {
    if (intervalId) clearInterval(intervalId);
    if (socket) {
      socket.off(event, callback);
    }
  };
};
