
import "dotenv/config";
import express from "express";
import cors from "cors";
import { prisma } from "./lib/prisma.js";
import authRoutes from "./routes/auth.routes.js";
import issueRoutes from "./routes/issue.routes.js";
import { addIssueClient } from "./services/issueEvents.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Allow requests from our React frontend.
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
  })
);

// Parse incoming JSON request bodies.
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);


// Keep a connection open for live issue updates.
app.get("/api/issues/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.flushHeaders();

  // Tell the browser the connection is ready.
  res.write("event: connected\ndata: {}\n\n");

  // Register this browser for future events.
  addIssueClient(res);
});

// Health-check endpoint.
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
console.log("Issue routes mounted at /api/issues");

// Start the server.
app.listen(PORT, () => {
  console.log(`PulseBoard API running at http://localhost:${PORT}`);
});
