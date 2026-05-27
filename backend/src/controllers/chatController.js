const chatService = require("../services/chatService");
const { success } = require("../utils/response");

const openConversation = async (req, res, next) => {
  try {
    const conversationId = await chatService.openConversationWithAdmin(req.user.id);
    return success(res, { conversationId });
  } catch (error) {
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
      limit: Number(req.query.limit || 20),
      offset: Number(req.query.offset || 0)
    });
    return success(res, data);
  } catch (error) {
    return next(error);
  }
};

module.exports = { openConversation, getConversations, getMessages };
