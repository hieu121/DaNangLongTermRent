const listingRepository = require("../repositories/listingRepository");
const listingUpdateRepository = require("../repositories/listingUpdateRepository");
const paymentRepository = require("../repositories/paymentRepository");
const { CONTACT_UNLOCK_PRICE } = require("../constants/payment");
const { persistImageUrls } = require("../utils/imageStorage");

const pool = require("../config/db");

const createListing = async (ownerId, payload) => {
  const imageUrls = persistImageUrls(payload.images || []);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const [result] = await connection.query(
      `INSERT INTO listings
        (owner_id, title, description, price, area, address, min_stay, available_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        ownerId,
        payload.title,
        payload.description,
        payload.price,
        payload.area,
        payload.address,
        payload.minStay,
        payload.availableDate
      ]
    );
    const listingId = result.insertId;

    if (imageUrls.length) {
      await connection.query(
        "INSERT INTO listing_images(listing_id, image_url) VALUES ?",
        [imageUrls.map((url) => [listingId, url])]
      );
    }

    if (payload.amenities?.length) {
      await connection.query(
        "INSERT INTO listing_amenities(listing_id, amenity) VALUES ?",
        [payload.amenities.map((a) => [listingId, a])]
      );
    }

    await connection.commit();
    return listingId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getListings = async (query) => {
  const listings = await listingRepository.findActiveListings(query);
  return listingRepository.enrichListingsWithAssets(listings);
};

const getMyListings = async (ownerId) => {
  const listings = await listingRepository.findByOwnerId(ownerId);
  return listingRepository.enrichListingsWithAssets(listings);
};

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
    Number(viewer?.id) === Number(listing.owner_id) ||
    (viewer?.role === "tenant" && (await paymentRepository.hasListingAccess(viewer.id, listingId)));

  const response = {
    id: listing.id,
    owner_id: listing.owner_id,
    title: listing.title,
    description: listing.description,
    price: listing.price,
    area: listing.area,
    min_stay: listing.min_stay,
    available_date: listing.available_date,
    status: listing.status,
    priority_score: listing.priority_score,
    created_at: listing.created_at,
    listing_images: images,
    listing_amenities: amenities,
    has_contact_access: canViewContact,
    contact_unlock_price: CONTACT_UNLOCK_PRICE,
    owner_contact: canViewContact
      ? {
          name: listing.owner_name,
          phone: listing.owner_phone,
          email: listing.owner_email,
          address: listing.address
        }
      : null
  };

  if (canViewContact) {
    response.address = listing.address;
    response.owner_name = listing.owner_name;
  }

  return response;
};

const updateListing = async (ownerId, listingId, payload) => {
  const listing = await listingRepository.findListingById(listingId);
  if (!listing) {
    throw new Error("Listing not found");
  }
  if (listing.owner_id !== ownerId) {
    throw new Error("Unauthorized");
  }

  if (listing.status === "active") {
    const existing = await listingUpdateRepository.findPendingByListingId(listingId);
    if (existing) {
      throw new Error("Đã có yêu cầu cập nhật đang chờ admin duyệt");
    }
    const requestId = await listingUpdateRepository.createUpdateRequest({
      listingId,
      ownerId,
      proposedData: payload
    });
    return { pendingApproval: true, requestId };
  }

  const updated = await listingRepository.updateListing(listingId, ownerId, payload);
  if (!updated) {
    throw new Error("Listing not found or not owned by you");
  }
  return { pendingApproval: false };
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
