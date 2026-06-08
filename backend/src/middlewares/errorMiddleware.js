module.exports = (error, req, res, next) => {
  console.error(error);

  if (error.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Dữ liệu gửi lên quá lớn. Vui lòng giảm số lượng hoặc kích thước ảnh."
    });
  }

  if (error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError") {
    return res.status(422).json({
      success: false,
      message: error.errors?.[0]?.message || "Validation error"
    });
  }

  const status = error.status || 400;
  return res.status(status >= 100 && status < 600 ? status : 400).json({
    success: false,
    message: error.message || "Internal Server Error"
  });
};
