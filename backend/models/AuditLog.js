


const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      required:true,
    },
    action: {
      type: String,
      required: true,
      trim:true,
    },
    entity: {
      type: String,
      required: true,
      trim:true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: "",
    },
    details: {
      type: String,
      default: "",
      trim:true,
    },ipAddress:{
      type:String,
      default:'',
    }
  },
  { timestamps: true }
);

// auditLogSchema.index({ createdAt: -1 });
// auditLogSchema.index({ actor: 1, createdAt: -1 });

module.exports = mongoose.models.AuditLog ||
  mongoose.model("AuditLog", auditLogSchema);
