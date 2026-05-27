const express = require("express");
const controller = require("../controllers/chatController");
const auth = require("../middlewares/authMiddleware");
const policy = require("../middlewares/policyMiddleware");

const router = express.Router();

router.use(auth, policy);
router.post("/open-admin", controller.openConversation);
router.get("/conversations", controller.getConversations);
router.get("/conversations/:conversationId/messages", controller.getMessages);

module.exports = router;
