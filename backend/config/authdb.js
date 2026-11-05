const mongoose = require("mongoose");

const authConnection = mongoose.createConnection(
  process.env.AUTH_MONGODB_URI ||
    "mongodb://127.0.0.1:27017/crm_auth_db"
);

authConnection.on("connected", () => {
  console.log("Connected to crm_auth_db");
});

authConnection.on("error", (error) => {
  console.error("Auth database error:", error.message);
});

module.exports = authConnection;