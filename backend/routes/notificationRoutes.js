



const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const controller = require("../controllers/notificationController");

const router = express.Router();

router.use(authMiddleware);

router.get("/", controller.getNotifications);
router.patch("/read-all", controller.markAllAsRead);
router.patch("/:id/read", controller.markAsRead);

module.exports = router;
