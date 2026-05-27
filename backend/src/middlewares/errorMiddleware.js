// eslint-disable-next-line no-unused-vars
module.exports = (error, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(error);
  return res.status(500).json({
    success: false,
    message: error.message || "Internal Server Error"
  });
};
