const chatRepository = require("../repositories/chatRepository");

const openConversationWithAdmin = async (userId) =>
  chatRepository.getOrCreateConversationWithAdmin(userId);

const sendMessage = async ({ conversationId, senderId, content }) =>
  chatRepository.createMessage({ conversationId, senderId, content });

const getMessages = async ({ conversationId, limit, offset }) =>
  chatRepository.getConversationMessages(conversationId, limit, offset);

const getConversations = async (userId) => chatRepository.getConversationList(userId);
const getParticipantIds = async (conversationId) => chatRepository.getParticipantIds(conversationId);

module.exports = { openConversationWithAdmin, sendMessage, getMessages, getConversations, getParticipantIds };
