-- Sample data for SHOP (assumes tables exist and are empty; SERIALs start at 1)

-- 5 students (student_id is application-provided, not SERIAL)
INSERT INTO student (student_id, name, email, phone_number, dietary_restrictions) VALUES
  (100001, 'Jordan Lee', 'jlee1@oswego.edu', '3155550101', 'Vegetarian'),
  (100002, 'Sam Rivera', 'srivera@oswego.edu', '3155550102', NULL),
  (100003, 'Alex Chen', 'achen@oswego.edu', '3155550103', 'Gluten-free'),
  (100004, 'Morgan Blake', 'mblake@oswego.edu', '3155550104', NULL),
  (100005, 'Riley Patel', 'rpatel@oswego.edu', '3155550105', 'No peanuts');

-- 3 volunteers
INSERT INTO volunteer (name, email, phone, training_status) VALUES
  ('Taylor Brooks', 'tbrooks@oswego.edu', '3155550201', 'Completed'),
  ('Casey Nguyen', 'cnguyen@oswego.edu', '3155550202', 'In Progress'),
  ('Jamie Ortiz', 'jortiz@oswego.edu', '3155550203', 'Not Started');

-- 2 administrators (passwords are placeholders — replace with real hashes in production)
INSERT INTO administrator (name, email, password, phone_number) VALUES
  ('Dana Whitmore', 'dwhitmore@oswego.edu', 'placeholder_admin_password_hash_001', '3155550301'),
  ('Chris Okonkwo', 'cokonkwo@oswego.edu', 'placeholder_admin_password_hash_002', '3155550302');

-- 10 items across categories
INSERT INTO item (item_name, category, quantity_available) VALUES
  ('Canned black beans', 'Pantry', 120),
  ('Whole grain pasta', 'Pantry', 80),
  ('Brown rice (2 lb)', 'Pantry', 45),
  ('Shelf-stable milk', 'Dairy', 60),
  ('Low-fat yogurt cups', 'Dairy', 36),
  ('Baby carrots', 'Produce', 24),
  ('Apples (bag)', 'Produce', 30),
  ('Frozen mixed vegetables', 'Frozen', 40),
  ('Whole wheat bread', 'Bakery', 18),
  ('Granola bars', 'Snacks', 100);

-- 2 donors
INSERT INTO donor (name, email, phone_number) VALUES
  ('Oswego Rotary Club', 'service@oswegorotary.example.org', '3155550401'),
  ('SUNY Oswego Alumni Association', 'giving@alumni.oswego.edu', '3155550402');

-- 2 donations
INSERT INTO donation (donor_id, donated_at) VALUES
  (1, TIMESTAMP '2026-01-15 10:30:00'),
  (2, TIMESTAMP '2026-02-02 14:00:00');

-- Donation line items (2 donations with items)
INSERT INTO donation_item (donation_id, item_id, quantity_received, expiration_date) VALUES
  (1, 1, 24, DATE '2027-12-31'),
  (1, 3, 12, NULL),
  (1, 7, 20, DATE '2026-03-15'),
  (2, 4, 18, DATE '2026-08-01'),
  (2, 9, 30, DATE '2026-02-28'),
  (2, 10, 48, DATE '2026-09-01');

-- 3 requests
INSERT INTO request (student_id, status) VALUES
  (100001, 'Pending'),
  (100003, 'Partially Fulfilled'),
  (100005, 'Fulfilled');

-- Request line items
INSERT INTO request_item (request_id, item_id, quantity) VALUES
  (1, 2, 2),
  (1, 6, 1),
  (2, 5, 4),
  (2, 8, 2),
  (3, 1, 3),
  (3, 10, 6);

-- 3 pantry pickup transactions (quoted name: TRANSACTION is an SQL keyword)
INSERT INTO "transaction" (student_id, volunteer_id, date_time, notes) VALUES
  (100002, 1, TIMESTAMP '2026-02-10 11:15:00', 'First visit; reviewed pantry guidelines.'),
  (100004, 1, TIMESTAMP '2026-02-18 16:45:00', NULL),
  (100001, 2, TIMESTAMP '2026-02-22 12:05:00', 'Requested extra produce when available.');

-- Transaction line items
INSERT INTO transaction_item (transaction_id, item_id, quantity) VALUES
  (1, 4, 1),
  (1, 6, 2),
  (1, 10, 4),
  (2, 8, 1),
  (2, 9, 2),
  (3, 1, 2),
  (3, 7, 1),
  (3, 2, 1);
