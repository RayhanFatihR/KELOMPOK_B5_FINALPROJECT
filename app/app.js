require("dotenv").config();

const express = require("express");
const path = require("path");
const connectDB = require("./config/database");

const app = express();

// ========================
// MIDDLEWARE
// ========================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set view engine
app.set("view engine", "ejs");
app.set("views", __dirname + "/view");

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, "public")));

// Simple request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Global Error:", err.stack || err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal Server Error",
      status: err.status || 500
    }
  });
});

// ========================
// START SERVER
// ========================
async function startServer() {
  try {
    console.log("🔄 Initializing database connection...");
    const db = await connectDB();
    console.log("✅ Database pool initialized successfully");

    // Inject DB pool into each request
    app.use((req, res, next) => {
      req.db = db;
      next();
    });

    // Load application routes
    const routes = require("./routes/index");
    app.use("/", routes);

    // Health check
    app.get("/health", (req, res) => {
      res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    // 404 handler (render view if available)
    app.use((req, res) => {
      res.status(404).render("404", { url: req.originalUrl });
    });

    // Start server
    const PORT = process.env.APP_PORT || 3000;
    const HOST = "0.0.0.0";

    const server = app.listen(PORT, HOST, () => {
      console.log("=================================");
      console.log("🚀 Server Information");
      console.log("=================================");
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Server: http://${HOST}:${PORT}`);
      console.log(`Health: http://${HOST}:${PORT}/health`);
      console.log("=================================");
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n⚠️  ${signal} received, shutting down gracefully...`);

      server.close(async () => {
        console.log("✅ HTTP server closed");

        try {
          await db.end();
          console.log("✅ Database connections closed");
          process.exit(0);
        } catch (err) {
          console.error("❌ Error during shutdown:", err);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error("❌ Forced shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

// Handle unhandled promise rejections and uncaught exceptions
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

startServer();
