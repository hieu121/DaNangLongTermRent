USE data_dananglongtermrent;

INSERT INTO users (email, password_hash, full_name, phone, role, is_verified)
VALUES
  ('admin@rent.vn', '$2b$10$X8DdeemxU2sFKKjL4siQ0u9xjH5lVVVj5hg2mVqfxxz8oG3Dk0GxK', 'System Admin', '0900000000', 'admin', TRUE),
  ('owner1@rent.vn', '$2b$10$X8DdeemxU2sFKKjL4siQ0u9xjH5lVVVj5hg2mVqfxxz8oG3Dk0GxK', 'Owner Demo', '0900000001', 'owner', TRUE),
  ('tenant1@rent.vn', '$2b$10$X8DdeemxU2sFKKjL4siQ0u9xjH5lVVVj5hg2mVqfxxz8oG3Dk0GxK', 'Tenant Demo', '0900000002', 'tenant', TRUE);

INSERT INTO listings (owner_id, title, description, price, area, address, min_stay, available_date, status, priority_score)
VALUES
  (2, 'Studio gan bien My Khe', 'Can phong day du noi that cho thue dai han', 4500000, 'Son Tra', '123 Vo Nguyen Giap', 3, CURDATE(), 'active', 100),
  (2, 'Can ho mini trung tam', 'Gan cho, sieu thi va truong hoc', 5200000, 'Hai Chau', '89 Nguyen Van Linh', 6, CURDATE(), 'pending', 100);

INSERT INTO listing_images (listing_id, image_url) VALUES
  (1, 'https://picsum.photos/640/480?1'),
  (1, 'https://picsum.photos/640/480?2');

INSERT INTO listing_amenities (listing_id, amenity) VALUES
  (1, 'May lanh'),
  (1, 'May giat'),
  (1, 'Wifi');

INSERT INTO policies (role, title, content, version, is_active) VALUES
  ('tenant', 'Tenant Policy v1', 'Noi dung policy cho tenant', 1, TRUE),
  ('owner', 'Owner Policy v1', 'Noi dung policy cho owner', 1, TRUE);
