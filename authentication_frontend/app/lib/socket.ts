"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectSocket = () => {
  if (!socket) {
    const token = localStorage.getItem("token");

    socket = io("http://localhost:5000", {
      auth: {
        token, 
      },
    });

    socket.on("connect", () => {
      console.log(" Socket connected:", socket?.id);
    });

    socket.on("connect_error", (err) => {
      console.error(" Socket error:", err.message);
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
