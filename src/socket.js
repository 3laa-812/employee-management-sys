// src/socket.js
import { io } from "socket.io-client";

const socket = io("http://localhost:3001", {
  transports: ["polling", "websocket"], // Try polling first, then websocket
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000,
});

// Connection event handlers
socket.on("connect", () => {
  console.log("✅ Connected to notification server");
});

socket.on("disconnect", (reason) => {
  console.log("❌ Disconnected from notification server:", reason);
});

socket.on("connect_error", (error) => {
  console.error("🔴 Socket connection error:", error.message);

  // If WebSocket fails, try to force polling
  if (error.message.includes("websocket")) {
    console.log("🔄 Attempting to reconnect with polling...");
    socket.io.opts.transports = ["polling"];
  }
});

socket.on("reconnect", (attemptNumber) => {
  console.log("🔄 Reconnected after", attemptNumber, "attempts");
});

socket.on("reconnect_error", (error) => {
  console.error("🔄 Reconnection error:", error.message);
});

socket.on("reconnect_failed", () => {
  console.error("🔄 Failed to reconnect after all attempts");
});

export default socket;
