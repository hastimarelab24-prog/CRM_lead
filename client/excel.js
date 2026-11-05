// 1. Fetch ALL users without strict filters so no employee gets missed
    const employees = await User.find({})
      .select("_id name username email role isActive")
      .lean();

    const employeeIds = employees.map((employee) => employee._id);

    // 2. Employee lead counts (Safely matching assignedEmployee)
    const employeeLeadCounts = employeeIds.length
      ? await Lead.aggregate([
          {
            $match: {
              ...dateFilter,
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

    // 3. Employee follow-up counts (Safely matching assignedTo)
    const employeeFollowUpCounts = employeeIds.length
      ? await FollowUp.aggregate([
          {
            $match: {
              ...followUpDateFilter,
            },
          },
          {
            $group: {
              _id: "$assignedTo",
              totalFollowUps: { $sum: 1 },
              completedFollowUps: {
                $sum: {
                  $cond: [{ $eq: [{ $toLower: "$status" }, "completed"] }, 1, 0],
                },
              },
              pendingFollowUps: {
                $sum: {
                  $cond: [{ $eq: [{ $toLower: "$status" }, "pending"] }, 1, 0],
                },
              },
              overdueFollowUps: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $eq: [{ $toLower: "$status" }, "pending"] },
                        { $lt: ["$dueDate", today] },
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

    // 4. Mapping Maps
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

    // 5. Final Employee Summary (Ensuring Neha Desai & others appear)
    const employeeActivitySummary = employees.map((employee) => {
      const id = employee._id.toString();

      const leadData = leadCountMap[id] || {};
      const followUpData = followUpCountMap[id] || {};

      return {
        employeeId: employee._id,
        name: employee.name || employee.username || "Unknown",
        email: employee.email || "-",
        role: employee.role || "Employee",
        totalLeads: leadData.totalLeads || 0,
        wonLeads: leadData.wonLeads || 0,
        totalFollowUps: followUpData.totalFollowUps || 0,
        completedFollowUps: followUpData.completedFollowUps || 0,
        pendingFollowUps: followUpData.pendingFollowUps || 0,
        overdueFollowUps: followUpData.overdueFollowUps || 0,
      };
    });