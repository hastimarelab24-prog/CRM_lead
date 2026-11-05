const mongoose = require("mongoose");

const LeadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    company: { type: String, default: "", trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, default: "", trim: true },
    source: {
      type: String,
      required: true,
      lowercase: true,
      enum: [
        "website",
        "referral",
        "cold outreach",
        "inbound call",
        "social media",
      ],
    },
    status: {
      type: String,
      required: true,
      enum: [
        "New",
        "new",
        "Contacted",
        "contacted",
        "Qualified",
        "qualified",
        "Proposal Sent",
        "proposal sent",
        "Proposal sent",
        "Nurturing",
        "nurturing",
        "Lost",
        "lost",
        "Won",
        "won",
      ],
      default: "New",
    },
    assignedEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TeamUser",
    },

    followUpDate: { type: Date, default: null },
    followUpTime: { type: String, default: "" },
  priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      lowercase: true,
      default: "medium",
    },
    followUpNote: { type: String, default: "" },
    followUpStatus: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },
  },
  { timestamps: true },
);

const Lead = mongoose.models.Lead || mongoose.model("Lead", LeadSchema);
module.exports = Lead;