import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api/client";

const POLICY_ROLE_LABEL = { tenant: "Người thuê", owner: "Chủ nhà" };
const ROLE_LABEL = { tenant: "Người thuê", owner: "Chủ nhà", admin: "Admin" };
const LISTING_STATUS_LABEL = {
  active: "Đang hoạt động",
  pending: "Chờ duyệt",
  rejected: "Từ chối",
  hidden: "Ẩn / Hết phòng"
};

const LISTING_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='240' viewBox='0 0 400 240'%3E%3Crect fill='%23e2e8f0' width='400' height='240'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-size='16' font-family='sans-serif'%3EChưa có ảnh%3C/text%3E%3C/svg%3E";

export default function AdminPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [keyword, setKeyword] = useState("");
  const [pendingKeyword, setPendingKeyword] = useState("");
  const [activeKeyword, setActiveKeyword] = useState("");
  const [policies, setPolicies] = useState([]);
  const [editingPolicyId, setEditingPolicyId] = useState(null);
  const [policyDraft, setPolicyDraft] = useState("");
  const [newPolicyForm, setNewPolicyForm] = useState({ role: "tenant", title: "", content: "", version: 1 });

  const [users, setUsers] = useState([]);
  const [allListings, setAllListings] = useState([]);
  const [pendingUpdates, setPendingUpdates] = useState([]);
  const [ownerRequests, setOwnerRequests] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [amenityInput, setAmenityInput] = useState("");
  const [amenitySubmitting, setAmenitySubmitting] = useState(false);
  const [stats, setStats] = useState({ users: 0, pendingListings: 0, totalListings: 0, pendingUpdates: 0 });
  const [tab, setTab] = useState(searchParams.get("tab") || "userAccounts");
  const [roomSubTab, setRoomSubTab] = useState("active");
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [selectedListingDetail, setSelectedListingDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchData = useCallback(async () => {
    const results = await Promise.allSettled([
      api.get("/admin/users"),
      api.get("/admin/listings"),
      api.get("/admin/pending-updates"),
      api.get("/admin/stats"),
      api.get("/admin/owner-requests"),
      api.get("/admin/policies"),
      api.get("/admin/amenities")
    ]);

    const get = (index) => results[index].status === "fulfilled" ? results[index].value : null;

    const usersRes = get(0);
    const listingsRes = get(1);
    const updatesRes = get(2);
    const statsRes = get(3);
    const ownerReqRes = get(4);
    const policiesRes = get(5);
    const amenitiesRes = get(6);

    if (usersRes?.data?.success) setUsers(usersRes.data.data);
    if (listingsRes?.data?.success) setAllListings(listingsRes.data.data);
    if (updatesRes?.data?.success) setPendingUpdates(updatesRes.data.data);
    if (statsRes?.data?.success) setStats(statsRes.data.data);
    if (ownerReqRes?.data?.success) setOwnerRequests(ownerReqRes.data.data);
    if (policiesRes?.data?.success) setPolicies(policiesRes.data.data);
    if (amenitiesRes?.data?.success) setAmenities(amenitiesRes.data.data);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openUserDetail = async (userId) => {
    setDetailLoading(true);
    try {
      const res = await api.get(`/admin/users/${userId}`);
      if (res.data.success) setSelectedUserDetail(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi tải thông tin user");
    } finally {
      setDetailLoading(false);
    }
  };

  const openListingDetail = async (listingId) => {
    setDetailLoading(true);
    try {
      const res = await api.get(`/admin/listings/${listingId}`);
      if (res.data.success) setSelectedListingDetail(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi tải thông tin phòng");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleApproveListing = async (listingId) => {
    try {
      await api.post("/admin/review-listing", { listingId, action: "approve" });
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi duyệt phòng");
    }
  };

  const handleRejectListing = async (listingId) => {
    const note = prompt("Nhập lý do từ chối (tùy chọn):") ?? "";
    try {
      await api.post("/admin/review-listing", { listingId, action: "reject", note });
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi từ chối phòng");
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm("Xóa phòng này khỏi hệ thống?")) return;
    try {
      await api.delete(`/admin/listings/${listingId}`);
      setSelectedListingDetail(null);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi xóa phòng");
    }
  };

  const handleApproveUpdate = async (updateRequestId) => {
    try {
      await api.post("/admin/review-update", { updateRequestId, action: "approve" });
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi duyệt cập nhật");
    }
  };

  const handleRejectUpdate = async (updateRequestId) => {
    const note = prompt("Nhập lý do từ chối (tùy chọn):") ?? "";
    try {
      await api.post("/admin/review-update", { updateRequestId, action: "reject", note });
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi từ chối cập nhật");
    }
  };

  const handleApproveOwner = async (requestId) => {
    try {
      await api.post(`/admin/owner-requests/${requestId}/approve`);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi duyệt yêu cầu");
    }
  };

  const handleRejectOwner = async (requestId) => {
    const note = prompt("Nhập lý do từ chối:");
    if (note === null) return;
    try {
      await api.post(`/admin/owner-requests/${requestId}/reject`, { note });
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi từ chối yêu cầu");
    }
  };

  const handleToggleLock = async (userId) => {
    try {
      await api.patch(`/admin/users/${userId}/toggle-status`);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, is_active: !u.is_active } : u)));
      if (selectedUserDetail?.id === userId) {
        setSelectedUserDetail((prev) => (prev ? { ...prev, is_active: !prev.is_active } : prev));
      }
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khóa/mở tài khoản");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(keyword.toLowerCase()) ||
      u.email?.toLowerCase().includes(keyword.toLowerCase())
  );

  const activeListings = allListings.filter((l) => l.status === "active" || l.status === "hidden");
  const pendingListings = allListings.filter((l) => l.status === "pending" || l.status === "rejected");

  const filteredPending = pendingListings.filter((l) =>
    l.title?.toLowerCase().includes(pendingKeyword.toLowerCase())
  );

  const filteredActive = activeListings.filter((l) =>
    l.title?.toLowerCase().includes(activeKeyword.toLowerCase())
  );

  const menuItems = [
    { id: "userAccounts", label: "Quản lý user" },
    { id: "ownerRequests", label: "Duyệt chủ nhà" },
    { id: "roomManagement", label: "Quản lý phòng" },
    { id: "amenities", label: "Tiện nghi" },
    { id: "policies", label: "Chính sách" }
  ];

  const handleSwitchTab = (id) => {
    setTab(id);
    setSearchParams({});
    setKeyword("");
    setPendingKeyword("");
    setActiveKeyword("");
  };

  return (
    <div className="space-y-4">
      <section className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-slate-100">
        <h1 className="text-2xl font-bold md:text-3xl">Bảng điều khiển Admin</h1>
        <p className="mt-2 text-sm text-slate-300">Quản trị hệ thống: người dùng, phòng, yêu cầu chủ nhà.</p>
      </section>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard title="Tài khoản" value={stats.users} />
        <StatCard title="Phòng chờ duyệt" value={stats.pendingListings} />
        <StatCard title="Cập nhật chờ duyệt" value={stats.pendingUpdates || 0} />
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
          <p className="mt-1 text-sm text-slate-600">Xem chi tiết, khóa / mở khóa tài khoản người dùng.</p>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm theo tên hoặc email..."
            className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <div className="mt-3 space-y-2">
            {filteredUsers.map((u) => (
              <div key={u.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-3">
                <div>
                  <p className="font-medium">{u.full_name}</p>
                  <p className="text-xs text-slate-500">{u.email} – {ROLE_LABEL[u.role] || u.role}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-1 text-xs ${u.is_active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                    {u.is_active ? "Hoạt động" : "Đã khóa"}
                  </span>
                  <button type="button" className="rounded-md border border-slate-300 px-3 py-1 text-xs" onClick={() => openUserDetail(u.id)}>
                    Xem chi tiết
                  </button>
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

      {tab === "roomManagement" && (
        <section className="card space-y-4">
          <div>
            <h2 className="font-semibold">Quản lý phòng</h2>
            <p className="mt-1 text-sm text-slate-600">Xem phòng đang hoạt động, duyệt tin mới và duyệt cập nhật từ chủ nhà.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "active", label: `Phòng đang hoạt động (${activeListings.length})` },
              { id: "pending", label: `Duyệt phòng mới (${pendingListings.length})` },
              { id: "updates", label: `Duyệt cập nhật (${pendingUpdates.length})` }
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setRoomSubTab(item.id)}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  roomSubTab === item.id ? "bg-slate-900 text-white" : "border border-slate-300 bg-white text-slate-700"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {roomSubTab === "active" && (
            <div>
              <input
                type="text"
                value={activeKeyword}
                onChange={(e) => setActiveKeyword(e.target.value)}
                placeholder="Tìm phòng đang hoạt động..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <div className="mt-3 space-y-3">
                {filteredActive.length === 0 && <p className="text-sm text-slate-500">Không có phòng đang hoạt động.</p>}
                {filteredActive.map((item) => (
                  <ListingRow
                    key={item.id}
                    listing={item}
                    onView={() => openListingDetail(item.id)}
                    onDelete={() => handleDeleteListing(item.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {roomSubTab === "pending" && (
            <div>
              <input
                type="text"
                value={pendingKeyword}
                onChange={(e) => setPendingKeyword(e.target.value)}
                placeholder="Tìm phòng chờ duyệt..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <div className="mt-3 space-y-3">
                {filteredPending.length === 0 && <p className="text-sm text-slate-500">Không có phòng chờ duyệt.</p>}
                {filteredPending.map((item) => (
                  <div key={item.id} className={`rounded-xl border bg-white p-4 ${item.status === "rejected" ? "border-red-200" : "border-amber-200"}`}>
                    <ListingRow listing={item} onView={() => openListingDetail(item.id)} />
                    <div className="mt-3 flex gap-2">
                      <button type="button" className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm text-white" onClick={() => handleApproveListing(item.id)}>
                        {item.status === "rejected" ? "Duyệt lại" : "Duyệt"}
                      </button>
                      {item.status === "pending" && (
                        <button type="button" className="rounded-lg bg-red-600 px-4 py-1.5 text-sm text-white" onClick={() => handleRejectListing(item.id)}>
                          Từ chối
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {roomSubTab === "updates" && (
            <div className="space-y-3">
              {pendingUpdates.length === 0 && <p className="text-sm text-slate-500">Không có yêu cầu cập nhật nào.</p>}
              {pendingUpdates.map((req) => (
                <div key={req.id} className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <p className="font-semibold">{req.listing_title}</p>
                  <p className="text-xs text-slate-500">
                    Chủ nhà: {req.owner_name} ({req.owner_email}) – Gửi lúc: {new Date(req.created_at).toLocaleString("vi-VN")}
                  </p>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                      <p className="text-xs font-semibold text-slate-500">Hiện tại</p>
                      <UpdateCompare current={req} proposed={null} />
                    </div>
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                      <p className="text-xs font-semibold text-emerald-700">Đề xuất cập nhật</p>
                      <UpdateCompare current={req} proposed={req.proposed_data} />
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button type="button" className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm text-white" onClick={() => handleApproveUpdate(req.id)}>
                      Duyệt cập nhật
                    </button>
                    <button type="button" className="rounded-lg bg-red-600 px-4 py-1.5 text-sm text-white" onClick={() => handleRejectUpdate(req.id)}>
                      Từ chối
                    </button>
                    <button type="button" className="rounded-lg border border-slate-300 bg-white px-4 py-1.5 text-sm" onClick={() => openListingDetail(req.listing_id)}>
                      Xem phòng
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === "amenities" && (
        <section className="card">
          <h2 className="font-semibold">Quản lý tiện nghi</h2>
          <p className="mt-1 text-sm text-slate-600">Thêm / xóa tiện nghi cho phòng.</p>
          <form
            className="mt-3 flex gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!amenityInput.trim()) return;
              setAmenitySubmitting(true);
              try {
                const res = await api.post("/admin/amenities", { name: amenityInput.trim() });
                if (res.data.success) {
                  setAmenities((prev) => [...prev, res.data.data].sort((a, b) => a.name.localeCompare(b.name, "vi")));
                  setAmenityInput("");
                }
              } catch (err) {
                alert(err.response?.data?.message || "Lỗi thêm tiện nghi");
              } finally {
                setAmenitySubmitting(false);
              }
            }}
          >
            <input type="text" value={amenityInput} onChange={(e) => setAmenityInput(e.target.value)} placeholder="Ví dụ: Hồ bơi" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <button type="submit" disabled={amenitySubmitting} className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50">
              {amenitySubmitting ? "Đang thêm..." : "Thêm"}
            </button>
          </form>
          <div className="mt-3 flex flex-wrap gap-2">
            {amenities.length === 0 && <p className="text-sm text-slate-500">Chưa có tiện nghi nào.</p>}
            {amenities.map((a) => (
              <div key={a.id} className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm">
                <span>{a.name}</span>
                <button
                  type="button"
                  className="text-slate-500 hover:text-red-600"
                  onClick={async () => {
                    try {
                      await api.delete(`/admin/amenities/${a.id}`);
                      setAmenities((prev) => prev.filter((item) => item.id !== a.id));
                    } catch (err) {
                      alert(err.response?.data?.message || "Lỗi xóa tiện nghi");
                    }
                  }}
                >
                  x
                </button>
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

      {detailLoading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20">
          <p className="rounded-lg bg-white px-4 py-2 text-sm shadow">Đang tải...</p>
        </div>
      )}

      {selectedUserDetail && (
        <Modal onClose={() => setSelectedUserDetail(null)} title={`Chi tiết: ${selectedUserDetail.full_name}`}>
          <div className="space-y-3 text-sm">
            <InfoRow label="ID" value={selectedUserDetail.id} />
            <InfoRow label="Họ tên" value={selectedUserDetail.full_name} />
            <InfoRow label="Email" value={selectedUserDetail.email} />
            <InfoRow label="SĐT" value={selectedUserDetail.phone || "—"} />
            <InfoRow label="Vai trò" value={ROLE_LABEL[selectedUserDetail.role] || selectedUserDetail.role} />
            <InfoRow label="Xác thực email" value={selectedUserDetail.is_verified ? "Đã xác thực" : "Chưa xác thực"} />
            <InfoRow label="Trạng thái" value={selectedUserDetail.is_active ? "Hoạt động" : "Đã khóa"} />
            <InfoRow label="Ngày tạo" value={new Date(selectedUserDetail.created_at).toLocaleString("vi-VN")} />
            <InfoRow label="Số tin đăng" value={selectedUserDetail.stats?.listingCount ?? 0} />
            <InfoRow label="Số giao dịch" value={selectedUserDetail.stats?.paymentCount ?? 0} />
            {selectedUserDetail.googleAccount && (
              <InfoRow label="Google" value={`${selectedUserDetail.googleAccount.email} (${selectedUserDetail.googleAccount.google_id})`} />
            )}
            {selectedUserDetail.landlordRequests?.length > 0 && (
              <div>
                <p className="font-semibold text-slate-700">Yêu cầu trở thành chủ nhà</p>
                {selectedUserDetail.landlordRequests.map((r) => (
                  <p key={r.id} className="text-slate-600">#{r.id} – {r.status} – {new Date(r.created_at).toLocaleString("vi-VN")}</p>
                ))}
              </div>
            )}
            {selectedUserDetail.listings?.length > 0 && (
              <div>
                <p className="font-semibold text-slate-700">Tin đăng của user</p>
                {selectedUserDetail.listings.map((l) => (
                  <p key={l.id} className="text-slate-600">
                    #{l.id} {l.title} – {LISTING_STATUS_LABEL[l.status] || l.status} – {Number(l.price).toLocaleString()} VND
                  </p>
                ))}
              </div>
            )}
            <button type="button" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" onClick={() => handleToggleLock(selectedUserDetail.id)}>
              {selectedUserDetail.is_active ? "Khóa tài khoản" : "Mở khóa tài khoản"}
            </button>
          </div>
        </Modal>
      )}

      {selectedListingDetail && (
        <Modal onClose={() => setSelectedListingDetail(null)} title={selectedListingDetail.title}>
          <div className="space-y-3 text-sm">
            <img
              src={selectedListingDetail.listing_images?.[0] || LISTING_PLACEHOLDER}
              alt={selectedListingDetail.title}
              className="h-40 w-full rounded-xl object-cover"
            />
            <InfoRow label="ID" value={selectedListingDetail.id} />
            <InfoRow label="Chủ nhà" value={`${selectedListingDetail.owner_name} (${selectedListingDetail.owner_email})`} />
            <InfoRow label="Khu vực" value={selectedListingDetail.area} />
            <InfoRow label="Địa chỉ" value={selectedListingDetail.address} />
            <InfoRow label="Giá" value={`${Number(selectedListingDetail.price).toLocaleString()} VND`} />
            <InfoRow label="Thuê tối thiểu" value={`${selectedListingDetail.min_stay} tháng`} />
            <InfoRow label="Ngày vào ở" value={selectedListingDetail.available_date} />
            <InfoRow label="Trạng thái" value={LISTING_STATUS_LABEL[selectedListingDetail.status] || selectedListingDetail.status} />
            <InfoRow label="Mô tả" value={selectedListingDetail.description} />
            {selectedListingDetail.listing_amenities?.length > 0 && (
              <InfoRow label="Tiện nghi" value={selectedListingDetail.listing_amenities.join(", ")} />
            )}
            <div className="flex flex-wrap gap-2">
              <Link to={`/listing/${selectedListingDetail.id}`} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
                Mở trang công khai
              </Link>
              <button type="button" className="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600" onClick={() => handleDeleteListing(selectedListingDetail.id)}>
                Xóa phòng
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ListingRow({ listing, onView, onDelete }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <img
          src={listing.listing_images?.[0] || LISTING_PLACEHOLDER}
          alt={listing.title}
          className="h-16 w-24 shrink-0 rounded-lg object-cover"
        />
        <div className="min-w-0">
          <p className="font-medium">{listing.title}</p>
          <p className="text-xs text-slate-500">
            {listing.area} – {Number(listing.price).toLocaleString()} VND – {listing.owner_name || listing.owner_email}
          </p>
          <p className="text-xs text-slate-400">{LISTING_STATUS_LABEL[listing.status] || listing.status}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button type="button" className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs" onClick={onView}>
          Xem chi tiết
        </button>
        {onDelete && (
          <button type="button" className="rounded-lg border border-red-300 px-3 py-1.5 text-xs text-red-600" onClick={onDelete}>
            Xóa
          </button>
        )}
      </div>
    </div>
  );
}

function UpdateCompare({ current, proposed }) {
  const data = proposed || {
    price: current.listing_price,
    minStay: current.listing_min_stay,
    availableDate: current.listing_available_date,
    status: current.listing_status
  };

  return (
    <ul className="mt-2 space-y-1 text-sm text-slate-700">
      {data.price !== undefined && <li>Giá: <b>{Number(data.price).toLocaleString()} VND</b></li>}
      {data.minStay !== undefined && <li>Thuê tối thiểu: <b>{data.minStay} tháng</b></li>}
      {data.availableDate !== undefined && <li>Ngày vào ở: <b>{String(data.availableDate).slice(0, 10)}</b></li>}
      {data.status !== undefined && <li>Trạng thái: <b>{data.status === "inactive" ? "Tạm hết phòng" : data.status}</b></li>}
      {data.title !== undefined && <li>Tiêu đề: <b>{data.title}</b></li>}
      {data.area !== undefined && <li>Khu vực: <b>{data.area}</b></li>}
      {data.address !== undefined && <li>Địa chỉ: <b>{data.address}</b></li>}
      {data.description !== undefined && <li>Mô tả: <b>{data.description}</b></li>}
    </ul>
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

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="max-h-[85vh] w-full max-w-lg overflow-auto rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button type="button" className="text-slate-500 hover:text-slate-800" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
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
