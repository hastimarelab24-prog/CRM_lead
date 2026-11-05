const mongoose = require("mongoose");
const FollowUp = require("../models/FollowUp");
const Lead = require("../models/lead");
const User = require("../models/TeamUser");
const auditLogger = require("../utils/auditLogger");
const { success } = require("zod");

const validId = (id) => mongoose.Types.ObjectId.isValid(id);

// check lead access
async function getAccessibleLead(req, leadId) {
  if (!validId(leadId)) return null;

  const lead = await Lead.findById(leadId).select("_id name assignedEmployee");

  if (!lead) return null;

  const role = req.user.role;

  if (role === "administrator") return lead;

  if (role === "employee") {
    return String(lead.assignedEmployee) === req.user.id ? lead : null;
  }

  if (role === "manager") {
    const assigned = await User.findById(lead.assignedEmployee)
      .select("manager")
      .lean();

    if (
      String(lead.assignedEmployee) === req.user.id ||
      String(assigned?.manager || "") === req.user.id
    ) {
      return lead;
    }

    return null;
  }

  return null;
}

// CHECK FOLLOW-UP ACCESS
async function canAccessFollowUp(req, followUp) {
  if (req.user.role === "administrator") {
    return true;
  }

  const leadId = followUp.lead?._id || followUp.lead;

  const lead = await getAccessibleLead(req, leadId);

  if (!lead) return false;

  if (req.user.role === "employee") {
    return String(followUp.assignedTo) === String(req.user.id);
  }

  if (req.user.role === "manager") {
    const assignee = await User.findById(followUp.assignedTo)
      .select("manager")
      .lean();

    return (
      String(followUp.assignedTo) === String(req.user.id) ||
      String(assignee?.manager || "") === String(req.user.id)
    );
  }

  return false;
}

// async function getAssignee(req, assignedTo) {
//   const targetId = assignedTo || req.user.id;
//   if (!validId(targetId)) return null;

//   const target = await User.findById(targetId)
//     .select("_id role manager isActive")
//     .lean();

//   if (!target || target.isActive === false) return null;

//   if (req.user.role === "administrator") return target;

//   if (req.user.role === "employee") {
//     return String(target._id) === req.user.id ? target : null;
//   }

//   if (req.user.role === "manager") {
//     if (String(target._id) === req.user.id) return target;
//     if (
//       target.role === "employee" &&
//       String(target.manager || "") === req.user.id
//     ) {
//       return target;
//     }
//   }

//   return null;
// }

// Example fix for fetching users/employees in your backend route or controller

exports.getAssignees = async (req, res) => {
  try {
    // Relax the filter to ensure users are returned even if isActive is missing or false
    // const users = await User.find({
    //   $or: [
    //     { isActive: true },
    //     { isActive: { $exists: false } },
    //     { iactive: true },
    //   ],
    // })
    const users = await User.find({})
      .select("_id name email role isActive")
      .sort({ name: 1 })
      .lean();

    return res.status(200).json({ success: true, users, assignees: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load team members." });
  }
};

// POST /api/follow-ups
exports.createFollowUp = async (req, res) => {
  try {
    // const leadId = req.body.leadId || req.body.lead;
    const {

      title,
      lead: leadId,
      type,
      dueDate,
      priority,
      notes,
      assignedTo,
      activityType,
      reminderAt,
    } = req.body;

    if (!leadId || !title || !dueDate) {
      return res.status(400).json({
        success: false,
        message: "Lead, title and due date are required.",
      });
    }

    // if (!["call", "email", "meeting", "task", "other"].includes(type || "call")) {
    //   return res.status(400).json({ message: "Invalid follow-up type." });
    // }

    // if (!["low", "medium", "high", "urgent"].includes(priority || "medium")) {
    //   return res.status(400).json({ message: "Invalid priority." });
    // }

    // const parsedDate = new Date(dueDate);
    // if (Number.isNaN(parsedDate.getTime())) {
    //   return res.status(400).json({ message: "Invalid due date." });
    // }

    // const accessibleLead = await getAccessibleLead(req, lead);
    // if (!accessibleLead) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "Lead not found or access denied.",
    //   });
    // }

    // const assignee = await getAssignee(req, assignedTo);
    // if (!assignee) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "You cannot assign this follow-up to that user.",
    //   });
    // }
    const parsedDate = new Date(dueDate);

    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid due date format.",
      });
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Selected lead record does not exist in the database.",
      });
    }

    const followUp = await FollowUp.create({
      lead: leadId,

      assignedTo:
        assignedTo || req.user.id || req.user._id,

      createdBy:
        req.user.id || req.user._id,

      title: title.trim(),

      type: type || "call",

      dueDate: parsedDate,

      priority: String(
        priority || "medium"
      ).toLowerCase(),

      notes: notes ? notes.trim() : "",

      reminderAt: reminderAt
        ? new Date(reminderAt)
        : null,

      status: "pending",
    });

    // await auditLogger({
    //   actor: req.user.id,
    //   action: "FOLLOW_UP_CREATED",
    //   entity: "FollowUp",
    //   entityId: followUp._id,
    //   details: { lead: String(lead), assignedTo: String(assignee._id) },
    // });

    // await Notification.create({
    //   recipient: assignee._id,
    //   followUp: followUp._id,
    //   message: `Follow-up scheduled: ${followUp.title}`,
    //   type: "follow_up_due",
    //   dueDate: followUp.dueDate,
    // });

    return res.status(201).json({
      success: true,
      message: "Follow-up created successfully.",
      followUp,
    });
  } catch (error) {
    console.error("Create follow-up:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create follow-up.",
    });
  }
};


// GET ALL FOLLOW-UPS
exports.getFollowUps = async (req, res) => {
  try {
    let followUps = await FollowUp.find({})
      .populate('lead')
      .populate({
        path: 'assignedTo',
        model: 'AuthUser'
      })
      .sort({ dueDate: 1 });

    if (followUps.length === 0) {
      followUps = await FollowUp.find({}).sort({ dueDate: 1 });
    }

    const pending = followUps.filter(f => String(f.status || 'pending').toLowerCase() === 'pending');
    const completed = followUps.filter(f => String(f.status || '').toLowerCase() === 'completed');
    const cancelled = followUps.filter(f => String(f.status || '').toLowerCase() === 'cancelled');

    // return res.status(200).json({

    //   success: true,
    //   followUps,
    //   pending,
    //   completed,
    //   cancelled,
    //   counts: {
    //     all: followUps.length,
    //     pending: pending.length,
    //     completed: completed.length,
    //     cancelled: cancelled.length,
    //     overdue: 0,
    //     upcoming: 0
    //   }

    // });

    return sendFollowUpResponse(res, followUps)
  } catch (error) {
    console.error("Get FollowUps Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

function sendFollowUpResponse(res, followUps) {
  const now = new Date();

  const pending = followUps.filter(
    (item) =>
      String(item.status || "").toLowerCase() === "pending"
  );

  const completed = followUps.filter(
    (item) =>
      String(item.status || "").toLowerCase() === "completed"
  );

  const cancelled = followUps.filter(
    (item) =>
      String(item.status || "").toLowerCase() === "cancelled"
  );

  const overdue = pending.filter(
    (item) =>
      item.dueDate &&
      new Date(item.dueDate) < now
  );

  const upcoming = pending.filter(
    (item) =>
      item.dueDate &&
      new Date(item.dueDate) >= now
  );

  return res.status(200).json({
    success: true,
    followUps,
    pending,
    completed,
    cancelled,
    overdue,
    upcoming,

    counts: {
      all: followUps.length,
      pending: pending.length,
      completed: completed.length,
      cancelled: cancelled.length,
      overdue: overdue.length,
      upcoming: upcoming.length,
    },
  });
}





// PATCH /api/follow-ups/:id
exports.updateFollowUp = async (req, res) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({ message: "Invalid follow-up ID." });
    }

    const followUp = await FollowUp.findById(req.params.id);
    if (!followUp || !(await canAccessFollowUp(req, followUp))) {
      return res.status(404).json({
        message: "Follow-up not found or access denied.",
      });
    }

    const allowedFields = [
      "title",
      "type",
      "dueDate",
      "priority",
      "notes",
      "assignedTo",
    ];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === "assignedTo") {
          if (!validId(req.body.assignedTo)) {
            return res.status(400).json({
              success: false,
              message: "Invalid assignee ID.",
            });
          }

          const assignee = await User.findById(
            req.body.assignedTo
          );

          if (!assignee) {
            return res.status(404).json({
              success: false,
              message: "Assignee not found.",
            });
          }

          followUp.assignedTo = assignee._id;
        } else {
          followUp[field] = req.body[field];
        }
      }
    }

    await followUp.save();

    await auditLogger({
      actor: req.user.id,
      action: "FOLLOW_UP_UPDATED",
      entity: "FollowUp",
      entityId: followUp._id,
      details: { fields: Object.keys(req.body) },
    });

    return res.json({ success: true, followUp });
  } catch (error) {
    console.error("Update follow-up:", error);
    return res.status(500).json({ message: "Failed to update follow-up." });
  }
};

// PATCH /api/follow-ups/:id/complete
exports.completeFollowUp = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid follow-up ID."
      });
    }

    const followUp = await FollowUp.findById(id);

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: "Follow-up not found."
      });
    }

    if (followUp.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cancelled follow-up cannot be completed."
      });
    }

    // ઓથોરાઈઝેશન અથવા રોલની કોઈપણ શરત વગર સીધું જ સ્ટેટસ કમ્પ્લીટ કરો
    followUp.status = "completed";
    followUp.completedAt = new Date();

    await followUp.save();

    return res.status(200).json({
      success: true,
      message: "Follow-up completed successfully.",
      followUp
    });

  } catch (error) {
    console.error("Complete Follow-up Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// DELETE /api/follow-ups/:id
exports.deleteFollowUp = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await FollowUp.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Follow-up not found." });
    }

    res.status(200).json({ success: true, message: "Follow-up deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
