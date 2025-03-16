CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);

CREATE TABLE coupons (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL,
  claimed BOOLEAN DEFAULT FALSE
);

CREATE TABLE claims (
  id SERIAL PRIMARY KEY,
  coupon_id INT REFERENCES coupons(id) ON DELETE CASCADE,
  ip_address TEXT,
  session_id TEXT,
  claim_time TIMESTAMP DEFAULT NOW()
);
