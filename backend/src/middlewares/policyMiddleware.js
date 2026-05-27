const policyService = require("../services/policyService");
const { fail } = require("../utils/response");

const policyMiddleware = async (req, res, next) => {
  if (!req.user || req.user.role === "admin") {
    return next();
  }

  const state = await policyService.getPolicyState(req.user.id, req.user.role);
  if (state.mustAccept) {
    return fail(res, "Policy acceptance required", 428);
  }
  return next();
};

module.exports = policyMiddleware;
