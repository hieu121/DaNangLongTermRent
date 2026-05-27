const success = (res, data, message = "OK", status = 200) =>
  res.status(status).json({ success: true, message, data });

const fail = (res, message = "Bad request", status = 400) =>
  res.status(status).json({ success: false, message });

module.exports = { success, fail };
