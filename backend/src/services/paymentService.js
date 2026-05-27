const QRCode = require("qrcode");
const paymentRepository = require("../repositories/paymentRepository");

const createMockMomoPayment = async ({ tenantId, listingId, amount }) => {
  const paymentId = await paymentRepository.createPayment({
    tenantId,
    amount,
    listingId,
    status: "success"
  });

  const qrPayload = `momo://pay?paymentId=${paymentId}&listingId=${listingId}&amount=${amount}`;
  const qrDataUrl = await QRCode.toDataURL(qrPayload);

  return { paymentId, qrDataUrl, status: "success" };
};

module.exports = { createMockMomoPayment };
