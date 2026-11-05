const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
// const User = require("../models/User");
const AuthUser = require("../models/AuthUser");

const router = express.Router();
const createToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in .env");
  }

  if (!user._id || !user.role) {
    throw new Error("User ID or role is missing.");
  }

  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
    },
    process.env.JWT_SECRET,
    // { expiresIn: "8h" },
  );
};
const formatUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
});

// REGISTER

router.post("/register", async (req, res) => {
  try {
    console.log("Register request body:", req.body);

    const { name, email, password } = req.body || {};

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
        received: {
          name: Boolean(name?.trim?.()),
          email: Boolean(email?.trim?.()),
          password: Boolean(password),
        },
      });
    }

    // Keep the rest of your existing registration logic here.

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await AuthUser.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered.",
      });
    }

    // hash password before saving
    const hashedPassword = await bcrypt.hash(password, 12);
    // Public registration must not allow users to assign themselves
    // an administrator role.
    const user = await AuthUser.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "employee",
      isActive: true,
    });

    const token = createToken(user);

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already registered.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Registration failed.",
    });
  }
});

// LOGIN

// LOGIN
router.post("/login", async (req, res) => {
  try {
    console.log("[LOGIN] Request received");

    const email =
      typeof req.body?.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    const password =
      typeof req.body?.password === "string" ? req.body.password : "";

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }
    console.log("[LOGIN] Database:", AuthUser.db.name);
    console.log("[LOGIN] Collection:", AuthUser.collection.name);
    console.log("[LOGIN] Email:", email);

    const user = await AuthUser.findOne({ email }).select("+password");

    console.log("[LOGIN] User found:", Boolean(user));
    console.log("[LOGIN] Role:", user?.role);
    console.log("[LOGIN] Active:", user?.isActive);
    console.log("[LOGIN] Password hash exists:", Boolean(user?.password));

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Check whether the account is disabled
    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive. Contact your administrator.",
      });
    }

    // Verify password against the bcrypt hash stored in MongoDB
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: "Password data is missing for this account.",
      });
    }

    console.log("[LOGIN] Verifying password");

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Give legacy accounts without a role the least-privileged role.
    const allowedRoles = ["administrator", "manager", "employee"];

    if (!allowedRoles.includes(user.role)) {
      user.role = "employee";
      await user.save();
    }

    // Generate JWT
    const token = createToken(user);

    // Send token and user to React
    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error("[LOGIN] Error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed due to a server error.",
    });
  }
});

module.exports = router;
