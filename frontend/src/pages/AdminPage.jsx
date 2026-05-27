import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { demoAccounts, mockListings } from "../data/mockData";
import { useAdminStore } from "../store/adminStore";

const POLICY_STORAGE_KEY = "adminPolicies";

const defaultPolicies = {
  renter: {
    type: "renter",
    title: "Chính sách người thuê",
    text: "",
    version: 0,
    updatedAt: "",
    history: []
  },
  landlord: {
    type: "landlord",
    title: "Chính sách người cho thuê",
    text: "",
    version: 0,
    updatedAt: "",
    history: []
  }
};

const getSavedPolicies = () => {
  try {
    const raw = localStorage.getItem(POLICY_STORAGE_KEY);
    if (!raw) {
      return defaultPolicies;
    }
    const parsed = JSON.parse(raw);
    return {
      renter: { ...defaultPolicies.renter, ...(parsed?.renter || {}) },
      landlord: { ...defaultPolicies.landlord, ...(parsed?.landlord || {}) }
    };
  } catch {
    return defaultPolicies;
  }
};

export default function AdminPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [amenityInput, setAmenityInput] = useState("");
  const [activeMenu, setActiveMenu] = useState(searchParams.get("tab") === "admin-accounts" ? "adminAccounts" : "userAccounts");
  const [keyword, setKeyword] = useState("");
  const [pendingKeyword, setPendingKeyword] = useState("");
  const [approvedKeyword, setApprovedKeyword] = useState("");
  const [lockedIds, setLockedIds] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedListingId, setSelectedListingId] = useState(null);
  const [policies, setPolicies] = useState(getSavedPolicies);
  const [editingPolicyType, setEditingPolicyType] = useState("");
  const [policyDraft, setPolicyDraft] = useState("");
  const amenities = useAdminStore((s) => s.amenities);
  const addAmenity = useAdminStore((s) => s.addAmenity);
  const removeAmenity = useAdminStore((s) => s.removeAmenity);
  const pending = mockListings.filter((item) => item.status === "pending");
  const approved = mockListings.filter((item) => item.status === "active");
  const userAccounts = demoAccounts.filter((account) => account.role === "user");
  const adminAccounts = demoAccounts.filter((account) => account.role === "admin");
  const normalizedKeyword = keyword.trim().toLowerCase();
  const normalizedPendingKeyword = pendingKeyword.trim().toLowerCase();
  const normalizedApprovedKeyword = approvedKeyword.trim().toLowerCase();

  const filteredUsers = useMemo(() => {
    if (!normalizedKeyword) {
      return userAccounts;
    }
    return userAccounts.filter((account) => {
      const byName = account.full_name.toLowerCase().includes(normalizedKeyword);
      const byEmail = account.email.toLowerCase().includes(normalizedKeyword);
      return byName || byEmail;
    });
  }, [normalizedKeyword, userAccounts]);

  const filteredAdmins = useMemo(() => {
    if (!normalizedKeyword) {
      return adminAccounts;
    }
    return adminAccounts.filter((account) => {
      const byName = account.full_name.toLowerCase().includes(normalizedKeyword);
      const byEmail = account.email.toLowerCase().includes(normalizedKeyword);
      return byName || byEmail;
    });
  }, [normalizedKeyword, adminAccounts]);

  const filteredPending = useMemo(() => {
    if (!normalizedPendingKeyword) {
      return pending;
    }
    return pending.filter((item) => item.title.toLowerCase().includes(normalizedPendingKeyword));
  }, [normalizedPendingKeyword, pending]);

  const filteredApproved = useMemo(() => {
    if (!normalizedApprovedKeyword) {
      return approved;
    }
    return approved.filter((item) => item.title.toLowerCase().includes(normalizedApprovedKeyword));
  }, [normalizedApprovedKeyword, approved]);

  const selectedListing = useMemo(() => {
    if (!selectedListingId) {
      return null;
    }
    return mockListings.find((item) => Number(item.id) === Number(selectedListingId)) || null;
  }, [selectedListingId]);

  const listingOwner = useMemo(() => {
    if (!selectedListing) {
      return null;
    }
    return demoAccounts.find((account) => Number(account.id) === Number(selectedListing.owner_id)) || null;
  }, [selectedListing]);

  const stats = {
    users: demoAccounts.length,
    pendingListings: pending.length,
    totalListings: mockListings.length,
    amenities: amenities.length
  };
  const menuItems = [
    { id: "userAccounts", label: "Quản lý tài khoản user" },
    { id: "adminAccounts", label: "Quản lý tài khoản admin" },
    { id: "reviews", label: "Quản lý phòng" },
    { id: "amenities", label: "Quản lý tiện nghi" },
    { id: "policies", label: "Chính sách" }
  ];

  const toggleLockAccount = (accountId) => {
    setLockedIds((prev) =>
      prev.includes(accountId) ? prev.filter((id) => id !== accountId) : [...prev, accountId]
    );
  };

  const isLocked = (accountId) => lockedIds.includes(accountId);

  const openPolicyEditor = (type) => {
    setEditingPolicyType(type);
    setPolicyDraft(policies[type]?.text || "");
  };

  const closePolicyEditor = () => {
    setEditingPolicyType("");
    setPolicyDraft("");
  };

  const savePolicy = () => {
    if (!editingPolicyType) {
      return;
    }
    const current = policies[editingPolicyType];
    const text = policyDraft.trim();
    
    const newHistoryEntry = current.text ? {
      version: current.version,
      text: current.text,
      updatedAt: current.updatedAt || new Date().toLocaleString("vi-VN")
    } : null;

    const nextHistory = current.history ? [...current.history] : [];
    if (newHistoryEntry) {
      nextHistory.push(newHistoryEntry);
    }

    const nextPolicy = {
      ...current,
      text,
      version: current.text ? current.version + 1 : 1,
      updatedAt: new Date().toLocaleString("vi-VN"),
      history: nextHistory
    };
    const nextPolicies = {
      ...policies,
      [editingPolicyType]: nextPolicy
    };
    setPolicies(nextPolicies);
    localStorage.setItem(POLICY_STORAGE_KEY, JSON.stringify(nextPolicies));
    closePolicyEditor();
  };

  useEffect(() => {
    if (searchParams.get("tab") === "admin-accounts") {
      setActiveMenu("adminAccounts");
      return;
    }
    if (activeMenu === "adminAccounts") {
      setActiveMenu("userAccounts");
    }
  }, [searchParams, activeMenu]);

  return (
    <div className="space-y-4">
      <section className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-slate-100">
        <h1 className="text-2xl font-bold md:text-3xl">Bảng điều khiển Admin</h1>
        <p className="mt-2 text-sm text-slate-300">
          Quản trị hệ thống với 2 vai trò rõ ràng: admin và user. Tài khoản user có thể vừa thuê vừa cho thuê.
        </p>
      </section>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard title="Tài khoản" value={stats.users} />
        <StatCard title="Phòng chờ duyệt" value={stats.pendingListings} />
        <StatCard title="Tổng tin đăng" value={stats.totalListings} />
        <StatCard title="Tiện nghi hệ thống" value={stats.amenities} />
      </div>

      <section className="card">
        <p className="text-sm font-semibold text-slate-700">Menu chức năng Admin</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {menuItems.map((menu) => (
            <button
              key={menu.id}
              type="button"
              onClick={() => {
                setActiveMenu(menu.id);
                setSearchParams(menu.id === "adminAccounts" ? { tab: "admin-accounts" } : {});
                setKeyword("");
                setPendingKeyword("");
                setApprovedKeyword("");
              }}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                activeMenu === menu.id
                  ? "bg-slate-900 text-white"
                  : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              {menu.label}
            </button>
          ))}
        </div>
      </section>

      {(activeMenu === "userAccounts" || activeMenu === "adminAccounts") && (
        <section className="card">
          <SectionTitle
            title={activeMenu === "userAccounts" ? "Quản lý tài khoản user" : "Quản lý tài khoản admin"}
            subtitle="Tìm nhanh theo tên hoặc Gmail, xem chi tiết và khóa/mở khóa tài khoản."
          />

          <div className="mt-3">
            <input
              type="text"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm tài khoản theo tên hoặc Gmail..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="mt-3 grid gap-4 md:grid-cols-[1.5fr_1fr]">
            <div>
              {activeMenu === "userAccounts" ? (
                <AccountColumn
                  title={`Danh sách user (${filteredUsers.length})`}
                  accounts={filteredUsers}
                  isLocked={isLocked}
                  onToggleLock={toggleLockAccount}
                  onViewDetail={setSelectedAccount}
                />
              ) : (
                <AccountColumn
                  title={`Danh sách admin (${filteredAdmins.length})`}
                  accounts={filteredAdmins}
                  isLocked={isLocked}
                  onToggleLock={toggleLockAccount}
                  onViewDetail={setSelectedAccount}
                />
              )}
            </div>

            <AccountDetailCard account={selectedAccount} isLocked={isLocked} />
          </div>
        </section>
      )}

      {activeMenu === "reviews" && (
        <section className="card">
          <SectionTitle title="Quản lý phòng" subtitle="Theo dõi danh sách phòng chưa duyệt và đã duyệt trong hệ thống." />
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3">
              <p className="text-sm font-semibold text-amber-800">Phòng chưa duyệt ({filteredPending.length})</p>
              <input
                type="text"
                value={pendingKeyword}
                onChange={(event) => setPendingKeyword(event.target.value)}
                placeholder="Tìm nhanh phòng chưa duyệt..."
                className="mt-2 w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm"
              />
              <div className="mt-2 grid gap-2">
                {filteredPending.length === 0 && <p className="text-sm text-slate-500">Không có phòng chờ duyệt.</p>}
                {filteredPending.map((item) => (
                  <div
                    key={item.id}
                    className={`cursor-pointer rounded-lg border bg-white p-3 ${
                      Number(selectedListingId) === Number(item.id) ? "border-amber-400 ring-1 ring-amber-300" : "border-slate-200"
                    }`}
                    onClick={() => setSelectedListingId(item.id)}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-xs text-slate-500">
                          {item.area} - {Number(item.price).toLocaleString()} VND
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="rounded bg-green-600 px-3 py-1 text-sm text-white"
                          onClick={(event) => {
                            event.stopPropagation();
                            window.alert("Frontend mock: Duyệt phòng thành công.");
                          }}
                        >
                          Duyệt
                        </button>
                        <button
                          type="button"
                          className="rounded bg-red-600 px-3 py-1 text-sm text-white"
                          onClick={(event) => {
                            event.stopPropagation();
                            window.alert("Frontend mock: Đã từ chối phòng.");
                          }}
                        >
                          Từ chối
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3">
              <p className="text-sm font-semibold text-emerald-800">Phòng đã duyệt ({filteredApproved.length})</p>
              <input
                type="text"
                value={approvedKeyword}
                onChange={(event) => setApprovedKeyword(event.target.value)}
                placeholder="Tìm nhanh phòng đã duyệt..."
                className="mt-2 w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm"
              />
              <div className="mt-2 grid gap-2">
                {filteredApproved.length === 0 && <p className="text-sm text-slate-500">Chưa có phòng đã duyệt.</p>}
                {filteredApproved.map((item) => (
                  <div
                    key={item.id}
                    className={`cursor-pointer rounded-lg border bg-white p-3 ${
                      Number(selectedListingId) === Number(item.id) ? "border-emerald-400 ring-1 ring-emerald-300" : "border-slate-200"
                    }`}
                    onClick={() => setSelectedListingId(item.id)}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-xs text-slate-500">
                          {item.area} - {Number(item.price).toLocaleString()} VND
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                        Đã duyệt
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {activeMenu === "amenities" && (
        <section className="card">
          <SectionTitle
            title="Quản lý tiện nghi"
            subtitle="Admin nhập danh sách tiện nghi để user chọn nhanh khi đăng tin."
          />
          <form
            className="mt-3 flex flex-col gap-2 md:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              addAmenity(amenityInput);
              setAmenityInput("");
            }}
          >
            <input
              type="text"
              value={amenityInput}
              onChange={(event) => setAmenityInput(event.target.value)}
              placeholder="Ví dụ: Hồ bơi, Bảo vệ 24/7..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">
              Thêm tiện nghi
            </button>
          </form>
          <div className="mt-3 flex flex-wrap gap-2">
            {amenities.map((amenity) => (
              <div key={amenity} className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm">
                <span>{amenity}</span>
                <button
                  type="button"
                  className="rounded-full px-1 text-slate-500 hover:bg-slate-200 hover:text-slate-800"
                  onClick={() => removeAmenity(amenity)}
                >
                  x
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeMenu === "policies" && (
        <section className="card">
          <SectionTitle
            title="Chính sách hệ thống"
            subtitle="Có 2 chính sách: dành cho người thuê và người cho thuê. Bạn có thể thêm mới hoặc chỉnh sửa."
          />
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <PolicyCard
              policy={policies.renter}
              isEditing={editingPolicyType === "renter"}
              draft={policyDraft}
              onEdit={() => openPolicyEditor("renter")}
              onDraftChange={setPolicyDraft}
              onSave={savePolicy}
              onCancel={closePolicyEditor}
            />
            <PolicyCard
              policy={policies.landlord}
              isEditing={editingPolicyType === "landlord"}
              draft={policyDraft}
              onEdit={() => openPolicyEditor("landlord")}
              onDraftChange={setPolicyDraft}
              onSave={savePolicy}
              onCancel={closePolicyEditor}
            />
          </div>
        </section>
      )}

      {selectedListing && (
        <ListingDetailModal
          listing={selectedListing}
          owner={listingOwner}
          onClose={() => setSelectedListingId(null)}
        />
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

function SectionTitle({ title, subtitle }) {
  return (
    <div>
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
    </div>
  );
}

function AccountColumn({ title, accounts, isLocked, onToggleLock, onViewDetail }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      <div className="mt-2 grid gap-2">
        {accounts.length === 0 && <p className="text-sm text-slate-500">Chưa có tài khoản.</p>}
        {accounts.map((account) => (
          <AccountRow
            key={account.id}
            account={account}
            locked={isLocked(account.id)}
            onToggleLock={onToggleLock}
            onViewDetail={onViewDetail}
          />
        ))}
      </div>
    </div>
  );
}

function AccountRow({ account, locked, onToggleLock, onViewDetail }) {
  const roleLabel = account.role === "admin" ? "admin" : "user";

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-3">
      <div>
        <p className="font-medium">{account.full_name}</p>
        <p className="text-xs text-slate-500">{account.email}</p>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="rounded-full bg-slate-100 px-2 py-1 font-medium">{roleLabel}</span>
        <span
          className={`rounded-full px-2 py-1 font-medium ${
            account.is_verified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
          }`}
        >
          {account.is_verified ? "Đã xác thực" : "Chờ xác thực"}
        </span>
        <button
          type="button"
          className="rounded-md border border-slate-300 px-2 py-1 text-slate-700 hover:bg-slate-100"
          onClick={() => onViewDetail(account)}
        >
          Xem chi tiết
        </button>
        <button
          type="button"
          className={`rounded-md px-2 py-1 ${
            locked ? "border border-red-200 bg-red-50 text-red-700" : "border border-amber-200 bg-amber-50 text-amber-700"
          }`}
          onClick={() => onToggleLock(account.id)}
        >
          {locked ? "Mở khóa" : "Khóa tài khoản"}
        </button>
      </div>
    </div>
  );
}

function AccountDetailCard({ account, isLocked }) {
  if (!account) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4">
        <p className="text-sm font-semibold text-slate-700">Chi tiết tài khoản</p>
        <p className="mt-2 text-sm text-slate-500">Chọn "Xem chi tiết" ở danh sách bên trái để hiển thị thông tin.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-slate-700">Chi tiết tài khoản</p>
      <div className="mt-3 space-y-2 text-sm">
        <p>
          <b>Họ tên:</b> {account.full_name}
        </p>
        <p>
          <b>Email:</b> {account.email}
        </p>
        <p>
          <b>Số điện thoại:</b> {account.phone}
        </p>
        <p>
          <b>Vai trò:</b> {account.role}
        </p>
        <p>
          <b>Trạng thái:</b> {isLocked(account.id) ? "Đã khóa" : "Đang hoạt động"}
        </p>
      </div>
    </div>
  );
}

function ListingDetailModal({ listing, owner, onClose }) {
  const MAX_DISPLAY_IMAGES = 10;
  const [previewImage, setPreviewImage] = useState("");
  const allImages = listing?.listing_images || [];
  const displayImages = allImages.slice(0, MAX_DISPLAY_IMAGES);
  const exceedLimit = allImages.length > MAX_DISPLAY_IMAGES;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-4 shadow-xl md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-700">Chi tiết phòng đã chọn</p>
            <p className="mt-1 text-xs text-slate-500">Bấm dấu X để đóng tab chi tiết.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-700 hover:bg-slate-100"
          >
            ×
          </button>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">Ảnh phòng ({displayImages.length}/{MAX_DISPLAY_IMAGES})</p>
            {exceedLimit && <p className="text-xs text-amber-700">Đã giới hạn hiển thị tối đa {MAX_DISPLAY_IMAGES} ảnh.</p>}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-5">
            {displayImages.map((imageUrl, index) => (
              <img
                key={`${imageUrl}-${index}`}
                src={imageUrl}
                alt={`Ảnh phòng ${index + 1}`}
                className="h-24 w-full cursor-zoom-in rounded-lg border border-slate-200 object-cover"
                onClick={() => setPreviewImage(imageUrl)}
              />
            ))}
            {displayImages.length === 0 && (
              <div className="col-span-full rounded-lg border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">
                Chưa có ảnh cho phòng này.
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <DetailItem label="Tên phòng" value={listing.title} />
          <DetailItem label="Trạng thái" value={listing.status === "pending" ? "Chưa duyệt" : "Đã duyệt"} />
          <DetailItem label="Phường/Khu vực" value={listing.area} />
          <DetailItem label="Địa chỉ" value={listing.address} />
          <DetailItem label="Giá thuê" value={`${Number(listing.price).toLocaleString()} VND`} />
          <DetailItem label="Thuê tối thiểu" value={`${listing.min_stay || "-"} tháng`} />
          <DetailItem label="Ngày có thể vào ở" value={formatDate(listing.available_date)} />
          <DetailItem label="Cập nhật lần cuối" value={formatDateTime(listing.updated_at)} />
        </div>

        <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm">
          <p className="font-semibold text-slate-700">Mô tả tin đăng</p>
          <p className="mt-1 whitespace-pre-wrap text-slate-600">{listing.description || "Chưa có mô tả."}</p>
        </div>

        <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm">
          <p className="font-semibold text-slate-700">Tiện nghi đã chọn</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(listing.listing_amenities || []).map((amenity) => (
              <span key={amenity} className="rounded-full bg-white px-3 py-1 text-xs">
                {amenity}
              </span>
            ))}
            {(listing.listing_amenities || []).length === 0 && <p className="text-slate-500">Chưa có tiện nghi.</p>}
          </div>
        </div>

        <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm">
          <p className="font-semibold text-slate-700">Thông tin người đăng</p>
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            <DetailItem label="Họ tên" value={owner?.full_name || listing.owner_name} />
            <DetailItem label="Email" value={owner?.email || "Chưa có dữ liệu"} />
            <DetailItem label="Số điện thoại" value={owner?.phone || "Chưa có dữ liệu"} />
            <DetailItem label="Vai trò" value={owner?.role || "user"} />
          </div>
        </div>
      </div>

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

function DetailItem({ label, value }) {
  return (
    <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm">
      <b>{label}:</b> {value || "-"}
    </p>
  );
}

function formatDate(input) {
  if (!input) {
    return "-";
  }
  const [year, month, day] = String(input).split("-");
  if (!year || !month || !day) {
    return input;
  }
  return `${day}/${month}/${year}`;
}

function formatDateTime(input) {
  if (!input) {
    return "chưa cập nhật";
  }
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return input;
  }
  return date.toLocaleString("vi-VN");
}

function PolicyCard({ policy, isEditing, draft, onEdit, onDraftChange, onSave, onCancel }) {
  const [viewingHistory, setViewingHistory] = useState(null);
  const hasContent = Boolean(policy.text);
  const history = policy.history || [];

  useEffect(() => {
    if (isEditing) {
      setViewingHistory(null);
    }
  }, [isEditing]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="font-semibold text-slate-800">{policy.title}</p>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">v{policy.version || 0}</span>
      </div>

      {!isEditing && !viewingHistory && (
        <>
          <p className="mt-2 min-h-[60px] whitespace-pre-wrap text-sm text-slate-600">
            {hasContent ? policy.text : "Chưa có nội dung chính sách. Nhấn Thêm để tạo mới."}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {policy.updatedAt ? `Cập nhật lần cuối: ${policy.updatedAt}` : "Chưa có lịch sử cập nhật."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white"
              onClick={onEdit}
            >
              {hasContent ? "Sửa chính sách" : "Thêm chính sách"}
            </button>
          </div>

          {history.length > 0 && (
            <div className="mt-4 border-t border-slate-100 pt-3">
              <p className="text-sm font-semibold text-slate-700">Lịch sử thay đổi</p>
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto pr-2">
                {[...history].reverse().map((h, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg bg-slate-50 p-2 text-sm">
                    <div>
                      <span className="font-medium">Phiên bản v{h.version}</span>
                      <p className="text-xs text-slate-500">{h.updatedAt}</p>
                    </div>
                    <button 
                      type="button" 
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      onClick={() => setViewingHistory(h)}
                    >
                      Xem nội dung
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {viewingHistory && (
        <div className="mt-3 rounded-lg bg-amber-50 p-3 border border-amber-200">
          <div className="flex items-center justify-between mb-2 border-b border-amber-200 pb-2">
             <p className="text-sm font-semibold text-amber-900">
               Đang xem phiên bản cũ (v{viewingHistory.version})
             </p>
             <button
               type="button"
               className="text-xs font-medium text-amber-700 hover:text-amber-900"
               onClick={() => setViewingHistory(null)}
             >
               Đóng
             </button>
          </div>
          <p className="whitespace-pre-wrap text-sm text-amber-800">
            {viewingHistory.text}
          </p>
          <p className="mt-2 text-xs text-amber-600/70">
            Cập nhật lúc: {viewingHistory.updatedAt}
          </p>
        </div>
      )}

      {isEditing && (
        <div className="mt-3">
          <textarea
            rows={7}
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            placeholder="Nhập nội dung chính sách..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <div className="mt-2 flex gap-2">
            <button type="button" className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white" onClick={onSave}>
              Lưu
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
              onClick={onCancel}
            >
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
