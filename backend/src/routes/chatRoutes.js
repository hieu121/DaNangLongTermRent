const express = require("express");
const controller = require("../controllers/chatController");
const verifyToken = require("../middlewares/verifyToken");
const policy = require("../middlewares/policyMiddleware");

const router = express.Router();

router.use(verifyToken, policy);
router.post("/open-admin", controller.openConversation);
router.get("/conversations", controller.getConversations);
router.get("/conversations/:conversationId/messages", controller.getMessages);

module.exports = router;
