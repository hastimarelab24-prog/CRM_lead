const mongoose = require("mongoose");

const followUpSchema = new mongoose.Schema(
  {
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: [true, "Activity title is required."],
      trim: true,
    },

    type: {
      type: String,
      enum: ["call", "email", "meeting", "task", "other"],
      default: "call",
    },

    dueDate: {
      type: Date,
      required: [true, "Due date is required."],
      index: true,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      lowercase: true,
      default: "medium",
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthUser",
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthUser",
      default: null,
    },

    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      lowercase: true,
      default: "pending",
      index: true,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

followUpSchema.index({
  status: 1,
  dueDate: 1,
  assignedTo: 1,
});

module.exports = mongoose.model(
  "FollowUp",
  followUpSchema,
  "followups"
);