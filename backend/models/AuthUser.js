const mongoose = require("mongoose");

const authUserSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    role: {
      type: String,
      enum: ["administrator", "manager", "employee"],
      default: "employee",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuthUser", authUserSchema);