const ownerRequestService = require("../services/ownerRequestService");
const { success } = require("../utils/response");

const requestOwner = async (req, res, next) => {
  try {
    const requestId = await ownerRequestService.createRequest(req.user.id);
    return success(res, { requestId }, "Owner request submitted", 201);
  } catch (error) {
    return next(error);
  }
};

const getMyRequests = async (req, res, next) => {
  try {
    const data = await ownerRequestService.getMyRequests(req.user.id);
    return success(res, data);
  } catch (error) {
    return next(error);
  }
};

module.exports = { requestOwner, getMyRequests };
