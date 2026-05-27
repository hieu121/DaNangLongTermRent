const notificationRepository = require("../repositories/notificationRepository");

const getNotifications = async (userId) => notificationRepository.getNotifications(userId);

const markAsRead = async (notificationId, userId) =>
  notificationRepository.markAsRead(notificationId, userId);

const pushNotification = async (io, userId, payload) => {
  await notificationRepository.createNotification({
    userId,
    type: payload.type,
    content: payload.content
  });
  io.to(`user:${userId}`).emit("notification:new", payload);
};

module.exports = { getNotifications, markAsRead, pushNotification };
