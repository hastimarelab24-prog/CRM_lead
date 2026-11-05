const mongoose = require("mongoose");

async function connectDB() {
  const mongoURI =
    process.env.MONGODB_URI ||
    "mongodb://127.0.0.1:27017/leadsphere";

  await mongoose.connect(mongoURI);

  console.log("Connected database:", mongoose.connection.name);
}

module.exports = connectDB;