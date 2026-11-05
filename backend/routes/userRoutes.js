const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/TeamUser");
const lead =require("../models/lead")
const authMiddleware = require("../middleware/authMiddleware");
const allowRole = require("../middleware/roleMiddleware");
const logAction = require("../utils/auditLogger");
const Lead = require("../models/lead");

const router = express.Router();

const validRoles = ["administrator", "manager", "employee"];

// Apply authentication to all routes.
router.use(authMiddleware);

// Employee dropdown for authorized lead-creation roles.
router.get(
  "/employees",
  allowRole("administrator", "manager", "employee"),
  async (req, res) => {
    try {
      const employees = await User.find({})
        .select("name email role")
        .sort({ name: 1 })
        .lean();

      return res.status(200).json({
        success: true,
        employees,
        users:employees,
      });
    } catch (error) {
      console.error("Employee list error:", error);
      return res.status(500).json({
        success: false,
        message: "Unable to load employees.",
      });
    }
  }
);

// GET ALL USERS — administrator, manager, and employee
router.get("/", allowRole("administrator", "manager", "employee"), async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

// count leads assigned to each team member
const leadCount = await Lead.aggregate([{$match:{assignedEmployee:{$ne:null},},},
  {$group:{_id:"$assignedEmployee", count:{$sum:1},}}
])
const countMap = new Map(leadCount.map((item)=>[String(item._id),item.count,]))
// add assignedlead count to each 
const usersWithLeadCounts=users.map((user)=>({
  ...user, assignedLeadsCount:countMap.get(String(user._id)) ||0
}))

    return res.status(200).json({
      success: true,
      users:usersWithLeadCounts,
      employees:usersWithLeadCounts
    });
  } catch (error) {
    console.error("Load users error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load users",
    });
  }
});

// CREATE USER — administrator only
router.post("/", async (req, res) => {  try {
    const { name, email, password, role } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        message: "Name, email and password are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters.",
      });
    }

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already exists.",
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role,
      isActive:true,
    });

    try {
      await logAction(
        req.user.id,
        "USER_CREATED",
        "User",
        user._id.toString(),
        { role: user.role }
      );
    } catch (auditError) {
      console.error("Audit logger error:", auditError);
    }

    return res.status(201).json({
      message: "User created successfully.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Create user error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already exists.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to create user.",
    });
  }
});

// UPDATE USER ROLE — administrator only
router.patch("/:id/role", allowRole("administrator"), async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid user ID.",
      });
    }

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role.",
      });
    }

    if (req.user.id === id) {
      return res.status(400).json({
        message: "You cannot change your own role.",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const previousRole = user.role;

    user.role = role;
    await user.save();

    try {
      await logAction(
        req.user.id,
        "USER_ROLE_UPDATED",
        "User",
        user._id.toString(),
        {
          previousRole,
          newRole: role,
        }
      );
    } catch (auditError) {
      console.error("Audit logger error:", auditError);
    }

    return res.status(200).json({
      message: "User role updated successfully.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Update role error:", error);

    return res.status(500).json({
      message: "Failed to update user role.",
    });
  }
});




// delete
router.delete("/:id",allowRole("administrator"),async(req,res)=>{
  try{
    const {id}=req.params;
    if(!mongoose.isValidObjectId(id)){
      return res.status(400).json({message: "invalid user id.",});
    }
    if(req.user.id=== id){
      return res.status(400).json({message:"you cannot delete your own account",});
    }
    const user = await User.findById(id);
    if(!user){
      return res.status(404).json({message:"user not found",})
    }
    await User.findByIdAndDelete(id);
    try{
      await logAction(req.user.id,"USER_DELETED","User",id,{
        name:user.name,email:user.email,role:user.role,
      })
    }catch(auditError){
      console.error("audit logger error",auditError);
    }
    return res.status(200).json({success:true,message:"team member deleted successfully"})
  }catch(err){
console.error("delete user error",err);
return res.status(500).json({message:"failed to delete team member."})
  }
})
module.exports = router;