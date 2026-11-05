


const Notification = require("../models/Notification");
const mongoose = require("mongoose");
const auditLogger = require("../utils/auditLogger");

// GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user.id,
    })
      .populate("followUp", "title dueDate status priority")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return res.json({ success: true, notifications });
  } catch (error) {
    console.error("Get notifications:", error);
    return res.status(500).json({ message: "Failed to load notifications." });
  }
};

// PATCH /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid notification ID." });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { $set: { read: true } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found.",
      });
    }

    await auditLogger({
      actor: req.user.id,
      action: "NOTIFICATION_READ",
      entity: "Notification",
      entityId: notification._id,
    });

    return res.json({ success: true, notification });
  } catch (error) {
    console.error("Mark notification read:", error);
    return res.status(500).json({ message: "Failed to update notification." });
  }
};

// PATCH /api/notifications/read-all
exports.markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { $set: { read: true } }
    );

    return res.json({
      success: true,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Mark all notifications read:", error);
    return res.status(500).json({ message: "Failed to update notifications." });
  }
};
