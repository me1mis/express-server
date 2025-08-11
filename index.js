const express = require("express");
const path = require("path");

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Custom middleware for logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Mini Express Server!",
    status: "running",
    timestamp: new Date().toISOString(),
    endpoints: ["/api/health", "/api/users", "/api/users/:id", "/api/echo"],
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Sample users data
let users = [
  { id: 1, name: "John Doe", email: "john@example.com" },
  { id: 2, name: "Jane Smith", email: "jane@example.com" },
  { id: 3, name: "Bob Johnson", email: "bob@example.com" },
];

// Get all users
app.get("/api/users", (req, res) => {
  res.json(users);
});

// Get user by ID
app.get("/api/users/:id", (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});

// Create new user
app.post("/api/users", (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  const newUser = {
    id: users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1,
    name,
    email,
  };

  users.push(newUser);
  res.status(201).json(newUser);
});

// Update user
app.put("/api/users/:id", (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  const { name, email } = req.body;
  users[userIndex] = { ...users[userIndex], ...req.body };

  res.json(users[userIndex]);
});

// Delete user
app.delete("/api/users/:id", (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  const deletedUser = users.splice(userIndex, 1)[0];
  res.json({ message: "User deleted successfully", user: deletedUser });
});

// Echo endpoint for testing
app.post("/api/echo", (req, res) => {
  res.json({
    message: "Echo response",
    received: req.body,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler for undefined routes
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
    method: req.method,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mini Express Server running on port ${PORT}`);
  console.log(`📱 Server URL: http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`👥 Users API: http://localhost:${PORT}/api/users`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down server gracefully...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Shutting down server gracefully...");
  process.exit(0);
});
