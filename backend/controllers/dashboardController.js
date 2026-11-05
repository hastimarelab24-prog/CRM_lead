const Lead = require("../models/lead");
const FollowUp = require("../models/FollowUp");
const Activity = require("../models/Activity");
// const User = require("../models/AuthUser");
const User = require("../models/TeamUser");

// Date filter for leads and follow-ups
const getDateFilter = (startDate, endDate, field = "createdAt") => {
  const filter = {};
  const dateCondition = {};

  if (startDate) {
    const start = new Date(`${startDate}T00:00:00.000`);

    if (!Number.isNaN(start.getTime())) {
      dateCondition.$gte = start;
    }
  }

  if (endDate) {
    const end = new Date(`${endDate}T23:59:59.999`);

    if (!Number.isNaN(end.getTime())) {
      dateCondition.$lte = end;
    }
  }

  if (Object.keys(dateCondition).length > 0) {
    filter[field] = dateCondition;
  }

  return filter;
};

// export leads csv
exports.exportLeadsCSV = async (req, res) => {
  try {
    const leads = await Lead.find()
      .populate("assignedEmployee", "name email")
      .sort({ createdAt: -1 })
      .lean();
    const headers = [
      "Name",
      "Email",
      "Company",
      "Phone",
      "Status",
      "Source",
      "Assigned Employee",
      "Created At",
    ];
    const escapeCSV = (value) => {
      const text = String(value ?? "");
      return `"${text.replace(/"/g, '""')}"`;
    };
    const rows = leads.map((lead) => [
      lead.name,
      lead.email,
      lead.company,
      lead.phone,
      lead.status,
      lead.source,
      lead.assignedEmployee?.name || "",
      lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "",
    ]);

    const csv = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");
    res.setHeader("Content-Type", "text/csv;charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="leads.csv');
    return res.status(200).send("\uFEFF" + csv);
  } catch (err) {
    console.error("export csv error", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "failed to export leads",
        error: error.messange,
      });
  }
};
// Dashboard API
exports.getDashboardData = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = getDateFilter(startDate, endDate, "createdAt");
    const followUpDateFilter = getDateFilter(startDate, endDate, "dueDate");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Total leads
    const totalLeads = await Lead.countDocuments(dateFilter);

    // Leads by status
    const leadsByStatusRaw = await Lead.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: { $toLower: "$status" },
          count: { $sum: 1 },
        },
      },
    ]);

    const statusMap = {
      new: 0,
      contacted: 0,
      qualified: 0,
      "proposal sent": 0,
      nurturing: 0,
      won: 0,
      lost: 0,
    };

    const statusLabels = {
      new: "New",
      contacted: "Contacted",
      qualified: "Qualified",
      "proposal sent": "Proposal Sent",
      nurturing: "Nurturing",
      won: "Won",
      lost: "Lost",
    };

    leadsByStatusRaw.forEach((item) => {
      if (item._id && statusMap[item._id] !== undefined) {
        statusMap[item._id] = item.count;
      }
    });

    const leadsByStatus = Object.entries(statusMap).map(([status, count]) => ({
      status: statusLabels[status],
      count,
    }));

    // Active leads
    const wonCount = statusMap.won;
    const lostCount = statusMap.lost;

    const activeLeads = Math.max(totalLeads - wonCount - lostCount, 0);

    // Conversion rate
    const conversionRate =
      totalLeads > 0 ? Number(((wonCount / totalLeads) * 100).toFixed(2)) : 0;

    // Lead sources
    const leadSources = await Lead.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$source",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          source: "$_id",
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Total revenue
    const totalValueResult = await Lead.aggregate([
      {
        $match: {
          ...dateFilter,
          status: { $in: ["Won", "won"] },
        },
      },
      {
        $group: {
          _id: null,
          totalValue: {
            $sum: { $ifNull: ["$dealValue", 0] },
          },
        },
      },
    ]);

    const totalRevenue =
      totalValueResult.length > 0 ? totalValueResult[0].totalValue : 0;

    // Get employees from AuthUser
    const employees = await User.find({
      // role: { $in: ["manager", "employee"] },
      // isActive: { $ne: false },
    })
      .select("_id name email role")
      .lean();

    const employeeIds = employees.map((employee) => employee._id);
    console.log("active empolyee");

    // Employee lead counts
    const employeeLeadCounts = employeeIds.length
      ? await Lead.aggregate([
          {
            $match: {
              ...dateFilter,
              // assignedEmployee: { $in: employeeIds },
            },
          },
          {
            $group: {
              _id: "$assignedEmployee",
              totalLeads: { $sum: 1 },
              wonLeads: {
                $sum: {
                  $cond: [
                    {
                      $eq: [{ $toLower: { $ifNull: ["$status", ""] } }, "won"],
                    },
                    1,
                    0,
                  ],
                },
              },
            },
          },
        ])
      : [];

    // Employee follow-up counts
    const employeeFollowUpCounts = employeeIds.length
      ? await FollowUp.aggregate([
          {
            $match: {
              ...followUpDateFilter,
              // assignedTo: { $in: employeeIds },
            },
          },
          {
            $group: {
              _id: "$assignedTo",

              totalFollowUps: { $sum: 1 },

              completedFollowUps: {
                $sum: {
                  $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
                },
              },

              pendingFollowUps: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ["$status", "pending"] },
                        // { $gte: ["$dueDate", today] },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },

              overdueFollowUps: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ["$status", "pending"] },
                        // { $lt: ["$dueDate", today] },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
            },
          },
        ])
      : [];
    // Employee activity summary
    const leadCountMap = {};

    employeeLeadCounts.forEach((item) => {
      if (item._id) {
        leadCountMap[item._id.toString()] = item;
      }
    });

    const followUpCountMap = {};

    employeeFollowUpCounts.forEach((item) => {
      if (item._id) {
        followUpCountMap[item._id.toString()] = item;
      }
    });

    const employeeActivitySummary = employees.map((employee) => {
      const id = employee._id.toString();

      const leadData = leadCountMap[id] || {};
      const followUpData = followUpCountMap[id] || {};

      return {
        employeeId: employee._id,
        name: employee.name || "Unknow",
        email: employee.email || "-",
        role: employee.role || "empolyee",
        totalLeads: leadData.totalLeads || 0,
        wonLeads: leadData.wonLeads || 0,
        totalFollowUps: followUpData.totalFollowUps || 0,
        completedFollowUps: followUpData.completedFollowUps || 0,
        pendingFollowUps: followUpData.pendingFollowUps || 0,
        overdueFollowUps: followUpData.overdueFollowUps || 0,
      };
    });

    // Follow-up summary
    const followUpSummary = await FollowUp.aggregate([
      { $match: followUpDateFilter },
      {
        $group: {
          _id: {
            $toLower: { $ifNull: ["$status", "pending"] },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const followUpStatusMap = {
      pending: 0,
      completed: 0,
      cancelled: 0,
    };

    followUpSummary.forEach((item) => {
      if (followUpStatusMap[item._id] !== undefined) {
        followUpStatusMap[item._id] = item.count;
      }
    });

    // Dashboard response
    return res.status(200).json({
      success: true,
      data: {
        totalLeads,
        activeLeads,
        wonLeads: wonCount,
        lostLeads: lostCount,
        conversionRate,
        totalRevenue,
        leadsByStatus,
        leadSources,

        followUps: {
          total: Object.values(followUpStatusMap).reduce(
            (total, count) => total + count,
            0,
          ),
          pending: followUpStatusMap.pending,
          completed: followUpStatusMap.completed,
          cancelled: followUpStatusMap.cancelled,
        },

        employeeActivitySummary,
      },
    });
  } catch (error) {
    console.error("Dashboard Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
      error: error.message,
    });
  }
};
