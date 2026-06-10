const chatService = require("../services/chatService");
const { success, fail } = require("../utils/response");

const openConversation = async (req, res, next) => {
  try {
    const conversationId = await chatService.openConversationWithAdmin(req.user.id);
    return success(res, { conversationId });
  } catch (error) {
    return next(error);
  }
};

const openConversationWithUser = async (req, res, next) => {
  try {
    const targetUserId = Number(req.params.userId);
    if (!targetUserId || targetUserId === Number(req.user.id)) {
      return fail(res, "Invalid user id", 400);
    }
    const conversationId = await chatService.openConversationWithUser(targetUserId, req.user.id);
    return success(res, { conversationId });
  } catch (error) {
    if (error.message === "Target user not found" || error.message === "Cannot chat with admin") {
      return fail(res, error.message, 400);
    }
    return next(error);
  }
};

const getConversations = async (req, res, next) => {
  try {
    const data = await chatService.getConversations(req.user.id);
    return success(res, data);
  } catch (error) {
    return next(error);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const data = await chatService.getMessages({
      conversationId: Number(req.params.conversationId),
      userId: req.user.id,
      limit: Number(req.query.limit || 50),
      offset: Number(req.query.offset || 0)
    });
    return success(res, data);
  } catch (error) {
    if (error.message === "Forbidden") {
      return fail(res, "Forbidden", 403);
    }
    return next(error);
  }
};

module.exports = { openConversation, openConversationWithUser, getConversations, getMessages };
