const { fail } = require("../utils/response");
const { verifyToken } = require("../utils/jwt");
const userRepository = require("../repositories/userRepository");

const authMiddleware = async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    return fail(res, "Unauthorized", 401);
  }

  try {
    const decoded = verifyToken(token);
    const user = await userRepository.findById(decoded.id);
    if (!user) {
      return fail(res, "User not found", 401);
    }
    if (!user.is_active) {
      return fail(res, "Account has been locked", 403);
    }
    req.user = { id: user.id, role: user.role, email: user.email };
    return next();
  } catch (error) {
    return fail(res, "Invalid token", 401);
  }
};

module.exports = authMiddleware;
