const chatRepository = require("../repositories/chatRepository");

const openConversationWithAdmin = async (userId) =>
  chatRepository.getOrCreateConversationWithAdmin(userId);

const userRepository = require("../repositories/userRepository");

const openConversationWithUser = async (targetUserId, adminId) => {
  const target = await userRepository.findById(targetUserId);
  if (!target) {
    throw new Error("Target user not found");
  }
  if (target.role === "admin") {
    throw new Error("Cannot chat with admin");
  }
  return chatRepository.getOrCreateConversationWithAdmin(targetUserId, adminId);
};

const assertParticipant = async (conversationId, userId) => {
  const allowed = await chatRepository.isUserParticipant(conversationId, userId);
  if (!allowed) {
    throw new Error("Forbidden");
  }
};

const sendMessage = async ({ conversationId, senderId, content }) => {
  await assertParticipant(conversationId, senderId);
  return chatRepository.createMessage({ conversationId, senderId, content });
};

const getMessages = async ({ conversationId, userId, limit, offset }) => {
  await assertParticipant(conversationId, userId);
  return chatRepository.getConversationMessages(conversationId, limit, offset);
};

const getConversations = async (userId) => chatRepository.getConversationList(userId);
const getParticipantIds = async (conversationId) => chatRepository.getParticipantIds(conversationId);

module.exports = {
  openConversationWithAdmin,
  openConversationWithUser,
  sendMessage,
  getMessages,
  getConversations,
  getParticipantIds,
  assertParticipant
};
