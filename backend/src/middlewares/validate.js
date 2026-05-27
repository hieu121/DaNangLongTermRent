const { fail } = require("../utils/response");

const validate = (schema, key = "body") => (req, res, next) => {
  const { error, value } = schema.validate(req[key], { abortEarly: false });
  if (error) {
    return fail(res, error.details.map((d) => d.message).join(", "), 422);
  }
  req[key] = value;
  return next();
};

module.exports = validate;
