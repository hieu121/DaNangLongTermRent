const paymentRepository = require("../repositories/paymentRepository");
const cartRepository = require("../repositories/cartRepository");
const listingRepository = require("../repositories/listingRepository");
const { CONTACT_UNLOCK_PRICE } = require("../constants/payment");

const validateListingsForPayment = async (tenantId, listingIds) => {
  if (!listingIds.length) {
    throw new Error("Chọn ít nhất một phòng để thanh toán");
  }

  const uniqueIds = [...new Set(listingIds.map(Number))];
  const validIds = [];

  for (const listingId of uniqueIds) {
    const listing = await listingRepository.findListingById(listingId);
    if (!listing) {
      throw new Error(`Không tìm thấy phòng #${listingId}`);
    }
    if (listing.status !== "active") {
      throw new Error(`Phòng "${listing.title}" không khả dụng`);
    }
    if (listing.owner_id === tenantId) {
      throw new Error("Không thể thanh toán phòng của chính bạn");
    }
    if (await paymentRepository.hasListingAccess(tenantId, listingId)) {
      throw new Error(`Bạn đã thanh toán phòng "${listing.title}"`);
    }
    validIds.push(listingId);
  }

  return validIds;
};

const processMomoCheckout = async ({ tenantId, listingIds }) => {
  const validIds = await validateListingsForPayment(tenantId, listingIds);
  const amount = validIds.length * CONTACT_UNLOCK_PRICE;

  const paymentId = await paymentRepository.createPayment({
    tenantId,
    amount,
    listingIds: validIds,
    status: "success",
    method: "momo"
  });

  await cartRepository.removeItems(tenantId, validIds);

  return {
    paymentId,
    amount,
    status: "success",
    method: "momo",
    listingIds: validIds,
    unlockPrice: CONTACT_UNLOCK_PRICE
  };
};

const createMockMomoPayment = async ({ tenantId, listingId }) =>
  processMomoCheckout({ tenantId, listingIds: [listingId] });

const getMyPayments = async (tenantId) => paymentRepository.findMyPayments(tenantId);

const getPurchasedListings = async (tenantId) => paymentRepository.findPurchasedListings(tenantId);

const getRevenueStats = async () => paymentRepository.getRevenueStats();

const getMonthlyRevenue = async () => paymentRepository.getMonthlyRevenue();

const getAdminTransactions = async (filters) => paymentRepository.findTransactionsForAdmin(filters);

module.exports = {
  processMomoCheckout,
  createMockMomoPayment,
  getMyPayments,
  getPurchasedListings,
  getRevenueStats,
  getMonthlyRevenue,
  getAdminTransactions,
  CONTACT_UNLOCK_PRICE
};
