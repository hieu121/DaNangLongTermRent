const { fail } = require("../utils/response");

const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return fail(res, "Forbidden", 403);
  }
  return next();
};

module.exports = authorize;
