-- Minimal but query-covering seed data for SHOP.
-- Assumes tables exist and are empty.
-- Uses explicit IDs for SERIAL tables to keep foreign keys deterministic.

-- STUDENTS — 6 with varied dietary_restrictions (NULL + values)
INSERT INTO student (student_id, name, email, phone_number, dietary_restrictions) VALUES
  (100001, 'Jordan Lee', 'jlee1@oswego.edu', '3155550101', 'Vegetarian'),
  (100002, 'Sam Rivera', 'srivera@oswego.edu', '3155550102', NULL),
  (100003, 'Alex Chen', 'achen@oswego.edu', '3155550103', 'Gluten-free'),
  (100004, 'Morgan Blake', 'mblake@oswego.edu', '3155550104', NULL),
  (100005, 'Riley Patel', 'rpatel@oswego.edu', '3155550105', 'Nut allergy'),
  (100006, 'Avery Johnson', 'ajohnson@oswego.edu', '3155550106', 'Halal');

-- VOLUNTEERS — 4 with training_status distribution for GROUP BY
INSERT INTO volunteer (volunteer_id, name, email, phone, training_status) VALUES
  (1, 'Taylor Brooks', 'tbrooks@oswego.edu', '3155550201', 'Completed'),
  (2, 'Casey Nguyen', 'cnguyen@oswego.edu', '3155550202', 'In Progress'),
  (3, 'Jamie Ortiz', 'jortiz@oswego.edu', '3155550203', 'Not Started'),
  (4, 'Robin Kim', 'rkim@oswego.edu', '3155550204', 'Completed');

-- ADMINISTRATORS — 2
INSERT INTO administrator (admin_id, name, email, password, phone_number) VALUES
  (1, 'Dana Whitmore', 'dwhitmore@oswego.edu', 'placeholder_admin_password_hash_001', '3155550301'),
  (2, 'Chris Okonkwo', 'cokonkwo@oswego.edu', 'placeholder_admin_password_hash_002', '3155550302');

-- ITEMS — 12 across 5 categories, with low stock (<5) + out of stock (=0)
-- Categories required: Canned Goods, Grains, Dairy, Produce, Hygiene
INSERT INTO item (item_id, item_name, category, quantity_available) VALUES
  (1, 'Canned black beans', 'Canned Goods', 25),
  (2, 'Canned tuna', 'Canned Goods', 4),          -- low stock (<5)
  (3, 'Brown rice (2 lb)', 'Grains', 1),          -- low stock (<5)
  (4, 'Whole grain pasta', 'Grains', 3),          -- low stock (<5)
  (5, 'Shelf-stable milk', 'Dairy', 0),           -- out of stock
  (6, 'Low-fat yogurt cups', 'Dairy', 0),         -- out of stock
  (7, 'Apples (bag)', 'Produce', 18),
  (8, 'Baby carrots', 'Produce', 12),
  (9, 'Bananas (bunch)', 'Produce', 20),
  (10, 'Toothpaste', 'Hygiene', 15),
  (11, 'Soap bar', 'Hygiene', 30),
  (12, 'Shampoo (travel)', 'Hygiene', 8);

-- DONORS — 3 (1 organization, 2 individuals)
INSERT INTO donor (donor_id, name, email, phone_number) VALUES
  (1, 'Oswego Rotary Club', 'service@oswegorotary.example.org', '3155550401'),
  (2, 'Patricia Gomez', 'pgomez@example.com', '3155550402'),
  (3, 'Ethan Wright', 'ewright@example.com', '3155550403');

-- DONATIONS — 4 across 3 donors (at least one donor has 2 donations)
INSERT INTO donation (donation_id, donor_id, donated_at) VALUES
  (1, 1, TIMESTAMP '2026-01-15 10:30:00'),
  (2, 2, TIMESTAMP '2026-02-02 14:00:00'),
  (3, 1, TIMESTAMP '2026-02-20 09:10:00'), -- donor 1 has 2 donations
  (4, 3, TIMESTAMP '2026-03-05 16:25:00');

-- DONATION_ITEM — 8 rows across 4 donations; same item appears in >=2 donations
INSERT INTO donation_item (donation_id, item_id, quantity_received, expiration_date) VALUES
  (1, 1, 24, DATE '2027-12-31'),
  (1, 5, 10, DATE '2026-08-01'),
  (2, 3, 8, NULL),
  (2, 10, 12, NULL),
  (3, 1, 18, DATE '2027-10-01'), -- item 1 repeated across donations
  (3, 7, 15, DATE '2026-03-15'),
  (4, 2, 6, DATE '2028-01-01'),
  (4, 10, 20, NULL);             -- item 10 repeated across donations

-- REQUESTS — 5 across 4 different students; all 4 statuses; one student has 2 requests
INSERT INTO request (request_id, student_id, status) VALUES
  (1, 100001, 'Pending'),
  (2, 100003, 'Fulfilled'),
  (3, 100005, 'Partially Fulfilled'),
  (4, 100006, 'Cancelled'),
  (5, 100001, 'Pending'); -- student 100001 has 2 requests

-- REQUEST_ITEM — 7 rows; 2-3 items appear in multiple requests
INSERT INTO request_item (request_id, item_id, quantity) VALUES
  (1, 3, 2),
  (1, 7, 1),
  (2, 3, 1),  -- item 3 repeats
  (2, 10, 1), -- item 10 repeats
  (3, 10, 2), -- item 10 repeats
  (4, 11, 1),
  (5, 7, 2);  -- item 7 repeats

-- TRANSACTIONS — 5 across >=3 students and >=3 volunteers; dates across >=2 weeks
-- (quoted name because TRANSACTION is an SQL keyword)
INSERT INTO "transaction" (transaction_id, student_id, volunteer_id, date_time, notes) VALUES
  (1, 100002, 1, TIMESTAMP '2026-02-03 11:15:00', 'First visit; reviewed pantry guidelines.'),
  (2, 100004, 2, TIMESTAMP '2026-02-05 16:45:00', NULL),
  (3, 100001, 3, TIMESTAMP '2026-02-11 12:05:00', 'Requested extra produce when available.'),
  (4, 100003, 4, TIMESTAMP '2026-02-18 09:30:00', NULL),
  (5, 100005, 1, TIMESTAMP '2026-02-23 14:20:00', 'Follow-up visit.'); -- later week

-- TRANSACTION_ITEM — 10 rows across 5 transactions; >=3 items appear in multiple transactions
INSERT INTO transaction_item (transaction_id, item_id, quantity) VALUES
  (1, 1, 2),
  (1, 7, 1),
  (2, 1, 1),  -- item 1 repeats
  (2, 10, 1),
  (3, 7, 2),  -- item 7 repeats
  (3, 10, 1), -- item 10 repeats
  (4, 3, 1),
  (4, 10, 2), -- item 10 repeats
  (5, 1, 1),  -- item 1 repeats
  (5, 3, 2);  -- item 3 repeats

-- VOLUNTEER_SHIFT — 6 shifts across all 4 volunteers; at least one volunteer has 2 shifts
INSERT INTO volunteer_shift (shift_id, volunteer_id, shift_date, start_time, end_time) VALUES
  (1, 1, DATE '2026-02-03', TIME '09:00', TIME '12:00'),
  (2, 1, DATE '2026-02-10', TIME '13:00', TIME '16:00'), -- volunteer 1 has 2 shifts
  (3, 2, DATE '2026-02-05', TIME '10:00', TIME '14:00'),
  (4, 3, DATE '2026-02-11', TIME '09:00', TIME '12:00'),
  (5, 4, DATE '2026-02-18', TIME '12:00', TIME '15:00'),
  (6, 2, DATE '2026-02-23', TIME '09:00', TIME '11:00'); -- volunteer 2 also has 2 shifts

-- MANAGES — 5 rows with action_types ('Add', 'Update', 'Adjust', 'Remove', 'Add')
INSERT INTO manages (admin_id, item_id, action_type, action_date) VALUES
  (1, 1, 'Add',    TIMESTAMP '2026-01-10 08:00:00'),
  (1, 3, 'Update', TIMESTAMP '2026-02-01 09:15:00'),
  (2, 2, 'Adjust', TIMESTAMP '2026-02-10 15:45:00'),
  (2, 6, 'Remove', TIMESTAMP '2026-02-12 10:05:00'),
  (1, 10, 'Add',   TIMESTAMP '2026-03-01 11:30:00');
