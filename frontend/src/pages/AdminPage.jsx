import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import { demoAccounts, mockListings } from "../data/mockData";
import { useAdminStore } from "../store/adminStore";

const POLICY_ROLE_LABEL = { tenant: "Người thuê", owner: "Chủ nhà" };

export default function AdminPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [keyword, setKeyword] = useState("");
  const [pendingKeyword, setPendingKeyword] = useState("");
  const [approvedKeyword, setApprovedKeyword] = useState("");
  const [lockedIds, setLockedIds] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedListingId, setSelectedListingId] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [editingPolicyId, setEditingPolicyId] = useState(null);
  const [policyDraft, setPolicyDraft] = useState("");
  const [newPolicyForm, setNewPolicyForm] = useState({ role: "tenant", title: "", content: "", version: 1 });

  const [users, setUsers] = useState([]);
  const [pendingListings, setPendingListings] = useState([]);
  const [ownerRequests, setOwnerRequests] = useState([]);
  const [stats, setStats] = useState({ users: 0, pendingListings: 0, totalListings: 0 });
  const [tab, setTab] = useState(searchParams.get("tab") || "userAccounts");

  const amenities = useAdminStore((s) => s.amenities);
  const addAmenity = useAdminStore((s) => s.addAmenity);
  const removeAmenity = useAdminStore((s) => s.removeAmenity);
  const [amenityInput, setAmenityInput] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [usersRes, pendingRes, statsRes, ownerReqRes, policiesRes] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/pending-listings"),
        api.get("/admin/stats"),
        api.get("/admin/owner-requests"),
        api.get("/admin/policies")
      ]);
      if (usersRes.data.success) setUsers(usersRes.data.data);
      if (pendingRes.data.success) setPendingListings(pendingRes.data.data);
      if (statsRes.data.success) setStats(statsRes.data.data);
      if (ownerReqRes.data.success) setOwnerRequests(ownerReqRes.data.data);
      if (policiesRes.data.success) setPolicies(policiesRes.data.data);
    } catch {
      // fallback mock
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApproveListing = async (listingId) => {
    try {
      await api.post("/admin/review-listing", { listingId, action: "approve" });
      setPendingListings((prev) => prev.filter((l) => l.id !== listingId));
    } catch {
      alert("Lỗi duyệt phòng");
    }
  };

  const handleRejectListing = async (listingId) => {
    try {
      await api.post("/admin/review-listing", { listingId, action: "reject", note: "Từ chối bởi admin" });
      setPendingListings((prev) => prev.filter((l) => l.id !== listingId));
    } catch {
      alert("Lỗi từ chối phòng");
    }
  };

  const handleApproveOwner = async (requestId) => {
    try {
      await api.post(`/admin/owner-requests/${requestId}/approve`);
      setOwnerRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, status: "approved" } : r)));
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi duyệt yêu cầu");
    }
  };

  const handleRejectOwner = async (requestId) => {
    const note = prompt("Nhập lý do từ chối:");
    if (note === null) return;
    try {
      await api.post(`/admin/owner-requests/${requestId}/reject`, { note });
      setOwnerRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, status: "rejected", note } : r)));
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi từ chối yêu cầu");
    }
  };

  const handleToggleLock = async (userId) => {
    try {
      await api.patch(`/admin/users/${userId}/toggle-status`);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: !u.is_active } : u))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khóa/mở tài khoản");
    }
  };

  const filteredPending = pendingListings.filter((l) =>
    l.title?.toLowerCase().includes(pendingKeyword.toLowerCase())
  );

  const filteredUsers = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(keyword.toLowerCase()) ||
      u.email?.toLowerCase().includes(keyword.toLowerCase())
  );

  const menuItems = [
    { id: "userAccounts", label: "Quản lý user" },
    { id: "ownerRequests", label: "Duyệt chủ nhà" },
    { id: "reviews", label: "Duyệt phòng" },
    { id: "amenities", label: "Tiện nghi" },
    { id: "policies", label: "Chính sách" }
  ];

  const handleSwitchTab = (id) => {
    setTab(id);
    setSearchParams(id === "adminAccounts" ? { tab: "admin-accounts" } : {});
    setKeyword("");
    setPendingKeyword("");
    setApprovedKeyword("");
  };

  return (
    <div className="space-y-4">
      <section className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-slate-100">
        <h1 className="text-2xl font-bold md:text-3xl">Bảng điều khiển Admin</h1>
        <p className="mt-2 text-sm text-slate-300">Quản trị hệ thống: người dùng, phòng, yêu cầu chủ nhà.</p>
      </section>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard title="Tài khoản" value={stats.users} />
        <StatCard title="Phòng chờ duyệt" value={stats.pendingListings} />
        <StatCard title="Tổng tin đăng" value={stats.totalListings} />
        <StatCard title="Yêu cầu chủ nhà" value={ownerRequests.length} />
      </div>

      <section className="card">
        <p className="text-sm font-semibold text-slate-700">Menu chức năng Admin</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {menuItems.map((menu) => (
            <button
              key={menu.id}
              type="button"
              onClick={() => handleSwitchTab(menu.id)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                tab === menu.id
                  ? "bg-slate-900 text-white"
                  : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              {menu.label}
            </button>
          ))}
        </div>
      </section>

      {tab === "userAccounts" && (
        <section className="card">
          <h2 className="font-semibold">Quản lý tài khoản user</h2>
          <p className="mt-1 text-sm text-slate-600">Khóa / mở khóa tài khoản người dùng.</p>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm theo tên hoặc email..."
            className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <div className="mt-3 space-y-2">
            {filteredUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3">
                <div>
                  <p className="font-medium">{u.full_name}</p>
                  <p className="text-xs text-slate-500">{u.email} – {u.role}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-1 text-xs ${u.is_active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                    {u.is_active ? "Hoạt động" : "Đã khóa"}
                  </span>
                  <button
                    type="button"
                    className={`rounded-md px-3 py-1 text-xs ${u.is_active ? "border border-amber-200 bg-amber-50 text-amber-700" : "border border-emerald-200 bg-emerald-50 text-emerald-700"}`}
                    onClick={() => handleToggleLock(u.id)}
                  >
                    {u.is_active ? "Khóa" : "Mở khóa"}
                  </button>
                </div>
              </div>
            ))}
            {filteredUsers.length === 0 && <p className="text-sm text-slate-500">Không có user.</p>}
          </div>
        </section>
      )}

      {tab === "ownerRequests" && (
        <section className="card">
          <h2 className="font-semibold">Yêu cầu trở thành chủ nhà</h2>
          <p className="mt-1 text-sm text-slate-600">Duyệt hoặc từ chối yêu cầu từ người thuê.</p>
          <div className="mt-3 space-y-3">
            {ownerRequests.length === 0 && <p className="text-sm text-slate-500">Không có yêu cầu nào.</p>}
            {ownerRequests.map((req) => (
              <div key={req.id} className={`rounded-xl border p-4 ${
                req.status === "approved" ? "border-emerald-200 bg-emerald-50"
                : req.status === "rejected" ? "border-red-200 bg-red-50"
                : "border-amber-200 bg-amber-50"
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{req.User?.full_name || `Yêu cầu #${req.id}`}</p>
                    <p className="text-xs text-slate-500">{req.User?.email} – Gửi lúc: {new Date(req.created_at).toLocaleString("vi-VN")}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                    req.status === "approved" ? "bg-emerald-100 text-emerald-700"
                    : req.status === "rejected" ? "bg-red-100 text-red-700"
                    : "bg-amber-100 text-amber-700"
                  }`}>
                    {req.status === "approved" ? "Đã duyệt" : req.status === "rejected" ? "Từ chối" : "Chờ duyệt"}
                  </span>
                </div>
                {req.note && <p className="mt-2 text-sm text-slate-600"><b>Ghi chú:</b> {req.note}</p>}
                {req.status === "pending" && (
                  <div className="mt-3 flex gap-2">
                    <button type="button" className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm text-white hover:bg-emerald-700" onClick={() => handleApproveOwner(req.id)}>
                      Duyệt
                    </button>
                    <button type="button" className="rounded-lg bg-red-600 px-4 py-1.5 text-sm text-white hover:bg-red-700" onClick={() => handleRejectOwner(req.id)}>
                      Từ chối
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === "reviews" && (
        <section className="card">
          <h2 className="font-semibold">Duyệt phòng</h2>
          <p className="mt-1 text-sm text-slate-600">Danh sách phòng chờ duyệt.</p>
          <input
            type="text"
            value={pendingKeyword}
            onChange={(e) => setPendingKeyword(e.target.value)}
            placeholder="Tìm phòng..."
            className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <div className="mt-3 space-y-2">
            {filteredPending.length === 0 && <p className="text-sm text-slate-500">Không có phòng chờ duyệt.</p>}
            {filteredPending.map((item) => (
              <div key={item.id} className="rounded-lg border border-amber-200 bg-white p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.area} – {Number(item.price).toLocaleString()} VND</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="rounded bg-emerald-600 px-3 py-1 text-sm text-white" onClick={() => handleApproveListing(item.id)}>
                      Duyệt
                    </button>
                    <button type="button" className="rounded bg-red-600 px-3 py-1 text-sm text-white" onClick={() => handleRejectListing(item.id)}>
                      Từ chối
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === "amenities" && (
        <section className="card">
          <h2 className="font-semibold">Quản lý tiện nghi</h2>
          <p className="mt-1 text-sm text-slate-600">Thêm / xóa tiện nghi cho phòng.</p>
          <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); addAmenity(amenityInput); setAmenityInput(""); }}>
            <input type="text" value={amenityInput} onChange={(e) => setAmenityInput(e.target.value)} placeholder="Ví dụ: Hồ bơi" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">Thêm</button>
          </form>
          <div className="mt-3 flex flex-wrap gap-2">
            {amenities.map((a) => (
              <div key={a} className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm">
                <span>{a}</span>
                <button type="button" className="text-slate-500 hover:text-red-600" onClick={() => removeAmenity(a)}>x</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === "policies" && (
        <section className="card">
          <h2 className="font-semibold">Chính sách</h2>
          <p className="mt-1 text-sm text-slate-600">Quản lý chính sách người thuê và chủ nhà.</p>

          <div className="mt-4 rounded-xl border border-slate-200 p-4">
            <p className="mb-2 text-sm font-semibold">Thêm chính sách mới</p>
            <form className="grid gap-3 md:grid-cols-4" onSubmit={async (e) => {
              e.preventDefault();
              try {
                const res = await api.post("/admin/policies", newPolicyForm);
                if (res.data.success) {
                  fetchData();
                  setNewPolicyForm({ role: "tenant", title: "", content: "", version: 1 });
                }
              } catch (err) { alert(err.response?.data?.message || "Lỗi tạo chính sách"); }
            }}>
              <select value={newPolicyForm.role} onChange={(e) => setNewPolicyForm((p) => ({ ...p, role: e.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option value="tenant">Người thuê</option>
                <option value="owner">Chủ nhà</option>
              </select>
              <input type="text" placeholder="Tiêu đề" value={newPolicyForm.title} onChange={(e) => setNewPolicyForm((p) => ({ ...p, title: e.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" required />
              <input type="number" min="1" value={newPolicyForm.version} onChange={(e) => setNewPolicyForm((p) => ({ ...p, version: Number(e.target.value) }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" required />
              <textarea placeholder="Nội dung" value={newPolicyForm.content} onChange={(e) => setNewPolicyForm((p) => ({ ...p, content: e.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm md:col-span-4" rows={3} required />
              <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white md:col-span-4">Tạo chính sách</button>
            </form>
          </div>

          <div className="mt-3 space-y-3">
            {policies.length === 0 && <p className="text-sm text-slate-500">Chưa có chính sách nào.</p>}
            {policies.map((p) => (
              <div key={p.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-800">{p.title}</p>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">
                    {POLICY_ROLE_LABEL[p.role] || p.role} v{p.version}
                  </span>
                </div>
                {editingPolicyId === p.id ? (
                  <div className="mt-3">
                    <textarea rows={7} value={policyDraft} onChange={(e) => setPolicyDraft(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                    <div className="mt-2 flex gap-2">
                      <button type="button" className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white" onClick={async () => {
                        try {
                          await api.put(`/admin/policies/${p.id}`, { content: policyDraft, version: p.version + 1 });
                          fetchData();
                          setEditingPolicyId(null);
                        } catch (err) { alert(err.response?.data?.message || "Lỗi cập nhật"); }
                      }}>Lưu</button>
                      <button type="button" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" onClick={() => setEditingPolicyId(null)}>Hủy</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="mt-2 min-h-[60px] whitespace-pre-wrap text-sm text-slate-600">{p.content || "Chưa có nội dung."}</p>
                    <div className="mt-2 flex gap-2">
                      <button type="button" className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white" onClick={() => { setEditingPolicyId(p.id); setPolicyDraft(p.content); }}>Sửa</button>
                      <button type="button" className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600" onClick={async () => {
                        try {
                          await api.delete(`/admin/policies/${p.id}`);
                          fetchData();
                        } catch (err) { alert(err.response?.data?.message || "Lỗi xóa"); }
                      }}>Xóa</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="card">
      <p className="text-sm text-slate-600">{title}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}


