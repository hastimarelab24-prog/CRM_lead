// const AuditLog = require("../models/AuditLog");
// const User = require("../models/TeamUser");

import AuditLog from "../models/AuditLog";

// exports.getAuditLogs = async (req, res) => {
//   try {
//     const page = Math.max(1, parseInt(req.query.page, 10) || 1);
//     const limit = Math.min(
//       100,
//       Math.max(1, parseInt(req.query.limit, 10) || 20)
//     );

//     const filter = {};

//     if (req.user.role === "employee") {
//       filter.actor = req.user.id;
//     } else if (req.user.role === "manager") {
//       const team = await User.find({
//         $or: [{ _id: req.user.id }, { manager: req.user.id }],
//       }).select("_id");

//       filter.actor = { $in: team.map((user) => user._id) };
//     }

//     if (req.query.action) filter.action = req.query.action;
//     if (req.query.entity) filter.entity = req.query.entity;

//     const [logs, total] = await Promise.all([
//       AuditLog.find(filter)
//         .populate("actor", "name email role")
//         .sort({ createdAt: -1 })
//         .skip((page - 1) * limit)
//         .limit(limit)
//         .lean(),
//       AuditLog.countDocuments(filter),
//     ]);

//     return res.json({
//       success: true,
//       logs,
//       pagination: {
//         page,
//         limit,
//         total,
//         totalPages: Math.ceil(total / limit),
//       },
//     });
//   } catch (error) {
//     console.error("Audit logs:", error);
//     return res.status(500).json({ message: "Failed to load audit logs." });
//   }
// };

exports.getAuditLogs = async (req, res) => {
  try {
    // restrict to adminstrators
    // const role = req.user.role?.toLowerCase();
    // if (role !== "administrator" && role !== "admin") {
    //   return res
    //     .status(403)
    //     .json({
    //       success: false,
    //       messange: "access denied. administrator role required.",
    //     });
    // }
    const logs = await AuditLog.find({})
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .lean();
    return res
      .status(200)
      .json({ success: true, count: logs.length, auditlog: logs, data: logs });
  } catch (err) {
    console.error("fetch audit logs error:", err);
    return res
      .status(500)
      .json({ success: false, messange: "failed to load audit logs" });
  }
};
