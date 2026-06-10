import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { api } from "../api/client";

const UNLOCK_PRICE = 30000;

export default function ListingDetailPage() {
  const MAX_DISPLAY_IMAGES = 10;
  const { id } = useParams();
  const user = useAuthStore((s) => s.user);
  const [previewImage, setPreviewImage] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [replyDrafts, setReplyDrafts] = useState({});
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);

  const fetchListing = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/listings/${id}`);
      if (res.data.success) setData(res.data.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchListing();
  }, [id, fetchListing]);

  useEffect(() => {
    const fetchReviews = async () => {
      setReviewsLoading(true);
      try {
        const res = await api.get(`/reviews/listing/${id}`);
        if (res.data.success) setReviews(res.data.data || []);
      } catch {
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };
    if (id) fetchReviews();
  }, [id]);

  const roomImages = (data?.listing_images || []).slice(0, MAX_DISPLAY_IMAGES);
  const exceedImageLimit = (data?.listing_images || []).length > MAX_DISPLAY_IMAGES;
  const isOwner = Number(user?.id) === Number(data?.owner_id);
  const hasContactAccess = Boolean(data?.has_contact_access || isOwner || user?.role === "admin");
  const unlockPrice = Number(data?.contact_unlock_price || UNLOCK_PRICE);

  const myReviewIndex = reviews.findIndex((review) =>
    Number(review?.tenant_id) === Number(user?.id)
  );
  const myReview = myReviewIndex >= 0 ? reviews[myReviewIndex] : null;
  const averageRating = reviews.length
    ? (reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / reviews.length).toFixed(1)
    : "0.0";

  useEffect(() => {
    if (myReview) {
      setNewReview({ rating: Number(myReview.rating || 5), comment: myReview.comment || "" });
      setIsEditingReview(false);
      return;
    }
    setNewReview({ rating: 5, comment: "" });
    setIsEditingReview(true);
  }, [myReview]);

  useEffect(() => {
    const initialDrafts = {};
    reviews.forEach((review) => {
      initialDrafts[review.id] = review.owner_reply || "";
    });
    setReplyDrafts(initialDrafts);
  }, [reviews]);

  const handleSubmitReview = useCallback(async () => {
    if (!newReview.comment.trim()) return;
    try {
      if (myReview) {
        const res = await api.put(`/reviews/${myReview.id}`, {
          rating: newReview.rating,
          comment: newReview.comment.trim()
        });
        if (res.data.success) {
          setReviews((prev) => prev.map((r) =>
            r.id === myReview.id ? { ...r, rating: newReview.rating, comment: newReview.comment.trim() } : r
          ));
          setIsEditingReview(false);
        }
      } else {
        const res = await api.post("/reviews", {
          listingId: Number(id),
          rating: newReview.rating,
          comment: newReview.comment.trim()
        });
        if (res.data.success) {
          setReviews((prev) => [{
            id: Date.now(),
            tenant_id: user?.id,
            tenant_name: user?.full_name || "Người thuê",
            rating: newReview.rating,
            comment: newReview.comment.trim(),
            owner_reply: null
          }, ...prev]);
          setIsEditingReview(false);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi gửi đánh giá");
    }
  }, [newReview, myReview, id, user]);

  const handleDeleteReview = useCallback(async (reviewId) => {
    try {
      const res = await api.delete(`/reviews/${reviewId}`);
      if (res.data.success) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      }
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi xóa đánh giá");
    }
  }, []);

  const handleReply = useCallback(async (reviewId) => {
    const content = (replyDrafts[reviewId] || "").trim();
    if (!content) return;
    try {
      const res = await api.post(`/reviews/${reviewId}/reply`, { ownerReply: content });
      if (res.data.success) {
        setReviews((prev) =>
          prev.map((item) => (item.id === reviewId ? { ...item, owner_reply: content } : item))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi gửi phản hồi");
    }
  }, [replyDrafts]);

  const handleAddToCart = async () => {
    setCartLoading(true);
    try {
      await api.post("/cart", { listingId: Number(id) });
      alert("Đã thêm vào giỏ hàng");
    } catch (err) {
      alert(err.response?.data?.message || "Không thể thêm vào giỏ hàng");
    } finally {
      setCartLoading(false);
    }
  };

  const handlePayNow = async () => {
    setPayLoading(true);
    try {
      const res = await api.post("/payments/momo/checkout", { listingIds: [Number(id)] });
      if (res.data.success) {
        alert("Thanh toán MoMo thành công!");
        await fetchListing();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Thanh toán thất bại");
    } finally {
      setPayLoading(false);
    }
  };

  const contactInfo = useMemo(() => data?.owner_contact, [data]);

  if (loading) return <div className="p-6 text-center text-sm text-slate-500">Đang tải...</div>;
  if (!data) return <div className="p-6 text-center text-sm text-red-500">Không tìm thấy phòng.</div>;

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-xl font-bold">{data.title}</h1>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              data.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {data.status === "pending" ? "Phòng chờ duyệt" : "Phòng đang hoạt động"}
          </span>
        </div>
        <p className="mt-2 text-slate-600">{data.description}</p>
        <p className="mt-1 text-sm text-slate-600">
          <span className="font-medium text-slate-700">Phường/Khu vực:</span> {data.area || "-"}
        </p>
        <p className="mt-2 text-xl font-bold text-choTot-blue">{Number(data.price).toLocaleString()} đ</p>
        <div className="mt-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">Ảnh phòng ({roomImages.length}/{MAX_DISPLAY_IMAGES})</p>
            {exceedImageLimit && <span className="text-xs text-amber-700">Tối đa hiển thị {MAX_DISPLAY_IMAGES} ảnh.</span>}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-5">
            {roomImages.map((image, index) => (
              <img
                key={`${image}-${index}`}
                src={image}
                alt={`Ảnh phòng ${index + 1}`}
                className="h-24 w-full cursor-zoom-in rounded-lg border border-slate-200 object-cover"
                onClick={() => setPreviewImage(image)}
              />
            ))}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {(data.listing_amenities || []).map((amenity) => (
            <span key={amenity} className="rounded-full bg-slate-100 px-3 py-1 text-xs">
              {amenity}
            </span>
          ))}
        </div>

        {user?.role === "tenant" && data.status === "active" && !isOwner && !hasContactAccess && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={cartLoading}
              onClick={handleAddToCart}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50"
            >
              {cartLoading ? "Đang thêm..." : "Thêm vào giỏ hàng"}
            </button>
            <button
              type="button"
              disabled={payLoading}
              onClick={handlePayNow}
              className="rounded-lg bg-choTot-yellow px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-50"
            >
              {payLoading ? "Đang thanh toán..." : `Thanh toán MoMo (${unlockPrice.toLocaleString()} VND)`}
            </button>
            <Link to="/cart" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              Xem giỏ hàng
            </Link>
          </div>
        )}
      </div>

      {data.status === "pending" && isOwner && (
        <div className="card">
          <h2 className="font-semibold">Thông tin tin đăng</h2>
          <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
            <InfoItem label="Trạng thái" value="Phòng chờ duyệt" />
            <InfoItem label="Phường/Khu vực" value={data.area} />
            <InfoItem label="Địa chỉ" value={data.address} />
            <InfoItem label="Thuê tối thiểu" value={`${data.min_stay} tháng`} />
            <InfoItem label="Ngày có thể vào ở" value={formatDate(data.available_date)} />
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="font-semibold">Thông tin liên hệ chủ nhà</h2>
        {data.status === "pending" && !isOwner && user?.role !== "admin" ? (
          <p className="mt-3 text-sm text-slate-600">
            Tin đăng đang chờ duyệt nên thông tin liên hệ tạm thời chưa mở cho người xem.
          </p>
        ) : hasContactAccess ? (
          <div className="mt-2 space-y-1 text-sm">
            <p>Người đăng: {contactInfo?.name || data.owner_name}</p>
            <p>Số điện thoại: {contactInfo?.phone || "-"}</p>
            <p>Email: {contactInfo?.email || "-"}</p>
            <p>Địa chỉ: {contactInfo?.address || data.address || "-"}</p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-600">
            Vui lòng thanh toán để xem thông tin liên hệ chủ nhà.
          </p>
        )}
      </div>

      {user?.role === "tenant" && data.status === "active" && !isOwner && (
        <div className="card">
          <h2 className="font-semibold">Đặt phòng</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <input type="date" id="bookingCheckIn" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input type="date" id="bookingCheckOut" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <button
            type="button"
            className="mt-3 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            onClick={async () => {
              const checkIn = document.getElementById("bookingCheckIn").value;
              const checkOut = document.getElementById("bookingCheckOut").value;
              if (!checkIn || !checkOut) { alert("Chọn ngày nhận/trả phòng"); return; }
              try {
                const res = await api.post("/bookings", { listingId: Number(id), checkIn, checkOut, guests: 1 });
                if (res.data.success) alert("Đặt phòng thành công!");
              } catch (err) {
                alert(err.response?.data?.message || "Lỗi đặt phòng");
              }
            }}
          >
            Đặt phòng ngay
          </button>
        </div>
      )}

      {!reviewsLoading && (user?.role === "tenant" || user?.role === "admin" || isOwner) && (
        <div className="card">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold">Đánh giá</h2>
            <p className="text-sm text-slate-600">
              Điểm trung bình: <b>{averageRating}</b> / 5 ({reviews.length} đánh giá)
            </p>
          </div>
          {reviews.map((review) => (
            <div key={review.id} className="mt-2 rounded-lg bg-slate-100 p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{review.tenant_name}</p>
                <div className="flex gap-2">
                  {!isOwner && Number(review?.tenant_id) === Number(user?.id) && (
                    <>
                      <button
                        type="button"
                        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700"
                        onClick={() => {
                          setIsEditingReview(true);
                          setNewReview({ rating: Number(review.rating || 5), comment: review.comment || "" });
                        }}
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        className="rounded-md border border-red-200 bg-white px-2 py-1 text-xs font-semibold text-red-600"
                        onClick={() => handleDeleteReview(review.id)}
                      >
                        Xóa
                      </button>
                    </>
                  )}
                  {user?.role === "admin" && (
                    <button
                      type="button"
                      className="rounded-md border border-red-200 bg-white px-2 py-1 text-xs font-semibold text-red-600"
                      onClick={() => handleDeleteReview(review.id)}
                    >
                      Xóa
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-1 text-amber-500">{renderStars(review.rating)}</p>
              <p>{review.comment}</p>
              {review.owner_reply && (
                <div className="mt-2 rounded-lg border border-slate-200 bg-white p-2 text-sm">
                  <p className="font-medium text-slate-700">Phản hồi từ chủ nhà</p>
                  <p className="mt-1 text-slate-600">{review.owner_reply}</p>
                </div>
              )}
              {isOwner && (
                <div className="mt-3 rounded-lg border border-slate-200 bg-white p-2">
                  <p className="text-xs font-medium text-slate-600">Phản hồi đánh giá này (chỉ chủ bài đăng)</p>
                  <textarea
                    value={replyDrafts[review.id] || ""}
                    onChange={(event) =>
                      setReplyDrafts((prev) => ({ ...prev, [review.id]: event.target.value }))
                    }
                    placeholder="Nhập phản hồi cho khách..."
                    className="mt-2 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-sky-500"
                    rows={2}
                  />
                  <button
                    type="button"
                    className="mt-2 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
                    onClick={() => handleReply(review.id)}
                  >
                    Lưu phản hồi
                  </button>
                </div>
              )}
            </div>
          ))}
          {reviews.length === 0 && <p className="mt-2 text-sm text-slate-500">Chưa có đánh giá.</p>}

          {user?.role === "tenant" && (
            <div className="mt-4 rounded-xl border border-slate-200 p-3">
              {myReview && !isEditingReview ? (
                <p className="text-sm text-slate-600">
                  Bạn đã đánh giá phòng này. Bấm <b>Sửa</b> trên đánh giá của bạn để cập nhật.
                </p>
              ) : (
                <>
                  <p className="text-sm font-semibold">
                    {myReview ? "Sửa đánh giá của bạn (mỗi người 1 đánh giá)" : "Thêm đánh giá của bạn"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview((prev) => ({ ...prev, rating: star }))}
                        className={`rounded-lg border px-2 py-1 text-sm ${
                          newReview.rating === star ? "border-amber-400 bg-amber-50 text-amber-600" : "border-slate-200"
                        }`}
                      >
                        {star} sao
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={newReview.comment}
                    onChange={(event) => setNewReview((prev) => ({ ...prev, comment: event.target.value }))}
                    placeholder="Nhập lời bình luận..."
                    className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
                    rows={3}
                  />
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                      onClick={handleSubmitReview}
                    >
                      {myReview ? "Cập nhật đánh giá" : "Gửi đánh giá"}
                    </button>
                    {myReview && (
                      <button
                        type="button"
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                        onClick={() => {
                          setIsEditingReview(false);
                          setNewReview({ rating: Number(myReview.rating || 5), comment: myReview.comment || "" });
                        }}
                      >
                        Hủy
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setPreviewImage("")}>
          <div className="relative w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPreviewImage("")}
              className="absolute right-2 top-2 rounded-md bg-white/90 px-3 py-1 text-sm font-medium text-slate-800"
            >
              ×
            </button>
            <img src={previewImage} alt="Ảnh phòng phóng to" className="max-h-[85vh] w-full rounded-xl object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}

function renderStars(rating) {
  const safeRating = Math.max(1, Math.min(5, Number(rating || 0)));
  return "★".repeat(safeRating) + "☆".repeat(5 - safeRating);
}

function InfoItem({ label, value }) {
  return (
    <p className="rounded-lg bg-slate-100 px-3 py-2">
      <span className="text-slate-500">{label}: </span>
      <span className="font-medium text-slate-800">{value || "-"}</span>
    </p>
  );
}

function formatDate(input) {
  if (!input) return "-";
  const [year, month, day] = String(input).split("-");
  if (!year || !month || !day) return input;
  return `${day}/${month}/${year}`;
}
