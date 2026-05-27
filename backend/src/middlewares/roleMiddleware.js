const { fail } = require("../utils/response");

const roleMiddleware = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return fail(res, "Forbidden", 403);
  }
  return next();
};

module.exports = roleMiddleware;
