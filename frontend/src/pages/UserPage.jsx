import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { danangWards2026, mockListings, mockPayments } from "../data/mockData";
import { useAuthStore } from "../store/authStore";
import { api } from "../api/client";

export default function UserPage() {
  const [searchParams] = useSearchParams();
  const PAGE_SIZE = 6;
  const MIN_LISTING_IMAGES = 5;
  const MAX_LISTING_IMAGES = 10;
  const user = useAuthStore((s) => s.user);
  const [dashboardView, setDashboardView] = useState(user?.role === "owner" ? "owner" : "tenant");
  const [ownerSection, setOwnerSection] = useState(searchParams.get("tab") === "create-listing" ? "create-listing" : "my-listings");
  const [tenantSection, setTenantSection] = useState("rooms");
  const [showOwnerUpgrade, setShowOwnerUpgrade] = useState(false);
  const [ownerRequests, setOwnerRequests] = useState([]);
  const [ownerReqLoading, setOwnerReqLoading] = useState(false);
  const [ownerReqSubmitting, setOwnerReqSubmitting] = useState(false);
  const [ownerReqError, setOwnerReqError] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [quickFilter, setQuickFilter] = useState({
    minStay: "",
    ward: "all",
    amenities: []
  });
  const [selectedArea, setSelectedArea] = useState("all");
  const [unitKeyword, setUnitKeyword] = useState("");
  const [searchPage, setSearchPage] = useState(1);
  const [areaPage, setAreaPage] = useState(1);
  const myPayments = mockPayments.filter((item) => Number(item.tenant_id) === Number(user?.id));
  const [ownerApprovedListings, setOwnerApprovedListings] = useState([]);
  const [ownerPendingListings, setOwnerPendingListings] = useState([]);
  const [, setOwnerListingsLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "owner") return;
    const fetchMyListings = async () => {
      try {
        const res = await api.get("/listings/my-listings");
        if (res.data.success) {
          const all = res.data.data;
          setOwnerApprovedListings(all.filter((l) => l.status !== "pending"));
          setOwnerPendingListings(all.filter((l) => l.status === "pending"));
        }
      } catch {
        // fallback mock
        const mockMine = mockListings.filter((item) => Number(item.owner_id) === Number(user?.id));
        setOwnerApprovedListings(mockMine.filter((l) => l.status !== "pending"));
        setOwnerPendingListings(mockMine.filter((l) => l.status === "pending"));
      } finally {
        setOwnerListingsLoading(false);
      }
    };
    fetchMyListings();
  }, [user?.id, user?.role]);

  useEffect(() => {
    if (!showOwnerUpgrade) return;
    const fetchRequests = async () => {
      setOwnerReqLoading(true);
      try {
        const res = await api.get("/owner-requests/my-requests");
        if (res.data.success) setOwnerRequests(res.data.data);
      } catch {
        // ignore
      } finally {
        setOwnerReqLoading(false);
      }
    };
    fetchRequests();
  }, [showOwnerUpgrade]);
  const [editingListingId, setEditingListingId] = useState(null);
  const [editListingForm, setEditListingForm] = useState({
    price: "",
    minStay: "",
    availableDate: "",
    status: "active"
  });
  const [newListingForm, setNewListingForm] = useState({
    title: "",
    address: "",
    area: "",
    availableDate: "",
    price: "",
    minStay: "",
    description: "",
    amenities: [],
    imageUrls: []
  });
  const activeListings = mockListings.filter((item) => item.status === "active");
  const rentingView = dashboardView === "tenant";
  const amenityOptions = Array.from(new Set(activeListings.flatMap((listing) => listing.listing_amenities || [])));
  const quickSearchListings = activeListings.filter((listing) =>
    listing.title.toLowerCase().includes(searchKeyword.trim().toLowerCase())
  );
  const normalizeAdministrativeName = (name) => {
    return String(name || "")
      .replace(/^(Phường|Xã|Đặc khu)\s+/i, "")
      .trim()
      .toLowerCase();
  };
  const filteredUnits = danangWards2026.filter((unit) =>
    unit.toLowerCase().includes(unitKeyword.trim().toLowerCase())
  );
  const selectedAreaLabel = selectedArea === "all" ? "Tất cả khu vực" : selectedArea;
  const filteredQuickListings = quickSearchListings.filter((listing) => {
    const byMinStay = quickFilter.minStay ? Number(listing.min_stay) >= Number(quickFilter.minStay) : true;
    const byWard =
      quickFilter.ward === "all"
        ? true
        : normalizeAdministrativeName(listing.area) === normalizeAdministrativeName(quickFilter.ward);
    const byAmenities =
      quickFilter.amenities.length === 0
        ? true
        : quickFilter.amenities.every((amenity) => (listing.listing_amenities || []).includes(amenity));
    return byMinStay && byWard && byAmenities;
  });
  const filteredByAreaListings = activeListings.filter((listing) =>
    selectedArea === "all"
      ? true
      : normalizeAdministrativeName(listing.area) === normalizeAdministrativeName(selectedArea)
  );
  const pagedQuickSearchListings = filteredQuickListings.slice((searchPage - 1) * PAGE_SIZE, searchPage * PAGE_SIZE);
  const pagedAreaListings = filteredByAreaListings.slice((areaPage - 1) * PAGE_SIZE, areaPage * PAGE_SIZE);
  const totalSearchPages = Math.max(1, Math.ceil(filteredQuickListings.length / PAGE_SIZE));
  const totalAreaPages = Math.max(1, Math.ceil(filteredByAreaListings.length / PAGE_SIZE));

  useEffect(() => {
    setSearchPage(1);
  }, [searchKeyword, quickFilter]);

  useEffect(() => {
    setAreaPage(1);
  }, [selectedArea]);

  useEffect(() => {
    if (searchPage > totalSearchPages) {
      setSearchPage(totalSearchPages);
    }
  }, [searchPage, totalSearchPages]);

  useEffect(() => {
    if (areaPage > totalAreaPages) {
      setAreaPage(totalAreaPages);
    }
  }, [areaPage, totalAreaPages]);

  useEffect(() => {
    if (rentingView && !tenantSection) {
      setTenantSection("rooms");
    }
  }, [rentingView, tenantSection]);



  const toggleTenantSection = (section) => {
    setTenantSection((currentSection) => (currentSection === section ? null : section));
  };

  const openListingEditor = (listing) => {
    setEditingListingId(listing.id);
    setEditListingForm({
      price: String(listing.price || ""),
      minStay: String(listing.min_stay || ""),
      availableDate: listing.available_date || "",
      status: listing.status === "inactive" ? "inactive" : "active"
    });
  };

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Không đọc được file ảnh."));
      reader.readAsDataURL(file);
    });

  return (
    <div className="space-y-5">
      <section className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-slate-100">
        <h1 className="text-2xl font-bold md:text-3xl">Không gian người dùng</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Chuyển nhanh giữa vai trò người thuê và người cho thuê để quản lý đúng nhu cầu.
        </p>
        <div className="mt-4 inline-flex rounded-xl border border-white/20 bg-slate-900/40 p-1">
          <button
            type="button"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              rentingView ? "bg-white text-slate-900" : "text-slate-200 hover:bg-white/10"
            }`}
            onClick={() => { setDashboardView("tenant"); setShowOwnerUpgrade(false); }}
          >
            Người thuê
          </button>
          <button
            type="button"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              !rentingView ? "bg-white text-slate-900" : "text-slate-200 hover:bg-white/10"
            }`}
            onClick={() => {
              if (user?.role !== "owner") {
                setShowOwnerUpgrade(true);
                return;
              }
              setShowOwnerUpgrade(false);
              setDashboardView("owner");
            }}
          >
            Người cho thuê
          </button>
        </div>
        <div className={`mt-5 grid gap-3 ${rentingView ? "md:grid-cols-3" : "md:grid-cols-3"}`}>
      {rentingView ? (
            <>
              <Metric
                value={activeListings.length}
                label="Phòng đang mở"
                active={tenantSection === "rooms"}
                onClick={() => toggleTenantSection("rooms")}
              />
              <Metric
                value={myPayments.length}
                label="Quản lý giao dịch"
                active={tenantSection === "transactions"}
                onClick={() => toggleTenantSection("transactions")}
              />
              <Metric
                value=""
                icon={
                  <svg viewBox="0 0 24 24" className="h-8 w-8 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="7" />
                    <line x1="16.65" y1="16.65" x2="21" y2="21" />
                  </svg>
                }
                label="Tìm kiếm phòng nhanh"
                active={tenantSection === "quick-search"}
                onClick={() => toggleTenantSection("quick-search")}
              />
            </>
          ) : (
            <>
              <Metric
                value={ownerApprovedListings.length}
                label="Số tin đã đăng"
                active={ownerSection === "my-listings"}
                onClick={() => setOwnerSection("my-listings")}
              />
              <Metric
                value={ownerPendingListings.length}
                label="Tin chờ duyệt"
                active={ownerSection === "pending-listings"}
                onClick={() => setOwnerSection("pending-listings")}
              />
              <Metric
                value=""
                icon={
                  <svg viewBox="0 0 24 24" className="h-8 w-8 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                }
                label="Đăng phòng cho thuê"
                active={ownerSection === "create-listing"}
                onClick={() => setOwnerSection("create-listing")}
              />
            </>
          )}
        </div>
      </section>

      {showOwnerUpgrade && (
        <section className="rounded-2xl border border-amber-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Yêu cầu trở thành chủ nhà</h2>
          <p className="mt-1 text-sm text-slate-500">
            Gửi yêu cầu để admin phê duyệt. Sau khi được duyệt, bạn có thể đăng phòng cho thuê.
          </p>

          {ownerReqLoading ? (
            <p className="mt-3 text-sm text-slate-500">Đang tải...</p>
          ) : ownerRequests.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <p className="text-sm text-slate-600">Bạn chưa gửi yêu cầu nào.</p>
              <button
                type="button"
                disabled={ownerReqSubmitting}
                className="mt-3 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                onClick={async () => {
                  setOwnerReqSubmitting(true);
                  setOwnerReqError("");
                  try {
                    const res = await api.post("/owner-requests");
                    if (res.data.success) {
                      setOwnerRequests((prev) => [
                        { id: res.data.data.requestId, user_id: user.id, status: "pending", created_at: new Date().toISOString() },
                        ...prev
                      ]);
                    }
                  } catch (err) {
                    setOwnerReqError(err.response?.data?.message || "Có lỗi xảy ra");
                  } finally {
                    setOwnerReqSubmitting(false);
                  }
                }}
              >
                {ownerReqSubmitting ? "Đang gửi..." : "Gửi yêu cầu trở thành chủ nhà"}
              </button>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {ownerRequests.map((req) => (
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
                    <p className="font-medium">Yêu cầu #{req.id}</p>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        req.status === "approved"
                          ? "bg-emerald-100 text-emerald-700"
                          : req.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {req.status === "approved" ? "Đã duyệt" : req.status === "rejected" ? "Từ chối" : "Chờ duyệt"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Gửi lúc: {new Date(req.created_at).toLocaleString("vi-VN")}
                  </p>
                  {req.note && (
                    <p className="mt-2 text-sm text-slate-600"><b>Phản hồi:</b> {req.note}</p>
                  )}
                </div>
              ))}
              {ownerRequests.every((r) => r.status !== "pending") && (
                <div className="mt-4 border-t border-slate-200 pt-4">
                  <button
                    type="button"
                    disabled={ownerReqSubmitting}
                    className="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                    onClick={async () => {
                      setOwnerReqSubmitting(true);
                      setOwnerReqError("");
                      try {
                        const res = await api.post("/owner-requests");
                        if (res.data.success) {
                          setOwnerRequests((prev) => [
                            { id: res.data.data.requestId, user_id: user.id, status: "pending", created_at: new Date().toISOString() },
                            ...prev
                          ]);
                        }
                      } catch (err) {
                        setOwnerReqError(err.response?.data?.message || "Có lỗi xảy ra");
                      } finally {
                        setOwnerReqSubmitting(false);
                      }
                    }}
                  >
                    {ownerReqSubmitting ? "Đang gửi..." : "Gửi yêu cầu mới"}
                  </button>
                </div>
              )}
            </div>
          )}

          {ownerReqError && <p className="mt-2 text-sm text-red-600">{ownerReqError}</p>}
        </section>
      )}

      {!showOwnerUpgrade && (
        <>
      {rentingView && !tenantSection && (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-5">
          <p className="text-sm text-slate-600">
            Chọn <b>Phòng đang mở</b>, <b>Quản lý giao dịch</b> hoặc <b>Tìm kiếm phòng nhanh</b> trên khối chỉ số để hiển thị nội dung bên dưới.
          </p>
        </section>
      )}

      {rentingView ? (
        <>
          {tenantSection === "transactions" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-semibold">Quản lý giao dịch</h2>
              <p className="mt-1 text-sm text-slate-500">Theo dõi trạng thái các khoản thanh toán của tài khoản.</p>
              <div className="mt-3 space-y-2">
                {myPayments.map((payment) => (
                  <div key={payment.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2">
                    <p className="text-sm">
                      GD #{payment.id} - {Number(payment.amount).toLocaleString()} VND - {payment.created_at}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-slate-200 px-3 py-1 text-xs">{payment.method}</span>
                      <PaymentStatusBadge status={payment.status} />
                    </div>
                  </div>
                ))}
                {myPayments.length === 0 && <p className="text-sm text-slate-500">Chưa có giao dịch nào.</p>}
              </div>
            </section>
          )}

          {tenantSection === "rooms" && (
            <>
              <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold">Tìm phòng đang cho thuê</h2>
                  <input
                    value={searchKeyword}
                    onChange={(event) => setSearchKeyword(event.target.value)}
                    placeholder="Tìm nhanh theo tên phòng..."
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 md:w-80"
                  />
                </div>
                <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {pagedQuickSearchListings.map((listing) => (
                    <Link
                      key={listing.id}
                      to={`/listing/${listing.id}`}
                      className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <img
                        src={listing.listing_images?.[0]}
                        alt={listing.title}
                        className="h-36 w-full rounded-xl border border-slate-200 object-cover"
                      />
                      <p className="text-xs font-medium text-sky-700">{listing.area}</p>
                      <h3 className="mt-1 text-lg font-semibold">{listing.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {Number(listing.price).toLocaleString()} VND - tối thiểu {listing.min_stay} tháng
                      </p>
                    </Link>
                  ))}
                  {filteredQuickListings.length === 0 && (
                    <p className="text-sm text-slate-500">Không tìm thấy phòng phù hợp theo tên bạn nhập.</p>
                  )}
                </div>
                {filteredQuickListings.length > 0 && (
                  <div className="mt-4 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setSearchPage((page) => Math.max(1, page - 1))}
                      disabled={searchPage === 1}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous &lt;
                    </button>
                    <span className="text-sm text-slate-500">
                      {searchPage}/{totalSearchPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSearchPage((page) => Math.min(totalSearchPages, page + 1))}
                      disabled={searchPage === totalSearchPages}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next &gt;
                    </button>
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <h2 className="text-lg font-semibold">Xem phòng theo khu vực (phường Đà Nẵng cập nhật 2026)</h2>
                <div className="mt-3 grid gap-4 lg:grid-cols-[320px_1fr]">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <input
                      value={unitKeyword}
                      onChange={(event) => setUnitKeyword(event.target.value)}
                      placeholder="Nhập tên phường/xã để tìm..."
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500"
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedArea("all")}
                      className={`mt-2 w-full rounded-lg px-3 py-2 text-left text-sm ${
                        selectedArea === "all" ? "bg-slate-900 text-white" : "bg-white hover:bg-slate-100"
                      }`}
                    >
                      Tất cả khu vực
                    </button>
                    <div className="mt-2 max-h-52 overflow-auto rounded-lg border border-slate-200 bg-white">
                      {filteredUnits.map((unit) => (
                        <button
                          key={unit}
                          type="button"
                          onClick={() => setSelectedArea(unit)}
                          className={`block w-full border-b border-slate-100 px-3 py-2 text-left text-sm last:border-b-0 ${
                            selectedArea === unit ? "bg-sky-50 text-sky-700" : "hover:bg-slate-50"
                          }`}
                        >
                          {unit}
                        </button>
                      ))}
                      {filteredUnits.length === 0 && (
                        <p className="px-3 py-2 text-sm text-slate-500">Không tìm thấy đơn vị phù hợp.</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">
                      Đang lọc theo: <b>{selectedAreaLabel}</b>
                    </p>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {pagedAreaListings.map((listing) => (
                        <Link
                          key={listing.id}
                          to={`/listing/${listing.id}`}
                          className="rounded-xl border border-slate-200 p-3 transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                          <img
                            src={listing.listing_images?.[0]}
                            alt={listing.title}
                            className="h-36 w-full rounded-xl border border-slate-200 object-cover"
                          />
                          <p className="mt-2 text-xs font-medium text-sky-700">{listing.area}</p>
                          <p className="mt-1 font-semibold">{listing.title}</p>
                          <p className="mt-1 text-sm text-slate-600">
                            {Number(listing.price).toLocaleString()} VND - tối thiểu {listing.min_stay} tháng
                          </p>
                        </Link>
                      ))}
                      {filteredByAreaListings.length === 0 && (
                        <p className="text-sm text-slate-500">Hiện chưa có phòng active trong khu vực đã chọn.</p>
                      )}
                    </div>
                    {filteredByAreaListings.length > 0 && (
                      <div className="mt-4 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setAreaPage((page) => Math.max(1, page - 1))}
                          disabled={areaPage === 1}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Previous &lt;
                        </button>
                        <span className="text-sm text-slate-500">
                          {areaPage}/{totalAreaPages}
                        </span>
                        <button
                          type="button"
                          onClick={() => setAreaPage((page) => Math.min(totalAreaPages, page + 1))}
                          disabled={areaPage === totalAreaPages}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Next &gt;
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </>
          )}

          {tenantSection === "quick-search" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-semibold">Tìm kiếm phòng nhanh</h2>
              <p className="mt-1 text-sm text-slate-500">Trả lời nhanh các tiêu chí để lọc phòng phù hợp.</p>
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600">Thời gian thuê tối thiểu (tháng)</label>
                    <select
                      value={quickFilter.minStay}
                      onChange={(event) =>
                        setQuickFilter((prev) => ({
                          ...prev,
                          minStay: event.target.value
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500"
                    >
                      <option value="">Không giới hạn</option>
                      {[1, 2, 3, 4, 5, 6, 9, 12].map((value) => (
                        <option key={value} value={value}>
                          Tối thiểu {value} tháng
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600">Phường/Xã</label>
                    <select
                      value={quickFilter.ward}
                      onChange={(event) => setQuickFilter((prev) => ({ ...prev, ward: event.target.value }))}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500"
                    >
                      <option value="all">Tất cả khu vực</option>
                      {danangWards2026.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600">Tiện nghi (tick nhiều lựa chọn)</label>
                    <div className="mt-1 max-h-28 overflow-auto rounded-lg border border-slate-300 bg-white p-2">
                      {amenityOptions.map((amenity) => (
                        <label key={amenity} className="mb-1 flex items-center gap-2 text-sm text-slate-700 last:mb-0">
                          <input
                            type="checkbox"
                            checked={quickFilter.amenities.includes(amenity)}
                            onChange={(event) => {
                              setQuickFilter((prev) => ({
                                ...prev,
                                amenities: event.target.checked
                                  ? [...prev.amenities, amenity]
                                  : prev.amenities.filter((item) => item !== amenity)
                              }));
                            }}
                          />
                          {amenity}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <p className="text-sm text-slate-600">
                    Có <b>{filteredQuickListings.length}</b> phòng đáp ứng bộ lọc.
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setQuickFilter({
                        minStay: "",
                        ward: "all",
                        amenities: []
                      })
                    }
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700"
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              </div>

              <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {pagedQuickSearchListings.map((listing) => (
                  <Link
                    key={listing.id}
                    to={`/listing/${listing.id}`}
                    className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <img
                      src={listing.listing_images?.[0]}
                      alt={listing.title}
                      className="h-36 w-full rounded-xl border border-slate-200 object-cover"
                    />
                    <p className="text-xs font-medium text-sky-700">{listing.area}</p>
                    <h3 className="mt-1 text-lg font-semibold">{listing.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {Number(listing.price).toLocaleString()} VND - tối thiểu {listing.min_stay} tháng
                    </p>
                  </Link>
                ))}
                {filteredQuickListings.length === 0 && (
                  <p className="text-sm text-slate-500">Không có phòng phù hợp với bộ lọc đã chọn.</p>
                )}
              </div>
              {filteredQuickListings.length > 0 && (
                <div className="mt-4 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSearchPage((page) => Math.max(1, page - 1))}
                    disabled={searchPage === 1}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous &lt;
                  </button>
                  <span className="text-sm text-slate-500">
                    {searchPage}/{totalSearchPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSearchPage((page) => Math.min(totalSearchPages, page + 1))}
                    disabled={searchPage === totalSearchPages}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next &gt;
                  </button>
                </div>
              )}
            </section>
          )}
        </>
      ) : (
        <>
          {ownerSection === "my-listings" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-semibold">Quản lý tin đăng của bạn</h2>
              <div className="mt-3 grid gap-3">
                {ownerApprovedListings.length === 0 && <p className="text-sm text-slate-500">Bạn chưa có tin đã duyệt nào.</p>}
                {ownerApprovedListings.map((listing) => (
                  <div key={listing.id} className="rounded-xl border border-slate-200 p-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{listing.title}</h3>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs">{getOwnerStatusLabel(listing.status)}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      {listing.address} - {Number(listing.price).toLocaleString()} VND
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Thuê tối thiểu: {listing.min_stay} tháng - Ngày vào ở: {formatDate(listing.available_date)} - Cập nhật:{" "}
                      {formatDateTime(listing.updated_at)}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
                        onClick={() => openListingEditor(listing)}
                      >
                        Cập nhật thông tin phòng
                      </button>
                      <Link
                        to={`/listing/${listing.id}`}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
                      >
                        Xem chi tiết
                      </Link>
                      <button
                        type="button"
                        className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                        onClick={async () => {
                          if (!window.confirm("Xóa phòng này?")) return;
                          try {
                            await api.delete(`/listings/${listing.id}`);
                            setOwnerApprovedListings((prev) => prev.filter((l) => l.id !== listing.id));
                            setOwnerPendingListings((prev) => prev.filter((l) => l.id !== listing.id));
                          } catch {
                            alert("Lỗi xóa phòng");
                          }
                        }}
                      >
                        Xóa
                      </button>
                    </div>
                    {editingListingId === listing.id && (
                      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <p className="text-sm font-semibold text-slate-800">Cập nhật thông tin quản lý phòng</p>
                        <div className="mt-2 grid gap-3 md:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-xs font-medium text-slate-600">Giá thuê (VND)</label>
                            <input
                              value={editListingForm.price}
                              onChange={(event) => setEditListingForm((prev) => ({ ...prev, price: event.target.value }))}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-slate-600">Thuê tối thiểu (tháng)</label>
                            <input
                              type="number"
                              min="1"
                              value={editListingForm.minStay}
                              onChange={(event) => setEditListingForm((prev) => ({ ...prev, minStay: event.target.value }))}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-slate-600">Ngày có thể vào ở</label>
                            <input
                              type="date"
                              value={editListingForm.availableDate}
                              onChange={(event) =>
                                setEditListingForm((prev) => ({ ...prev, availableDate: event.target.value }))
                              }
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-slate-600">Trạng thái phòng</label>
                            <select
                              value={editListingForm.status}
                              onChange={(event) => setEditListingForm((prev) => ({ ...prev, status: event.target.value }))}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
                            >
                              <option value="active">Đang hoạt động</option>
                              <option value="inactive">Tạm thời hết phòng</option>
                            </select>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            type="button"
                            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
                            onClick={async () => {
                              if (!editListingForm.price || !editListingForm.minStay || !editListingForm.availableDate) {
                                return;
                              }
                              try {
                                await api.put(`/listings/${listing.id}`, {
                                  price: Number(editListingForm.price),
                                  minStay: Number(editListingForm.minStay),
                                  availableDate: editListingForm.availableDate
                                });
                                setOwnerApprovedListings((prev) =>
                                  prev.map((item) =>
                                    item.id === listing.id
                                      ? {
                                          ...item,
                                          price: Number(editListingForm.price),
                                          min_stay: Number(editListingForm.minStay),
                                          available_date: editListingForm.availableDate,
                                          status: editListingForm.status,
                                        }
                                      : item
                                  )
                                );
                                setEditingListingId(null);
                              } catch {
                                alert("Lỗi cập nhật phòng");
                              }
                            }}
                          >
                            Lưu cập nhật
                          </button>
                          <button
                            type="button"
                            className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700"
                            onClick={() => setEditingListingId(null)}
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {ownerSection === "pending-listings" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-semibold">Danh sách tin chờ duyệt</h2>
              <div className="mt-3 grid gap-3">
                {ownerPendingListings.length === 0 && <p className="text-sm text-slate-500">Hiện không có tin chờ duyệt.</p>}
                {ownerPendingListings.map((listing) => (
                  <Link
                    key={listing.id}
                    to={`/listing/${listing.id}`}
                    className="block rounded-xl border border-amber-200 bg-amber-50 p-3 transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{listing.title}</h3>
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-700">pending</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      {listing.address} - {Number(listing.price).toLocaleString()} VND
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {ownerSection === "create-listing" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-semibold">Đăng phòng cho thuê</h2>
              <p className="mt-1 text-sm text-slate-500">
                Tạo tin mới theo cấu trúc dữ liệu hệ thống, tin sẽ vào trạng thái chờ duyệt.
              </p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <input
                  value={newListingForm.title}
                  onChange={(event) => setNewListingForm((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="Tiêu đề phòng cho thuê"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
                />
                <input
                  value={newListingForm.address}
                  onChange={(event) => setNewListingForm((prev) => ({ ...prev, address: event.target.value }))}
                  placeholder="Địa chỉ chi tiết"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
                />
                <select
                  value={newListingForm.area}
                  onChange={(event) => setNewListingForm((prev) => ({ ...prev, area: event.target.value }))}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
                >
                  <option value="">Chọn phường/xã theo dữ liệu Đà Nẵng 2026</option>
                  {danangWards2026.map((unit) => (
                    <option key={`create-${unit}`} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Ngày có thể vào ở</label>
                  <input
                    type="date"
                    value={newListingForm.availableDate}
                    onChange={(event) => setNewListingForm((prev) => ({ ...prev, availableDate: event.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
                  />
                </div>
                <input
                  value={newListingForm.price}
                  onChange={(event) => setNewListingForm((prev) => ({ ...prev, price: event.target.value }))}
                  placeholder="Giá thuê (VND)"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
                />
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Thuê tối thiểu (tháng)</label>
                  <input
                    type="number"
                    min="1"
                    value={newListingForm.minStay}
                    onChange={(event) => setNewListingForm((prev) => ({ ...prev, minStay: event.target.value }))}
                    placeholder="Nhập số tháng thuê tối thiểu"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
                  />
                </div>
              </div>
              <textarea
                value={newListingForm.description}
                onChange={(event) => setNewListingForm((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Mô tả thêm về phòng..."
                rows={3}
                className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
              />
              <div className="mt-3 rounded-lg border border-slate-200 p-3">
                <p className="text-sm font-semibold">Chọn tiện nghi</p>
                <div className="mt-2 flex flex-wrap gap-3">
                  {Array.from(new Set(mockListings.flatMap((item) => item.listing_amenities || []))).map((amenity) => (
                    <label key={amenity} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={newListingForm.amenities.includes(amenity)}
                        onChange={(event) =>
                          setNewListingForm((prev) => ({
                            ...prev,
                            amenities: event.target.checked
                              ? [...prev.amenities, amenity]
                              : prev.amenities.filter((item) => item !== amenity)
                          }))
                        }
                      />
                      {amenity}
                    </label>
                  ))}
                </div>
              </div>
              <div className="mt-3 rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">Hình ảnh phòng (tối thiểu 5, tối đa 10 hình)</p>
                  <label className={`rounded-lg border border-slate-300 px-3 py-1.5 text-xs ${newListingForm.imageUrls.length >= MAX_LISTING_IMAGES ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}>
                    Upload ảnh
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={newListingForm.imageUrls.length >= MAX_LISTING_IMAGES}
                      className="hidden"
                      onChange={async (event) => {
                        const files = Array.from(event.target.files || []);
                        const remainSlots = Math.max(0, MAX_LISTING_IMAGES - newListingForm.imageUrls.length);
                        const selectedFiles = files.slice(0, remainSlots);
                        if (selectedFiles.length === 0) {
                          event.target.value = "";
                          return;
                        }
                        try {
                          const uploadedDataUrls = await Promise.all(selectedFiles.map((file) => readFileAsDataUrl(file)));
                          setNewListingForm((prev) => ({
                            ...prev,
                            imageUrls: [...prev.imageUrls, ...uploadedDataUrls].slice(0, MAX_LISTING_IMAGES)
                          }));
                        } catch {
                          // Keep UX simple for frontend mock; skip broken files.
                        }
                        event.target.value = "";
                      }}
                    />
                  </label>
                </div>
                <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {newListingForm.imageUrls.map((imageUrl, index) => (
                    <div key={`image-${index}`} className="rounded-lg border border-slate-200 p-2">
                      <img src={imageUrl} alt={`Ảnh phòng ${index + 1}`} className="h-28 w-full rounded-md object-cover" />
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-xs text-slate-500">Ảnh {index + 1}</p>
                        <button
                          type="button"
                          onClick={() =>
                            setNewListingForm((prev) => ({
                              ...prev,
                              imageUrls: prev.imageUrls.filter((_, imageIndex) => imageIndex !== index)
                            }))
                          }
                          className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {newListingForm.imageUrls.length === 0 && (
                  <p className="mt-2 text-sm text-slate-500">Chưa có ảnh nào được upload.</p>
                )}
                {newListingForm.imageUrls.length > 0 && newListingForm.imageUrls.length < MIN_LISTING_IMAGES && (
                  <p className="mt-2 text-xs text-amber-600">
                    Cần tối thiểu {MIN_LISTING_IMAGES} hình để đăng tin (hiện có {newListingForm.imageUrls.length}).
                  </p>
                )}
                {newListingForm.imageUrls.length >= MAX_LISTING_IMAGES && (
                  <p className="mt-2 text-xs text-amber-600">Đã đạt giới hạn tối đa {MAX_LISTING_IMAGES} hình.</p>
                )}
              </div>
              <button
                type="button"
                className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                onClick={async () => {
                  const cleanImageUrls = newListingForm.imageUrls.slice(0, MAX_LISTING_IMAGES);
                  if (
                    !newListingForm.title ||
                    !newListingForm.area ||
                    !newListingForm.address ||
                    !newListingForm.availableDate ||
                    !newListingForm.price ||
                    cleanImageUrls.length < MIN_LISTING_IMAGES
                  ) {
                    return;
                  }
                  try {
                    const res = await api.post("/listings", {
                      title: newListingForm.title,
                      description: newListingForm.description || "Tin đăng mới.",
                      price: Number(newListingForm.price),
                      area: newListingForm.area,
                      address: newListingForm.address,
                      minStay: Number(newListingForm.minStay) || 1,
                      availableDate: newListingForm.availableDate,
                      images: cleanImageUrls,
                      amenities: newListingForm.amenities
                    });
                    if (res.data.success) {
                      setOwnerPendingListings((prev) => [
                        {
                          id: res.data.data.listingId,
                          owner_id: user?.id,
                          owner_name: user?.full_name,
                          title: newListingForm.title,
                          description: newListingForm.description || "Tin đăng mới.",
                          price: Number(newListingForm.price),
                          area: newListingForm.area,
                          address: newListingForm.address,
                          min_stay: Number(newListingForm.minStay) || 1,
                          available_date: newListingForm.availableDate,
                          status: "pending",
                          listing_images: cleanImageUrls,
                          listing_amenities: newListingForm.amenities,
                          reviews: []
                        },
                        ...prev
                      ]);
                    }
                  } catch {
                    alert("Lỗi đăng tin");
                  }
                  setNewListingForm({
                    title: "",
                    address: "",
                    area: "",
                    availableDate: "",
                    price: "",
                    minStay: "",
                    description: "",
                    amenities: [],
                    imageUrls: []
                  });
                  setOwnerSection("pending-listings");
                }}
              >
                Đăng tin mới
              </button>
            </section>
          )}
        </>
      )}
      </>)}
    </div>
  );
}

function Metric({ value, label, onClick, active = false, icon = null }) {
  const clickableClass = onClick
    ? `cursor-pointer text-left hover:bg-white/10 ${active ? "ring-2 ring-white/60" : ""}`
    : "";

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`rounded-2xl border border-white/15 bg-white/5 p-4 ${clickableClass}`}>
        <p className="text-2xl font-semibold">{icon || value}</p>
        <p className="mt-1 text-xs text-slate-300">{label}</p>
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
      <p className="text-2xl font-semibold">{icon || value}</p>
      <p className="mt-1 text-xs text-slate-300">{label}</p>
    </div>
  );
}

function PaymentStatusBadge({ status }) {
  if (status === "success") {
    return <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700">success</span>;
  }
  if (status === "pending") {
    return <span className="rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-700">pending</span>;
  }
  return <span className="rounded-full bg-red-100 px-3 py-1 text-xs text-red-700">failed</span>;
}

function getOwnerStatusLabel(status) {
  if (status === "inactive") {
    return "tạm hết phòng";
  }
  if (status === "pending") {
    return "pending";
  }
  return "active";
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
