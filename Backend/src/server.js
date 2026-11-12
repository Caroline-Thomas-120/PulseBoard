
import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

import { prisma } from "./lib/prisma.js";
import authRoutes from "./routes/auth.routes.js";
import issueRoutes from "./routes/issue.routes.js";
import { addIssueClient } from "./services/issueEvents.js";
import uploadRoutes from "./routes/upload.routes.js";

const app = express();
const PORT = process.env.PORT || 3001;
const httpServer = createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
];

// Express middleware
app.use(
  cors({
    origin: allowedOrigins,
  })
);

app.use(express.json());

// Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

// Allow controllers to access Socket.IO.
app.set("io", io);

// Authenticate Socket.IO connections with the same JWT secret
// and userId payload used by auth.middleware.js.
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication token is required."));
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured.");
      return next(new Error("Authentication is not configured."));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.userId) {
      return next(new Error("Invalid token payload."));
    }

    socket.data.user = {
      id: decoded.userId,
    };

    next();
  } catch (error) {
    next(new Error("Invalid or expired authentication token."));
  }
});

// Handle Socket.IO connections.
io.on("connection", (socket) => {
  console.log("PulseBoard socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("PulseBoard socket disconnected:", socket.id);
  });
});

// Existing API routes
app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/upload", uploadRoutes);
console.log("Issue routes mounted at /api/issues");

// Keep your existing Server-Sent Events endpoint.
app.get("/api/issues/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.flushHeaders();
  res.write("event: connected\ndata: {}\n\n");

  addIssueClient(res);
});

// Existing database health check
app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      success: true,
      message: "PulseBoard API and database are working!",
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

// Start the shared HTTP and Socket.IO server.
httpServer.listen(PORT, () => {
  console.log(`PulseBoard API running at http://localhost:${PORT}`);
});
