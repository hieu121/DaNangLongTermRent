import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuthStore } from "../store/authStore";

export default function OwnerRequestPage() {
  const user = useAuthStore((s) => s.user);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchRequests = async () => {
    try {
      const res = await api.get("/owner-requests/my-requests");
      if (res.data.success) {
        setRequests(res.data.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleRequest = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await api.post("/owner-requests");
      if (res.data.success) {
        setRequests((prev) => [
          { id: res.data.data.requestId, user_id: user.id, status: "pending", created_at: new Date().toISOString() },
          ...prev
        ]);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  const latestRequest = requests[0];
  const canRequest = !latestRequest || latestRequest.status !== "pending";

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold">Yêu cầu trở thành chủ nhà</h2>
        <p className="mt-1 text-sm text-slate-500">
          Gửi yêu cầu để admin phê duyệt. Sau khi được duyệt, bạn có thể đăng phòng cho thuê.
        </p>

        {requests.length === 0 && !loading && (
          <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <p className="text-sm text-slate-600">Bạn chưa gửi yêu cầu nào.</p>
            <button
              type="button"
              disabled={submitting}
              className="mt-3 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
              onClick={handleRequest}
            >
              {submitting ? "Đang gửi..." : "Gửi yêu cầu trở thành chủ nhà"}
            </button>
          </div>
        )}

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <div className="mt-4 space-y-3">
          {requests.map((req) => (
            <div
              key={req.id}
              className={`rounded-xl border p-4 ${
                req.status === "approved"
                  ? "border-emerald-200 bg-emerald-50"
                  : req.status === "rejected"
                  ? "border-red-200 bg-red-50"
                  : "border-amber-200 bg-amber-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Yêu cầu #{req.id}</p>
                  <p className="text-xs text-slate-500">
                    Gửi lúc: {new Date(req.created_at).toLocaleString("vi-VN")}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    req.status === "approved"
                      ? "bg-emerald-100 text-emerald-700"
                      : req.status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {req.status === "approved"
                    ? "Đã duyệt"
                    : req.status === "rejected"
                    ? "Từ chối"
                    : "Chờ duyệt"}
                </span>
              </div>
              {req.note && (
                <p className="mt-2 text-sm text-slate-600">
                  <b>Phản hồi:</b> {req.note}
                </p>
              )}
              {req.reviewed_at && (
                <p className="mt-1 text-xs text-slate-500">
                  Xử lý lúc: {new Date(req.reviewed_at).toLocaleString("vi-VN")}
                </p>
              )}
            </div>
          ))}
        </div>

        {canRequest && requests.length > 0 && (
          <div className="mt-4 border-t border-slate-200 pt-4">
            <button
              type="button"
              disabled={submitting}
              className="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
              onClick={handleRequest}
            >
              {submitting ? "Đang gửi..." : "Gửi yêu cầu mới"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
