export const demoAccounts = [
  {
    id: 1,
    email: "user1@rent.vn",
    password: "123456",
    full_name: "Nguyễn Văn An",
    phone: "0900000002",
    role: "user",
    is_verified: true
  },
  {
    id: 2,
    email: "user2@rent.vn",
    password: "123456",
    full_name: "Trần Thị Hoa",
    phone: "0900000001",
    role: "user",
    is_verified: true
  },
  {
    id: 3,
    email: "admin@rent.vn",
    password: "123456",
    full_name: "Quản trị hệ thống",
    phone: "0900000000",
    role: "admin",
    is_verified: true
  }
];

const PASSWORD_STORAGE_KEY = "demo-account-passwords";

function readSavedPasswords() {
  try {
    const raw = localStorage.getItem(PASSWORD_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
}

function writeSavedPasswords(passwordMap) {
  localStorage.setItem(PASSWORD_STORAGE_KEY, JSON.stringify(passwordMap));
}

export function getAccountPassword(account) {
  if (!account?.id) {
    return "";
  }
  const passwordMap = readSavedPasswords();
  return passwordMap[String(account.id)] || account.password;
}

export function updateAccountPassword(accountId, nextPassword) {
  if (!accountId || !nextPassword) {
    return false;
  }
  const passwordMap = readSavedPasswords();
  passwordMap[String(accountId)] = nextPassword;
  writeSavedPasswords(passwordMap);
  return true;
}

export const danangWards2026 = [
  "Phường Hải Châu",
  "Phường Hòa Cường",
  "Phường Thanh Khê",
  "Phường An Khê",
  "Phường An Hải",
  "Phường Sơn Trà",
  "Phường Ngũ Hành Sơn",
  "Phường Hòa Khánh",
  "Phường Hải Vân",
  "Phường Liên Chiểu",
  "Phường Cẩm Lệ",
  "Phường Hòa Xuân",
  "Phường Tam Kỳ",
  "Phường Quảng Phú",
  "Phường Hương Trà",
  "Phường Bàn Thạch",
  "Phường Điện Bàn",
  "Phường Điện Bàn Đông",
  "Phường An Thắng",
  "Phường Điện Bàn Bắc",
  "Phường Hội An",
  "Phường Hội An Đông",
  "Phường Hội An Tây",
  "Xã Hòa Vang",
  "Xã Hòa Tiến",
  "Xã Bà Nà",
  "Xã Núi Thành",
  "Xã Tam Mỹ",
  "Xã Tam Anh",
  "Xã Đức Phú",
  "Xã Tam Xuân",
  "Xã Tây Hồ",
  "Xã Chiên Đàn",
  "Xã Phú Ninh",
  "Xã Lãnh Ngọc",
  "Xã Tiên Phước",
  "Xã Thạnh Bình",
  "Xã Sơn Cẩm Hà",
  "Xã Trà Liên",
  "Xã Trà Giáp",
  "Xã Trà Tân",
  "Xã Trà Đốc",
  "Xã Trà My",
  "Xã Nam Trà My",
  "Xã Trà Tập",
  "Xã Trà Vân",
  "Xã Trà Linh",
  "Xã Trà Leng",
  "Xã Thăng Bình",
  "Xã Thăng An",
  "Xã Thăng Trường",
  "Xã Thăng Điền",
  "Xã Thăng Phú",
  "Xã Đồng Dương",
  "Xã Quế Sơn Trung",
  "Xã Quế Sơn",
  "Xã Xuân Phú",
  "Xã Nông Sơn",
  "Xã Quế Phước",
  "Xã Duy Nghĩa",
  "Xã Nam Phước",
  "Xã Duy Xuyên",
  "Xã Thu Bồn",
  "Xã Điện Bàn Tây",
  "Xã Gò Nổi",
  "Xã Đại Lộc",
  "Xã Hà Nha",
  "Xã Thượng Đức",
  "Xã Vu Gia",
  "Xã Phú Thuận",
  "Xã Thạnh Mỹ",
  "Xã Bến Giằng",
  "Xã Nam Giang",
  "Xã Đắc Pring",
  "Xã La Dêê",
  "Xã La Êê",
  "Xã Sông Vàng",
  "Xã Sông Kôn",
  "Xã Đông Giang",
  "Xã Bến Hiên",
  "Xã Avương",
  "Xã Tây Giang",
  "Xã Hùng Sơn",
  "Xã Hiệp Đức",
  "Xã Việt An",
  "Xã Phước Trà",
  "Xã Khâm Đức",
  "Xã Phước Năng",
  "Xã Phước Chánh",
  "Xã Phước Thành",
  "Xã Phước Hiệp",
  "Đặc khu Hoàng Sa",
  "Xã Tam Hải",
  "Xã Tân Hiệp"
];

const MIN_LISTING_IMAGES = 5;
const MAX_LISTING_IMAGES = 10;
const FALLBACK_LISTING_IMAGES = [
  "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=60",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=60",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=60",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=60",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=60",
  "https://images.unsplash.com/photo-1472220625704-91e1462799b2?auto=format&fit=crop&w=1200&q=60",
  "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1200&q=60",
  "https://images.unsplash.com/photo-1505692952047-1a78307da8f2?auto=format&fit=crop&w=1200&q=60"
];

function normalizeListingImages(listingImages = [], seed = 0) {
  const cleanImages = listingImages.filter(Boolean).slice(0, MAX_LISTING_IMAGES);
  if (cleanImages.length >= MIN_LISTING_IMAGES) {
    return cleanImages;
  }

  const paddedImages = [...cleanImages];
  let cursor = seed % FALLBACK_LISTING_IMAGES.length;
  while (paddedImages.length < MIN_LISTING_IMAGES) {
    const nextImage = FALLBACK_LISTING_IMAGES[cursor % FALLBACK_LISTING_IMAGES.length];
    paddedImages.push(nextImage);
    cursor += 1;
  }
  return paddedImages.slice(0, MAX_LISTING_IMAGES);
}

const rawMockListings = [
  {
    id: 1,
    owner_id: 1,
    owner_name: "Nguyễn Văn An",
    title: "Studio gần biển Mỹ Khê",
    description: "Căn phòng đầy đủ nội thất cho thuê dài hạn, khu vực an ninh.",
    price: 4500000,
    area: "Sơn Trà",
    address: "123 Võ Nguyên Giáp",
    min_stay: 3,
    available_date: "2026-05-20",
    status: "active",
    listing_images: [
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=60",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=60",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=60"
    ],
    listing_amenities: ["Máy lạnh", "Máy giặt", "Wifi"],
    reviews: [{ id: 1, tenant_name: "Nguyễn Minh", rating: 5, comment: "Chủ nhà phản hồi nhanh." }]
  },
  {
    id: 2,
    owner_id: 1,
    owner_name: "Nguyễn Văn An",
    title: "Căn hộ mini trung tâm",
    description: "Gần chợ, siêu thị và trường học. Thích hợp ở lâu dài.",
    price: 5200000,
    area: "Hải Châu",
    address: "89 Nguyễn Văn Linh",
    min_stay: 6,
    available_date: "2026-06-01",
    status: "pending",
    listing_images: [
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=60",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=60",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=60",
      "https://images.unsplash.com/photo-1472220625704-91e1462799b2?auto=format&fit=crop&w=1200&q=60",
      "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1200&q=60",
      "https://images.unsplash.com/photo-1505692952047-1a78307da8f2?auto=format&fit=crop&w=1200&q=60"
    ],
    listing_amenities: ["Ban công", "Thang máy"],
    reviews: []
  },
  {
    id: 3,
    owner_id: 1,
    owner_name: "Nguyễn Văn An",
    title: "Phòng trọ gần cầu Rồng",
    description: "Phòng mới, sạch sẽ, có nhà xe.",
    price: 3000000,
    area: "Sơn Trà",
    address: "35 Trần Hưng Đạo",
    min_stay: 2,
    available_date: "2026-05-15",
    status: "active",
    listing_images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=60",
      "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1200&q=60"
    ],
    listing_amenities: ["Wifi", "Giường", "Tủ quần áo"],
    reviews: []
  },
  {
    id: 4,
    owner_id: 2,
    owner_name: "Trần Thị Hoa",
    title: "Căn hộ 1PN gần chợ Cồn",
    description: "Nhà mới, có thang máy, phù hợp cặp đôi đi làm.",
    price: 4800000,
    area: "Hải Châu",
    address: "22 Ông Ích Khiêm",
    min_stay: 3,
    available_date: "2026-05-28",
    status: "active",
    listing_images: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=60",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=60"
    ],
    listing_amenities: ["Máy lạnh", "Wifi", "Bếp"],
    reviews: []
  },
  {
    id: 5,
    owner_id: 2,
    owner_name: "Trần Thị Hoa",
    title: "Phòng full nội thất khu Hòa Cường",
    description: "Gần siêu thị và công viên, có chỗ để xe riêng.",
    price: 3900000,
    area: "Hòa Cường",
    address: "77 Núi Thành",
    min_stay: 2,
    available_date: "2026-05-18",
    status: "active",
    listing_images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=60"
    ],
    listing_amenities: ["Wifi", "Giường", "Tủ lạnh"],
    reviews: []
  },
  {
    id: 6,
    owner_id: 1,
    owner_name: "Nguyễn Văn An",
    title: "Studio ban công lớn phường Thanh Khê",
    description: "Không gian thoáng, tiện đi trung tâm.",
    price: 4200000,
    area: "Thanh Khê",
    address: "101 Điện Biên Phủ",
    min_stay: 3,
    available_date: "2026-06-02",
    status: "active",
    listing_images: [
      "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1200&q=60"
    ],
    listing_amenities: ["Ban công", "Máy giặt"],
    reviews: []
  },
  {
    id: 7,
    owner_id: 1,
    owner_name: "Nguyễn Văn An",
    title: "Phòng trọ giá tốt gần An Khê",
    description: "Phòng sạch sẽ, giờ giấc tự do.",
    price: 2700000,
    area: "An Khê",
    address: "14 Nguyễn Phước Nguyên",
    min_stay: 2,
    available_date: "2026-05-16",
    status: "active",
    listing_images: [
      "https://images.unsplash.com/photo-1505692952047-1a78307da8f2?auto=format&fit=crop&w=1200&q=60"
    ],
    listing_amenities: ["Nhà xe", "Wifi"],
    reviews: []
  },
  {
    id: 8,
    owner_id: 2,
    owner_name: "Trần Thị Hoa",
    title: "Căn hộ mini view biển phường An Hải",
    description: "Đi bộ 5 phút ra biển, phù hợp làm việc từ xa.",
    price: 5600000,
    area: "An Hải",
    address: "9 Võ Văn Kiệt",
    min_stay: 4,
    available_date: "2026-05-24",
    status: "active",
    listing_images: [
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=60"
    ],
    listing_amenities: ["Máy lạnh", "Bàn làm việc", "Wifi"],
    reviews: []
  },
  {
    id: 9,
    owner_id: 1,
    owner_name: "Nguyễn Văn An",
    title: "Phòng mới tại Ngũ Hành Sơn",
    description: "Gần trường đại học, khu dân trí cao.",
    price: 3500000,
    area: "Ngũ Hành Sơn",
    address: "53 Lê Văn Hiến",
    min_stay: 2,
    available_date: "2026-05-22",
    status: "active",
    listing_images: [
      "https://images.unsplash.com/photo-1472220625704-91e1462799b2?auto=format&fit=crop&w=1200&q=60"
    ],
    listing_amenities: ["Wifi", "Máy nước nóng"],
    reviews: []
  },
  {
    id: 10,
    owner_id: 2,
    owner_name: "Trần Thị Hoa",
    title: "Căn hộ 2PN khu Hòa Khánh",
    description: "Phù hợp gia đình nhỏ, có khu sinh hoạt chung.",
    price: 6200000,
    area: "Hòa Khánh",
    address: "118 Tôn Đức Thắng",
    min_stay: 6,
    available_date: "2026-06-10",
    status: "active",
    listing_images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=60"
    ],
    listing_amenities: ["Thang máy", "Bếp", "Điều hòa"],
    reviews: []
  },
  {
    id: 11,
    owner_id: 2,
    owner_name: "Trần Thị Hoa",
    title: "Studio riêng tư phường Hải Vân",
    description: "Không gian yên tĩnh, phù hợp làm việc online.",
    price: 3300000,
    area: "Hải Vân",
    address: "44 Nguyễn Lương Bằng",
    min_stay: 2,
    available_date: "2026-05-20",
    status: "active",
    listing_images: [
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=60"
    ],
    listing_amenities: ["Wifi", "Máy giặt"],
    reviews: []
  },
  {
    id: 12,
    owner_id: 1,
    owner_name: "Nguyễn Văn An",
    title: "Phòng trọ gần khu công nghiệp Liên Chiểu",
    description: "Đi làm thuận tiện, an ninh tốt.",
    price: 2800000,
    area: "Liên Chiểu",
    address: "81 Hoàng Văn Thái",
    min_stay: 2,
    available_date: "2026-05-30",
    status: "active",
    listing_images: [
      "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1200&q=60"
    ],
    listing_amenities: ["Nhà xe", "Wifi"],
    reviews: []
  },
  {
    id: 13,
    owner_id: 1,
    owner_name: "Nguyễn Văn An",
    title: "Căn hộ mới bàn giao phường Cẩm Lệ",
    description: "Khu dân cư mới, gần trường học.",
    price: 5100000,
    area: "Cẩm Lệ",
    address: "39 Cách Mạng Tháng 8",
    min_stay: 4,
    available_date: "2026-06-06",
    status: "pending",
    listing_images: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=60"
    ],
    listing_amenities: ["Thang máy", "Máy lạnh"],
    reviews: []
  }
];

export const mockListings = rawMockListings.map((listing, index) => ({
  ...listing,
  listing_images: normalizeListingImages(listing.listing_images, index)
}));

export const mockPayments = [
  { id: 1, tenant_id: 1, amount: 4500000, status: "success", created_at: "2026-05-01", method: "banking" },
  { id: 2, tenant_id: 1, amount: 3000000, status: "pending", created_at: "2026-05-06", method: "wallet" },
  { id: 3, tenant_id: 1, amount: 3900000, status: "success", created_at: "2026-05-12", method: "banking" },
  { id: 4, tenant_id: 1, amount: 5600000, status: "failed", created_at: "2026-05-16", method: "wallet" },
  { id: 5, tenant_id: 2, amount: 3500000, status: "success", created_at: "2026-05-17", method: "banking" }
];

export const mockNotifications = [
  { id: 1, user_id: 1, type: "Hệ thống", content: "Chính sách người dùng đã được cập nhật.", is_read: false },
  { id: 2, user_id: 1, type: "Tin nhắn", content: "Bạn có tin nhắn mới về lịch xem phòng.", is_read: true },
  { id: 3, user_id: 3, type: "Chính sách", content: "Cần xác nhận chính sách quản trị mới.", is_read: false }
];

export const mockPolicies = [
  { id: 1, role: "user", title: "Chính sách người dùng", version: 2, is_active: true },
  { id: 2, role: "admin", title: "Chính sách quản trị", version: 1, is_active: true }
];
