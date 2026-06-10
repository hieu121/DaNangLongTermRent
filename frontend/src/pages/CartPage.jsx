import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

const LISTING_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='240' viewBox='0 0 400 240'%3E%3Crect fill='%23e2e8f0' width='400' height='240'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-size='16' font-family='sans-serif'%3EChưa có ảnh%3C/text%3E%3C/svg%3E";

const UNLOCK_PRICE = 30000;

export default function CartPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [paying, setPaying] = useState(false);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/cart");
      if (res.data.success) {
        const cartItems = res.data.data || [];
        setItems(cartItems);
        setSelectedIds(cartItems.map((item) => item.listing_id));
      }
    } catch {
      setItems([]);
      setSelectedIds([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.includes(item.listing_id)),
    [items, selectedIds]
  );

  const totalAmount = selectedItems.length * UNLOCK_PRICE;

  const toggleSelect = (listingId) => {
    setSelectedIds((prev) =>
      prev.includes(listingId) ? prev.filter((id) => id !== listingId) : [...prev, listingId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(items.map((item) => item.listing_id));
  };

  const removeItem = async (listingId) => {
    try {
      const res = await api.delete(`/cart/${listingId}`);
      if (res.data.success) {
        setItems(res.data.data || []);
        setSelectedIds((prev) => prev.filter((id) => id !== listingId));
      }
    } catch (err) {
      alert(err.response?.data?.message || "Không thể xóa phòng khỏi giỏ hàng");
    }
  };

  const handleCheckout = async () => {
    if (!selectedIds.length) {
      alert("Chọn ít nhất một phòng để thanh toán");
      return;
    }
    setPaying(true);
    try {
      const res = await api.post("/payments/momo/checkout", { listingIds: selectedIds });
      if (res.data.success) {
        alert("Thanh toán MoMo thành công! Bạn có thể xem thông tin liên hệ chủ nhà.");
        await fetchCart();
        setSelectedIds([]);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Thanh toán thất bại");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-sm text-slate-500">Đang tải giỏ hàng...</div>;
  }

  return (
    <div className="space-y-4">
      <section className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-slate-100">
        <h1 className="text-2xl font-bold">Giỏ hàng</h1>
        <p className="mt-2 text-sm text-slate-300">
          Chọn phòng muốn thanh toán để mở khóa thông tin liên hệ chủ nhà ({UNLOCK_PRICE.toLocaleString()} VND/phòng).
        </p>
      </section>

      <section className="card">
        {items.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-slate-500">Giỏ hàng trống.</p>
            <Link to="/user" className="mt-3 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              Tìm phòng
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={selectedIds.length === items.length && items.length > 0}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-slate-300"
                />
                Chọn tất cả ({items.length} phòng)
              </label>
              <p className="text-sm text-slate-600">
                Tổng thanh toán: <b className="text-choTot-blue">{totalAmount.toLocaleString()} VND</b>
              </p>
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.listing_id}
                  className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.listing_id)}
                    onChange={() => toggleSelect(item.listing_id)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  <img
                    src={item.image_url || LISTING_PLACEHOLDER}
                    alt={item.title}
                    className="h-20 w-28 rounded-lg border border-slate-200 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <Link to={`/listing/${item.listing_id}`} className="font-semibold text-slate-900 hover:underline">
                      {item.title}
                    </Link>
                    <p className="mt-1 text-sm text-choTot-blue">{Number(item.price).toLocaleString()} đ/tháng</p>
                    <p className="text-xs text-slate-500">
                      Phí mở khóa liên hệ: {UNLOCK_PRICE.toLocaleString()} VND
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.listing_id)}
                    className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Xóa
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              disabled={paying || !selectedIds.length}
              onClick={handleCheckout}
              className="mt-5 w-full rounded-xl bg-choTot-yellow px-6 py-3 text-sm font-bold text-slate-900 hover:opacity-90 disabled:opacity-50 md:w-auto"
            >
              {paying ? "Đang thanh toán..." : `Thanh toán MoMo (${selectedIds.length} phòng)`}
            </button>
          </>
        )}
      </section>
    </div>
  );
}
