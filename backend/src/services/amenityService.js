const amenityRepository = require("../repositories/amenityRepository");

const getAllAmenities = async () => amenityRepository.findAll();

const createAmenity = async (name) => {
  const normalized = name.trim();
  if (!normalized) {
    throw new Error("Amenity name is required");
  }

  const existing = await amenityRepository.findByName(normalized);
  if (existing) {
    throw new Error("Amenity already exists");
  }

  const id = await amenityRepository.create(normalized);
  return { id, name: normalized };
};

const deleteAmenity = async (id) => {
  const amenity = await amenityRepository.findById(id);
  if (!amenity) {
    throw new Error("Amenity not found");
  }
  await amenityRepository.remove(id);
};

module.exports = {
  getAllAmenities,
  createAmenity,
  deleteAmenity
};
