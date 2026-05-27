const express = require("express");
const controller = require("../controllers/notificationController");
const auth = require("../middlewares/authMiddleware");

const router = express.Router();
router.use(auth);
router.get("/", controller.getNotifications);
router.patch("/:id/read", controller.readNotification);

module.exports = router;
