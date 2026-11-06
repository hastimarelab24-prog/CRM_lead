// const express = require("express");
// const mongoose = require("mongoose");

// const router = express.Router();

// const Lead = require("../models/lead");
// const FollowUp = require("../models/FollowUp");

// const authMiddleware = require("../middleware/authMiddleware");
// const allowRoles = require("../middleware/roleMiddleware");

// const leadController = require("../controllers/leadController");
// const logActive = require("../utils/auditLogger");

// // Authentication for all routes
// router.use(authMiddleware);

// // GET all leads and CREATE lead
// router
//   .route("/")
//   .get(leadController.getLeads)
//   .post(leadController.createLead);

// // GET all follow-ups
// router.get("/follow-ups/all", leadController.getFollowUps);

// // UPDATE follow-up status
// router.put(
//   "/follow-ups/:id",
//   leadController.updateFollowUpStatus
// );

// // DELETE an individual follow-up
// router.delete("/follow-ups/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.isValidObjectId(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid follow-up ID.",
//       });
//     }

//     const followUp = await FollowUp.findByIdAndDelete(id);

//     if (!followUp) {
//       return res.status(404).json({
//         success: false,
//         message: "Follow-up not found.",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Follow-up deleted successfully.",
//     });
//   } catch (error) {
//     console.error("Delete follow-up error:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message || "Failed to delete follow-up.",
//     });
//   }
// });

// // ASSIGN LEAD TO EMPLOYEE
// router.patch(
//   "/:id/assign",
//   allowRoles("administrator", "manager"),
//   async (req, res) => {
//     try {
//       const { id } = req.params;
//       const { employeeId } = req.body;

//       if (
//         !mongoose.isValidObjectId(id) ||
//         !mongoose.isValidObjectId(employeeId)
//       ) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid lead ID or employee ID.",
//         });
//       }

//       const TeamUser = require("../models/TeamUser");

//       const employee = await TeamUser.findById(employeeId);

//       if (!employee) {
//         return res.status(404).json({
//           success: false,
//           message: "Employee not found.",
//         });
//       }

//       const lead = await Lead.findById(id);

//       if (!lead) {
//         return res.status(404).json({
//           success: false,
//           message: "Lead not found.",
//         });
//       }

//       const previousEmployee =
//         lead.assignedEmployee?.toString() || null;

//       lead.assignedEmployee = employee._id;

//       await lead.save();

//       try {
//         if (typeof logActive === "function") {
//           await logActive(
//             req.user.id || req.user._id,
//             "LEAD_ASSIGNED",
//             "Lead",
//             lead._id.toString(),
//             {
//               previousEmployee,
//               newEmployee: employee._id.toString(),
//             }
//           );
//         }
//       } catch (auditError) {
//         console.error("Audit log error:", auditError);
//       }

//       return res.status(200).json({
//         success: true,
//         message: "Lead assigned successfully.",
//         lead,
//       });
//     } catch (error) {
//       console.error("Assign lead error:", error);

//       return res.status(500).json({
//         success: false,
//         message: error.message || "Failed to assign lead.",
//       });
//     }
//   }
// );

// // UPDATE LEAD STATUS
// router.patch("/:id/status", leadController.transitionStatus);

// // UPDATE LEAD
// router.put("/:id", leadController.updateLead);

// // DELETE LEAD
// router.delete("/:id", leadController.deleteLead);

// module.exports = router;



const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Lead = require("../models/lead");
const FollowUp = require("../models/FollowUp");

// મિડલવેરને સુરક્ષિત રીતે ઇમ્પોર્ટ કરો (જો ફંક્શન ન હોય તો ક્રેશ ન થાય)
const authMiddleware = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const leadController = require("../controllers/leadController");
const logActive = require("../utils/auditLogger");

// ખાતરી કરો કે authMiddleware એ વેલિડ ફંક્શન છે
const checkAuth = typeof authMiddleware === "function" ? authMiddleware : (authMiddleware.protect || authMiddleware.auth);

if (typeof checkAuth !== "function") {
  console.error("Warning: authMiddleware is not a valid function or router middleware!");
}

// Authentication middleware for all routes in this router
if (checkAuth) {
  router.use(checkAuth);
}

// GET all leads and CREATE lead
router.route("/")
  .get(leadController.getLeads)
  .post(leadController.createLead);

// GET all follow-ups
router.get("/follow-ups/all", leadController.getFollowUps);

// UPDATE follow-up status
router.put("/follow-ups/:id", leadController.updateFollowUpStatus);

// DELETE an individual follow-up
router.delete("/follow-ups/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid follow-up ID.",
      });
    }

    const followUp = await FollowUp.findByIdAndDelete(id);

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: "Follow-up not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Follow-up deleted successfully.",
    });
  } catch (error) {
    console.error("Delete follow-up error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete follow-up.",
    });
  }
});

// ASSIGN LEAD TO EMPLOYEE
router.patch(
  "/:id/assign",
  allowRoles ? allowRoles("administrator", "manager") : (req, res, next) => next(),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { employeeId } = req.body;

      if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(employeeId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid lead ID or employee ID.",
        });
      }

      const TeamUser = require("../models/TeamUser");
      const employee = await TeamUser.findById(employeeId);

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found.",
        });
      }

      const lead = await Lead.findById(id);

      if (!lead) {
        return res.status(404).json({
          success: false,
          message: "Lead not found.",
        });
      }

      const previousEmployee = lead.assignedEmployee?.toString() || null;
      lead.assignedEmployee = employee._id;
      await lead.save();

      try {
        if (typeof logActive === "function" && req.user) {
          await logActive(
            req.user.id || req.user._id,
            "LEAD_ASSIGNED",
            "Lead",
            lead._id.toString(),
            {
              previousEmployee,
              newEmployee: employee._id.toString(),
            }
          );
        }
      } catch (auditError) {
        console.error("Audit log error:", auditError);
      }

      return res.status(200).json({
        success: true,
        message: "Lead assigned successfully.",
        lead,
      });
    } catch (error) {
      console.error("Assign lead error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to assign lead.",
      });
    }
  }
);

// UPDATE LEAD STATUS
router.patch("/:id/status", leadController.transitionStatus);

// UPDATE LEAD
router.put("/:id", leadController.updateLead);

// DELETE LEAD
router.delete("/:id", leadController.deleteLead);
// make sure this post endpoint
router.post('/send-email',leadController.sendEmailToLead)

module.exports = router;