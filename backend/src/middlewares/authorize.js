const { fail } = require("../utils/response");

const ROLE_HIERARCHY = {
  admin: ["admin", "owner", "tenant"],
  owner: ["owner", "tenant"],
  tenant: ["tenant"]
};

const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return fail(res, "Forbidden", 403);
  }
  const userEffectiveRoles = ROLE_HIERARCHY[req.user.role] || [req.user.role];
  const hasAccess = allowedRoles.some((role) => userEffectiveRoles.includes(role));
  if (!hasAccess) {
    return fail(res, "Forbidden", 403);
  }
  return next();
};

module.exports = authorize;
