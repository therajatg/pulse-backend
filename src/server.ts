import mongoose from "mongoose";
import { app } from "./app";
import { FRONTEND_URL, MONGODB_URI, port } from "./constants";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";

const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      FRONTEND_URL || "",
    ].filter(Boolean),
    credentials: true,
  },
});

let ioInstance: SocketIOServer | undefined;

export const getIO = () => {
  if (!ioInstance) {
    throw new Error("Socket.io not initialized");
  }
  return ioInstance;
};

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join", (userId: string) => {
    socket.join(userId);
    console.log(`👤 User ${userId} joined room`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");

    ioInstance = io;

    httpServer.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection error:", err);
    process.exit(1);
  });

process.on("unhandledRejection", (err: Error) => {
  console.error("Unhandled Rejection:", err);
  httpServer.close(() => process.exit(1));
});

process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received, closing server gracefully");
  httpServer.close(() => {
    mongoose.connection.close();
    process.exit(0);
  });
});

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });
