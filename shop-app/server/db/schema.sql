-- STUDENT
CREATE TABLE STUDENT (
  student_id INTEGER PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone_number VARCHAR(15),
  dietary_restrictions TEXT
);

-- VOLUNTEER
CREATE TABLE VOLUNTEER (
  volunteer_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(15),
  training_status VARCHAR(20) CHECK(training_status IN 
    ('Not Started', 'In Progress', 'Completed'))
);

-- ADMINISTRATOR
CREATE TABLE ADMINISTRATOR (
  admin_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone_number VARCHAR(15)
);

-- ITEM
CREATE TABLE ITEM (
  item_id SERIAL PRIMARY KEY,
  item_name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  quantity_available INTEGER NOT NULL DEFAULT 0 
    CHECK(quantity_available >= 0)
);

-- DONOR
CREATE TABLE DONOR (
  donor_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  phone_number VARCHAR(15)
);

-- DONATION
CREATE TABLE DONATION (
  donation_id SERIAL PRIMARY KEY,
  donor_id INTEGER NOT NULL,
  donated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (donor_id) REFERENCES DONOR(donor_id) ON DELETE CASCADE
);

-- DONATION_ITEM
CREATE TABLE DONATION_ITEM (
  donation_id INTEGER NOT NULL,
  item_id INTEGER NOT NULL,
  quantity_received INTEGER NOT NULL CHECK(quantity_received > 0),
  expiration_date DATE,
  PRIMARY KEY (donation_id, item_id),
  FOREIGN KEY (donation_id) REFERENCES DONATION(donation_id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES ITEM(item_id) ON DELETE CASCADE
);

-- REQUEST
CREATE TABLE REQUEST (
  request_id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Pending' 
    CHECK(status IN ('Pending', 'Fulfilled', 'Partially Fulfilled', 'Cancelled')),
  FOREIGN KEY (student_id) REFERENCES STUDENT(student_id) ON DELETE CASCADE
);

-- REQUEST_ITEM
CREATE TABLE REQUEST_ITEM (
  request_id INTEGER NOT NULL,
  item_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL CHECK(quantity > 0),
  PRIMARY KEY (request_id, item_id),
  FOREIGN KEY (request_id) REFERENCES REQUEST(request_id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES ITEM(item_id) ON DELETE CASCADE
);

-- TRANSACTION
CREATE TABLE TRANSACTION (
  transaction_id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL,
  volunteer_id INTEGER NOT NULL,
  date_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  FOREIGN KEY (student_id) REFERENCES STUDENT(student_id) ON DELETE CASCADE,
  FOREIGN KEY (volunteer_id) REFERENCES VOLUNTEER(volunteer_id) ON DELETE RESTRICT
);

-- TRANSACTION_ITEM
CREATE TABLE TRANSACTION_ITEM (
  transaction_id INTEGER NOT NULL,
  item_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL CHECK(quantity > 0),
  PRIMARY KEY (transaction_id, item_id),
  FOREIGN KEY (transaction_id) REFERENCES TRANSACTION(transaction_id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES ITEM(item_id) ON DELETE CASCADE
);

-- VOLUNTEER_SHIFT
CREATE TABLE VOLUNTEER_SHIFT (
  shift_id SERIAL PRIMARY KEY,
  volunteer_id INTEGER NOT NULL,
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL CHECK(end_time > start_time),
  FOREIGN KEY (volunteer_id) REFERENCES VOLUNTEER(volunteer_id) ON DELETE CASCADE
);

-- MANAGES
CREATE TABLE MANAGES (
  admin_id INTEGER NOT NULL,
  item_id INTEGER NOT NULL,
  action_type VARCHAR(20) NOT NULL 
    CHECK(action_type IN ('Add', 'Update', 'Remove', 'Adjust')),
  action_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (admin_id, item_id, action_date),
  FOREIGN KEY (admin_id) REFERENCES ADMINISTRATOR(admin_id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES ITEM(item_id) ON DELETE CASCADE
);
