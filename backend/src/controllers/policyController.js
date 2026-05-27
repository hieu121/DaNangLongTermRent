const policyService = require("../services/policyService");
const { success } = require("../utils/response");

const policyState = async (req, res, next) => {
  try {
    const data = await policyService.getPolicyState(req.user.id, req.user.role);
    return success(res, data);
  } catch (error) {
    return next(error);
  }
};

const acceptPolicy = async (req, res, next) => {
  try {
    const data = await policyService.acceptPolicy(req.user.id, req.user.role);
    return success(res, data, "Policy accepted");
  } catch (error) {
    return next(error);
  }
};

module.exports = { policyState, acceptPolicy };
