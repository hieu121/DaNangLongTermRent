const { verifyToken } = require("../utils/jwt");
const userRepository = require("../repositories/userRepository");

const optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) return next();

  try {
    const decoded = verifyToken(token);
    const user = await userRepository.findById(decoded.id);
    if (user && user.is_active) {
      req.user = { id: user.id, role: user.role, email: user.email };
    }
  } catch {
    // ignore invalid token
  }
  return next();
};

module.exports = optionalAuth;
