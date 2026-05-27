CREATE DATABASE IF NOT EXISTS data_dananglongtermrent;
USE data_dananglongtermrent;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS user_policy_acceptances;
DROP TABLE IF EXISTS policies;
DROP TABLE IF EXISTS listing_update_logs;
DROP TABLE IF EXISTS owner_warnings;
DROP TABLE IF EXISTS listing_reviews;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS conversation_participants;
DROP TABLE IF EXISTS conversations;
DROP TABLE IF EXISTS payment_listing_access;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS listing_amenities;
DROP TABLE IF EXISTS listing_images;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS listings;
DROP TABLE IF EXISTS user_google_accounts;
DROP TABLE IF EXISTS otps;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NULL,
  role ENUM('tenant', 'owner', 'admin') NOT NULL,
  avatar_url TEXT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_google_accounts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  google_id VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE otps (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_otps_email ON otps(email);

CREATE TABLE listings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  owner_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  area VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  min_stay INT NOT NULL CHECK (min_stay >= 1),
  available_date DATE NOT NULL,
  status ENUM('pending', 'active', 'rejected', 'hidden') DEFAULT 'pending',
  missed_weeks INT DEFAULT 0,
  priority_score INT DEFAULT 100,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE listing_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  listing_id INT NOT NULL,
  image_url TEXT NOT NULL,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);

CREATE TABLE listing_amenities (
  id INT PRIMARY KEY AUTO_INCREMENT,
  listing_id INT NOT NULL,
  amenity VARCHAR(100) NOT NULL,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);

CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tenant_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  method ENUM('momo') DEFAULT 'momo',
  status ENUM('pending', 'success', 'failed') DEFAULT 'pending',
  momo_transaction_id VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE payment_listing_access (
  id INT PRIMARY KEY AUTO_INCREMENT,
  payment_id INT NOT NULL,
  listing_id INT NOT NULL,
  unlocked BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);

CREATE TABLE conversations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE conversation_participants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  conversation_id INT NOT NULL,
  user_id INT NOT NULL,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_conv_user (conversation_id, user_id)
);

CREATE TABLE messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  conversation_id INT NOT NULL,
  sender_id INT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  type ENUM('message', 'system', 'policy') NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE listing_reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  listing_id INT NOT NULL,
  admin_id INT NOT NULL,
  action ENUM('approve', 'reject') NOT NULL,
  note TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE owner_warnings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  owner_id INT NOT NULL,
  admin_id INT NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE listing_update_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  listing_id INT NOT NULL,
  action ENUM('updated', 'no_response') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);

CREATE TABLE policies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  role ENUM('tenant', 'owner') NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  version INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_policy_acceptances (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  policy_id INT NOT NULL,
  version INT NOT NULL,
  accepted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (policy_id) REFERENCES policies(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_user_policy (user_id, policy_id)
);

CREATE TABLE reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  listing_id INT NOT NULL,
  tenant_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_listing_tenant_review (listing_id, tenant_id)
);

CREATE INDEX idx_listing_area ON listings(area);
CREATE INDEX idx_listing_price ON listings(price);
CREATE INDEX idx_message_conversation ON messages(conversation_id);
CREATE INDEX idx_review_listing ON reviews(listing_id);