const express = require("express");
const controller = require("../controllers/notificationController");
const verifyToken = require("../middlewares/verifyToken");

const router = express.Router();
router.use(verifyToken);
router.get("/", controller.getNotifications);
router.patch("/:id/read", controller.readNotification);

module.exports = router;
