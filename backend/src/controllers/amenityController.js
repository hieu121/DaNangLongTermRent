const amenityService = require("../services/amenityService");
const { success } = require("../utils/response");

const getAmenities = async (req, res, next) => {
  try {
    const data = await amenityService.getAllAmenities();
    return success(res, data);
  } catch (error) {
    return next(error);
  }
};

const createAmenity = async (req, res, next) => {
  try {
    const data = await amenityService.createAmenity(req.body.name);
    return success(res, data, "Amenity created", 201);
  } catch (error) {
    return next(error);
  }
};

const deleteAmenity = async (req, res, next) => {
  try {
    await amenityService.deleteAmenity(Number(req.params.id));
    return success(res, null, "Amenity deleted");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAmenities,
  createAmenity,
  deleteAmenity
};
