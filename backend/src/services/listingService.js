const listingRepository = require("../repositories/listingRepository");
const paymentRepository = require("../repositories/paymentRepository");

const createListing = async (ownerId, payload) => {
  const listingId = await listingRepository.createListing({ ownerId, ...payload });
  await listingRepository.setListingAssets(listingId, payload.images, payload.amenities);
  return listingId;
};

const getListings = async (query) => listingRepository.findActiveListings(query);

const getListingDetail = async (listingId, viewer) => {
  const listing = await listingRepository.findListingById(listingId);
  if (!listing) {
    throw new Error("Listing not found");
  }

  const [images, amenities] = await Promise.all([
    listingRepository.findListingImages(listingId),
    listingRepository.findListingAmenities(listingId)
  ]);

  const canViewContact =
    viewer?.role === "admin" ||
    viewer?.id === listing.owner_id ||
    (viewer?.role === "tenant" && (await paymentRepository.hasListingAccess(viewer.id, listingId)));

  return {
    ...listing,
    images,
    amenities,
    owner_contact: canViewContact
      ? {
          phone: listing.owner_phone,
          email: listing.owner_email,
          address: listing.address
        }
      : null
  };
};

module.exports = { createListing, getListings, getListingDetail };
