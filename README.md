# DaNangLongTermRent

Nền tảng kết nối người thuê dài hạn và chủ nhà theo mô hình MVC, hỗ trợ Web desktop + mobile browser (responsive, mobile-first).

## 1) Tech stack

- Frontend: React (Vite) + TailwindCSS
- Backend: Node.js + Express
- Database: MySQL
- Realtime: Socket.IO (chat + notification)
- Auth: JWT + Google OAuth endpoint
- Payment: MoMo QR mock (unlock contact)

## 2) Project structure

```text
DaNangLongTermrent/
  backend/
    src/
      config/          # env + mysql connection
      controllers/     # request handlers
      services/        # business logic
      repositories/    # SQL/data access
      middlewares/     # auth/role/policy/validation/error
      routes/          # REST route modules
      socket/          # socket.io setup
      jobs/            # owner automation cron
      validators/      # Joi schemas
      database/        # seed script
    server.js
  frontend/
    src/
      api/
      components/
      hooks/
      pages/
      store/
  data/
    create_table.sql
    seed.sql
```

## 3) Setup MySQL

1. Tạo DB + bảng:
   - Chạy file `data/create_table.sql`
2. Seed data mẫu:
   - Chạy file `data/seed.sql`

Tài khoản seed có sẵn:
- admin: `admin@rent.vn`
- owner: `owner1@rent.vn`
- tenant: `tenant1@rent.vn`
- Mật khẩu demo hash tương ứng chuỗi gốc `Admin@123` (đối với backend script, bạn có thể chạy `npm run seed` để tạo hash mới chuẩn).

## 4) Setup backend

```bash
cd backend
npm install
```

Tạo/kiểm tra `.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=data_dananglongtermrent
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id

# Gửi OTP qua Gmail (Nodemailer)
EMAIL_USER=dananglongtermrent@gmail.com
EMAIL_PASS=your_gmail_app_password

# Hoặc SMTP chung
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

Chạy backend:

```bash
npm run dev
```

## 5) Setup frontend

```bash
cd frontend
npm install
```

Tạo file `.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Chạy frontend:

```bash
npm run dev
```

## 6) Luồng chính đã implement

- Chọn role ở trang đầu (`tenant` / `owner`) rồi vào `login/register`
- JWT auth + role-based authorization
- Google OAuth endpoint (`/api/auth/google-login`)
- Owner tạo listing, submit trạng thái `pending`
- Admin duyệt/reject listing
- Tenant xem listing, filter, sort, xem chi tiết
- Payment mock MoMo để unlock contact
- Review 1 tenant / 1 listing (upsert, cho phép sửa)
- Chat realtime user-admin (Socket.IO), lưu lịch sử, load thêm tin cũ
- Notification badge + popup
- Policy versioning + bắt buộc accept trước khi dùng hệ thống
- Automation mỗi tuần: listing không update sẽ giảm `priority_score`

## 7) Sample API endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/verify-email`
- `POST /api/auth/resend-otp`
- `POST /api/auth/login`
- `POST /api/auth/google-login`
- `GET /api/auth/me`

### Listings
- `GET /api/listings?area=SonTra&minPrice=1000000&maxPrice=5000000&minStay=3&sortBy=best_match`
- `GET /api/listings/:id`
- `POST /api/listings` (owner)
- `PATCH /api/listings/:id/mark-updated` (owner)

### Payment / Review
- `POST /api/payments/momo/mock` (tenant)
- `GET /api/reviews/listing/:listingId`
- `POST /api/reviews` (tenant)

### Chat / Notification / Policy
- `POST /api/chat/open-admin`
- `GET /api/chat/conversations`
- `GET /api/chat/conversations/:conversationId/messages?limit=20&offset=0`
- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`
- `GET /api/policies/state`
- `POST /api/policies/accept`

### Admin
- `GET /api/admin/pending-listings`
- `POST /api/admin/review-listing`
- `POST /api/admin/owner-warning`
- `POST /api/admin/policies`
- `GET /api/admin/stats`

## 8) UI/UX

- Mobile-first + responsive
- Phong cách marketplace tương tự Chợ Tốt (vàng + xanh)
- SPA routing
- Bubble chat trái/phải phân biệt tin nhắn
- Loading skeleton ở danh sách listing

## 9) Lưu ý production

- Google OAuth frontend cần tích hợp Google Identity Services để lấy `idToken` thực
- Email verify hiện có gửi SMTP khi cấu hình env; nếu thiếu SMTP, hệ thống vẫn chạy ở chế độ dev
- Payment đang mock để unlock contact (chưa tích hợp cổng thật)
