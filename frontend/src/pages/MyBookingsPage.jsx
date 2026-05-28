import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get("/bookings/my-bookings");
        if (res.data.success) {
          setBookings(res.data.data);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b))
      );
    } catch {
      alert("Không thể hủy đặt phòng này");
    }
  };

  const statusLabel = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    cancelled: "Đã hủy",
    completed: "Hoàn thành"
  };

  const statusColor = {
    pending: "bg-amber-100 text-amber-700",
    confirmed: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
    completed: "bg-blue-100 text-blue-700"
  };

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold">Đặt phòng của tôi</h2>
        <p className="mt-1 text-sm text-slate-500">Quản lý các đặt phòng của bạn.</p>

        {loading ? (
          <p className="mt-4 text-sm text-slate-500">Đang tải...</p>
        ) : bookings.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <p className="text-sm text-slate-600">Bạn chưa có đặt phòng nào.</p>
            <Link
              to="/user"
              className="mt-3 inline-block rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Tìm phòng
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      Đặt phòng #{booking.id}
                    </p>
                    <p className="text-sm text-slate-600">
                      Phòng #{booking.listing_id}
                    </p>
                    <p className="text-xs text-slate-500">
                      Nhận phòng: {booking.check_in} – Trả phòng: {booking.check_out}
                    </p>
                    <p className="text-xs text-slate-500">
                      Khách: {booking.guests} – Tổng: {Number(booking.total_price).toLocaleString()} VND
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor[booking.status] || "bg-slate-100"}`}
                    >
                      {statusLabel[booking.status] || booking.status}
                    </span>
                    {(booking.status === "pending" || booking.status === "confirmed") && (
                      <button
                        type="button"
                        className="rounded-lg border border-red-300 px-3 py-1 text-xs text-red-700 hover:bg-red-50"
                        onClick={() => handleCancel(booking.id)}
                      >
                        Hủy
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
