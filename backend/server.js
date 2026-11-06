require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db"); 
const leadRoute = require('./routes/leadRoutes')
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware must run before routes
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Load and validate routers
const loadRouter = (name, path) => {
  const router = require(path);

  if (typeof router !== "function") {
    throw new TypeError(
      `${name} must export an Express router. Check ${path}`
    );
  }

  return router;
};

// Register each route only once
app.use("/api/auth", require("./routes/authRoutes"));
app.use(
  "/api/follow-ups",
  loadRouter("Follow-up routes", "./routes/followUpRoutes")
);
app.use(
  "/api/dashboard",
  loadRouter("Dashboard routes", "./routes/dashboardRoutes")
);

app.use("/api/leads", loadRouter("Lead routes", "./routes/leadRoutes"));

app.use("/api/users", loadRouter("User routes", "./routes/userRoutes"));

app.use(
  "/api/notifications",
  loadRouter("Notification routes", "./routes/notificationRoutes")
);

app.use(
  "/api/audit-logs",
  loadRouter("Audit log routes", "./routes/auditLogRoutes")
);

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "LeadSphere CRM API is running.",
  });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack || err);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(err.status || 500).json({
    success: false,
    message:
      err.status && err.status < 500
        ? err.message
        : "Internal Server Error",
  });
});

// Start after the main CRM database connects
async function startServer() {
  try {
    await connectDB();

    console.log("LeadSphere database connected.");

    app.listen(PORT, () => {
      console.log(`LeadSphere CRM API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();