const { fail } = require("../utils/response");
const { verifyToken } = require("../utils/jwt");

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    return fail(res, "Unauthorized", 401);
  }

  try {
    req.user = verifyToken(token);
    return next();
  } catch (error) {
    return fail(res, "Invalid token", 401);
  }
};

module.exports = authMiddleware;
