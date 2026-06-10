const cartRepository = require("../repositories/cartRepository");
const listingRepository = require("../repositories/listingRepository");
const paymentRepository = require("../repositories/paymentRepository");

const getCart = async (tenantId) => {
  const items = await cartRepository.findByTenantId(tenantId);
  const purchasedIds = await paymentRepository.filterListingsWithAccess(
    tenantId,
    items.map((item) => item.listing_id)
  );
  const purchasedSet = new Set(purchasedIds);

  return items
    .filter((item) => !purchasedSet.has(item.listing_id))
    .map((item) => ({
      ...item,
      price: Number(item.price)
    }));
};

const addToCart = async (tenantId, listingId) => {
  const listing = await listingRepository.findListingById(listingId);
  if (!listing) {
    throw new Error("Không tìm thấy phòng");
  }
  if (listing.status !== "active") {
    throw new Error("Phòng không khả dụng để thêm vào giỏ hàng");
  }
  if (listing.owner_id === tenantId) {
    throw new Error("Không thể thêm phòng của chính bạn vào giỏ hàng");
  }
  if (await paymentRepository.hasListingAccess(tenantId, listingId)) {
    throw new Error("Bạn đã thanh toán phòng này rồi");
  }

  await cartRepository.addItem(tenantId, listingId);
  return getCart(tenantId);
};

const removeFromCart = async (tenantId, listingId) => {
  const removed = await cartRepository.removeItem(tenantId, listingId);
  if (!removed) {
    throw new Error("Phòng không có trong giỏ hàng");
  }
  return getCart(tenantId);
};

const getCartCount = async (tenantId) => cartRepository.countByTenantId(tenantId);

module.exports = { getCart, addToCart, removeFromCart, getCartCount };
