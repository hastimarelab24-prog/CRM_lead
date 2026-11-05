
const FollowUp = require("../models/FollowUp");
const Notification = require("../models/Notification");

function startFollowUpScheduler() {
  const checkNotifications = async () => {
    try {
      const now = new Date();
      const reminderEnd = new Date(now.getTime() + 15 * 60 * 1000);

      const dueFollowUps = await FollowUp.find({
        status: "pending",
        dueDate: { $gte: now, $lte: reminderEnd },
      }).select("_id title dueDate assignedTo");

      for (const item of dueFollowUps) {
        // A unique reminder key prevents repeated notifications for
        // the same follow-up within the reminder window.
        const reminderKey = `Reminder: ${item._id}`;

        await Notification.updateOne(
          {
            recipient: item.assignedTo,
            followUp: item._id,
            type: "follow_up_due",
            message: reminderKey,
          },
          {
            $setOnInsert: {
              recipient: item.assignedTo,
              followUp: item._id,
              type: "follow_up_due",
              message: `Upcoming follow-up: ${item.title}`,
              dueDate: item.dueDate,
              read: false,
            },
          },
          { upsert: true }
        );
      }

      const overdueFollowUps = await FollowUp.find({
        status: "pending",
        dueDate: { $lt: now },
      }).select("_id title dueDate assignedTo");

      for (const item of overdueFollowUps) {
        const reminderKey = `Overdue: ${item._id}`;

        await Notification.updateOne(
          {
            recipient: item.assignedTo,
            followUp: item._id,
            type: "follow_up_overdue",
            message: reminderKey,
          },
          {
            $setOnInsert: {
              recipient: item.assignedTo,
              followUp: item._id,
              type: "follow_up_overdue",
              message: `Overdue follow-up: ${item.title}`,
              dueDate: item.dueDate,
              read: false,
            },
          },
          { upsert: true }
        );
      }
    } catch (error) {
      console.error("Follow-up scheduler failed:", error.message);
    }
  };

  // Run once on startup, then every minute.
  checkNotifications();
  return setInterval(checkNotifications, 60 * 1000);
}

module.exports = startFollowUpScheduler;
