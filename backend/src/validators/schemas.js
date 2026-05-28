const Joi = require("joi");

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  fullName: Joi.string().min(2).required(),
  phone: Joi.string().allow("", null)
});

const verifyEmailSchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().length(6).required()
});

const resendOtpSchema = Joi.object({
  email: Joi.string().email().required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const googleLoginSchema = Joi.object({
  idToken: Joi.string().required()
});

const createListingSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().min(0).required(),
  area: Joi.string().required(),
  address: Joi.string().required(),
  minStay: Joi.number().integer().min(1).required(),
  availableDate: Joi.date().required(),
  images: Joi.array().items(Joi.string().uri()).default([]),
  amenities: Joi.array().items(Joi.string()).default([])
});

const paymentSchema = Joi.object({
  listingId: Joi.number().integer().required(),
  amount: Joi.number().positive().required()
});

const reviewSchema = Joi.object({
  listingId: Joi.number().integer().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().allow("").default("")
});

const updateReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().allow("").default("")
});

const replyReviewSchema = Joi.object({
  ownerReply: Joi.string().required()
});

const adminReviewListingSchema = Joi.object({
  listingId: Joi.number().integer().required(),
  action: Joi.string().valid("approve", "reject").required(),
  note: Joi.string().allow("", null)
});

const warningSchema = Joi.object({
  ownerId: Joi.number().integer().required(),
  reason: Joi.string().required()
});

const createPolicySchema = Joi.object({
  role: Joi.string().valid("tenant", "owner").required(),
  title: Joi.string().required(),
  content: Joi.string().required(),
  version: Joi.number().integer().min(1).required()
});

const createBookingSchema = Joi.object({
  listingId: Joi.number().integer().required(),
  checkIn: Joi.date().required(),
  checkOut: Joi.date().required(),
  guests: Joi.number().integer().min(1).max(20).default(1)
});

const ownerRequestNoteSchema = Joi.object({
  note: Joi.string().allow("", null).default("")
});

const updateProfileSchema = Joi.object({
  fullName: Joi.string().min(2),
  phone: Joi.string().allow("", null),
  avatarUrl: Joi.string().uri().allow("", null)
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});

module.exports = {
  registerSchema,
  verifyEmailSchema,
  resendOtpSchema,
  loginSchema,
  googleLoginSchema,
  createListingSchema,
  paymentSchema,
  reviewSchema,
  adminReviewListingSchema,
  warningSchema,
  createPolicySchema,
  createBookingSchema,
  ownerRequestNoteSchema,
  updateProfileSchema,
  changePasswordSchema
};
