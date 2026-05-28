const listingRepository = require("../repositories/listingRepository");
const paymentRepository = require("../repositories/paymentRepository");

const createListing = async (ownerId, payload) => {
  const listingId = await listingRepository.createListing({ ownerId, ...payload });
  await listingRepository.setListingAssets(listingId, payload.images, payload.amenities);
  return listingId;
};

const getListings = async (query) => listingRepository.findActiveListings(query);

const getMyListings = async (ownerId) => listingRepository.findByOwnerId(ownerId);

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
    listing_images: images,
    listing_amenities: amenities,
    owner_contact: canViewContact
      ? {
          phone: listing.owner_phone,
          email: listing.owner_email,
          address: listing.address
        }
      : null
  };
};

const updateListing = async (ownerId, listingId, payload) => {
  const listing = await listingRepository.findListingById(listingId);
  if (!listing) {
    throw new Error("Listing not found");
  }
  if (listing.owner_id !== ownerId) {
    throw new Error("Unauthorized");
  }
  const updated = await listingRepository.updateListing(listingId, ownerId, payload);
  if (!updated) {
    throw new Error("Listing not found or not owned by you");
  }
};

const deleteListing = async (ownerId, listingId) => {
  const listing = await listingRepository.findListingById(listingId);
  if (!listing) {
    throw new Error("Listing not found");
  }
  if (listing.owner_id !== ownerId) {
    throw new Error("Unauthorized");
  }
  await listingRepository.deleteListing(listingId, ownerId);
};

module.exports = { createListing, getListings, getMyListings, getListingDetail, updateListing, deleteListing };
