const express = require("express");
const router = express.Router();

const followUpController = require(
  "../controllers/followUpController"
);

const authMiddleware = require(
  "../middleware/authMiddleware"
);

router.use(authMiddleware);

router.get(
  "/assignees",
  followUpController.getAssignees
);

router.get(
  "/",
  followUpController.getFollowUps
);

router.post(
  "/",
  followUpController.createFollowUp
);

router.patch(
  "/:id/complete",
  followUpController.completeFollowUp
);

router.patch(
  "/:id",
  followUpController.updateFollowUp
);

router.delete(
  "/:id",
  followUpController.deleteFollowUp
);

module.exports = router;