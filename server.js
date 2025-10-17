// server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const routes = require("./routes");
require("dotenv").config();
require("./db");

const app = express();
app.use(express.json());

// ✅ CORS configuration — allow Netlify frontend + local dev
app.use(
  cors({
    origin: [
      "https://brilliant-daifuku-9c01c8.netlify.app", // your Netlify frontend URL
      "http://localhost:5173", // local dev
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// ✅ Serve uploaded images/files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ API routes
app.use("/api", routes);

// ✅ Default route (optional for testing)
app.get("/", (req, res) => {
  res.send("✅ Backend server is running successfully!");
});

// ✅ Start the server (Render uses its own PORT)
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
