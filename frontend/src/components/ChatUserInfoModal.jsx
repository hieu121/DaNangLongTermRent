import { useEffect, useState } from "react";
import { api } from "../api/client";
import { ROLE_LABEL } from "../store/authStore";

const LISTING_STATUS_LABEL = {
  active: "Đang hoạt động",
  pending: "Chờ duyệt",
  rejected: "Từ chối",
  hidden: "Ẩn / Hết phòng"
};

export default function ChatUserInfoModal({ userId, open, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !userId) {
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError("");
    setDetail(null);

    api
      .get(`/admin/users/${userId}`)
      .then((res) => {
        if (!cancelled && res.data.success) {
          setDetail(res.data.data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.message || "Không thể tải thông tin user.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, userId]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-auto rounded-2xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold">
            {detail ? `Chi tiết: ${detail.full_name}` : "Thông tin user"}
          </h3>
          <button type="button" className="text-slate-500 hover:text-slate-800" onClick={onClose} aria-label="Đóng">
            ✕
          </button>
        </div>

        {loading && <p className="text-sm text-slate-500">Đang tải...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {detail && (
          <div className="space-y-3 text-sm">
            <InfoRow label="ID" value={detail.id} />
            <InfoRow label="Họ tên" value={detail.full_name} />
            <InfoRow label="Email" value={detail.email} />
            <InfoRow label="SĐT" value={detail.phone || "—"} />
            <InfoRow label="Vai trò" value={ROLE_LABEL[detail.role] || detail.role} />
            <InfoRow label="Xác thực email" value={detail.is_verified ? "Đã xác thực" : "Chưa xác thực"} />
            <InfoRow label="Trạng thái" value={detail.is_active ? "Hoạt động" : "Đã khóa"} />
            <InfoRow label="Ngày tạo" value={new Date(detail.created_at).toLocaleString("vi-VN")} />
            <InfoRow label="Số tin đăng" value={detail.stats?.listingCount ?? 0} />
            <InfoRow label="Số giao dịch" value={detail.stats?.paymentCount ?? 0} />
            {detail.googleAccount && (
              <InfoRow
                label="Google"
                value={`${detail.googleAccount.email} (${detail.googleAccount.google_id})`}
              />
            )}
            {detail.landlordRequests?.length > 0 && (
              <div>
                <p className="font-semibold text-slate-700">Yêu cầu trở thành chủ nhà</p>
                {detail.landlordRequests.map((r) => (
                  <p key={r.id} className="text-slate-600">
                    #{r.id} – {r.status} – {new Date(r.created_at).toLocaleString("vi-VN")}
                  </p>
                ))}
              </div>
            )}
            {detail.listings?.length > 0 && (
              <div>
                <p className="font-semibold text-slate-700">Tin đăng của user</p>
                {detail.listings.map((l) => (
                  <p key={l.id} className="text-slate-600">
                    #{l.id} {l.title} – {LISTING_STATUS_LABEL[l.status] || l.status} –{" "}
                    {Number(l.price).toLocaleString()} VND
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-2">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-800">{value}</span>
    </div>
  );
}
