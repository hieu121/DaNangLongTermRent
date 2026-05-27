const notificationService = require("../services/notificationService");
const { success } = require("../utils/response");

const getNotifications = async (req, res, next) => {
  try {
    const data = await notificationService.getNotifications(req.user.id);
    return success(res, data);
  } catch (error) {
    return next(error);
  }
};

const readNotification = async (req, res, next) => {
  try {
    await notificationService.markAsRead(Number(req.params.id), req.user.id);
    return success(res, null, "Marked as read");
  } catch (error) {
    return next(error);
  }
};

module.exports = { getNotifications, readNotification };
