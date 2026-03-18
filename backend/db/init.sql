CREATE DATABASE IF NOT EXISTS blood_management;
USE blood_management;

-- ==============================
-- 1. BLOOD BANK
-- ==============================
CREATE TABLE IF NOT EXISTS blood_bank (
    bank_id INT NOT NULL AUTO_INCREMENT,
    bank_name VARCHAR(100),
    city VARCHAR(100),
    contact_no VARCHAR(15),
    PRIMARY KEY (bank_id)
);

-- ==============================
-- 2. HOSPITAL
-- ==============================
CREATE TABLE IF NOT EXISTS hospital (
    hospital_id INT NOT NULL AUTO_INCREMENT,
    hospital_name VARCHAR(100),
    city VARCHAR(100),
    contact_no VARCHAR(15),
    PRIMARY KEY (hospital_id)
);

-- ==============================
-- 3. DONOR
-- ==============================
CREATE TABLE IF NOT EXISTS donor (
    donor_id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100),
    age INT,
    gender VARCHAR(10),
    phone_no VARCHAR(15),
    blood_group VARCHAR(5),
    last_donation_date DATE,
    city VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    PRIMARY KEY (donor_id)
);

-- ==============================
-- 4. HEALTH CHECK
-- Donor (1) → (M) Health_Check
-- ==============================
CREATE TABLE IF NOT EXISTS health_check (
    check_id INT NOT NULL AUTO_INCREMENT,
    donor_id INT,
    check_date DATE,
    weight FLOAT,
    blood_pressure VARCHAR(20),
    hemoglobin FLOAT,
    eligibility_status VARCHAR(20),
    PRIMARY KEY (check_id),
    FOREIGN KEY (donor_id) REFERENCES donor(donor_id)
);

-- ==============================
-- 5. DONATION RECORD
-- Donor (1) → (M) Donation_Record
-- Health_Check (1) → (M) Donation_Record
-- Blood_Bank (1) → (M) Donation_Record
-- ==============================
CREATE TABLE IF NOT EXISTS donation_record (
    donation_id INT NOT NULL AUTO_INCREMENT,
    donor_id INT,
    check_id INT,
    bank_id INT,
    donation_date DATE,
    quantity INT,
    PRIMARY KEY (donation_id),
    FOREIGN KEY (donor_id) REFERENCES donor(donor_id),
    FOREIGN KEY (check_id) REFERENCES health_check(check_id),
    FOREIGN KEY (bank_id) REFERENCES blood_bank(bank_id)
);

-- ==============================
-- 6. BLOOD STOCK
-- Blood_Bank (1) → (M) Blood_Stock
-- ==============================
CREATE TABLE IF NOT EXISTS blood_stock (
    stock_id INT NOT NULL AUTO_INCREMENT,
    bank_id INT,
    blood_group VARCHAR(5),
    available_units INT,
    last_updated DATE,
    PRIMARY KEY (stock_id),
    FOREIGN KEY (bank_id) REFERENCES blood_bank(bank_id)
);

-- ==============================
-- 7. PATIENT
-- Hospital (1) → (M) Patient
-- ==============================
CREATE TABLE IF NOT EXISTS patient (
    patient_id INT NOT NULL AUTO_INCREMENT,
    hospital_id INT,
    name VARCHAR(100),
    age INT,
    gender VARCHAR(10),
    blood_group VARCHAR(5),
    PRIMARY KEY (patient_id),
    FOREIGN KEY (hospital_id) REFERENCES hospital(hospital_id)
);

-- ==============================
-- 8. BLOOD REQUEST
-- Hospital (1) → (M) Blood_Request
-- Patient (1) → (M) Blood_Request
-- Blood_Bank (1) → (M) Blood_Request
-- ==============================
CREATE TABLE IF NOT EXISTS blood_request (
    request_id INT NOT NULL AUTO_INCREMENT,
    hospital_id INT,
    patient_id INT,
    bank_id INT,
    request_date DATE,
    units_required INT,
    status VARCHAR(20),
    PRIMARY KEY (request_id),
    FOREIGN KEY (hospital_id) REFERENCES hospital(hospital_id),
    FOREIGN KEY (patient_id) REFERENCES patient(patient_id),
    FOREIGN KEY (bank_id) REFERENCES blood_bank(bank_id)
);

-- ==============================
-- 9. BLOOD ISSUE
-- Blood_Request (1) → (M) Blood_Issue
-- ==============================
CREATE TABLE IF NOT EXISTS blood_issue (
    issue_id INT NOT NULL AUTO_INCREMENT,
    request_id INT,
    issue_date DATE,
    units_issued INT,
    PRIMARY KEY (issue_id),
    FOREIGN KEY (request_id) REFERENCES blood_request(request_id)
);

-- ==============================
-- 10. PAYMENT
-- Blood_Request (1) → (M) Payment
-- Hospital (1) → (M) Payment
-- Blood_Bank (1) → (M) Payment
-- ==============================
CREATE TABLE IF NOT EXISTS payment (
    payment_id INT NOT NULL AUTO_INCREMENT,
    request_id INT,
    hospital_id INT,
    bank_id INT,
    payment_date DATE,
    amount DECIMAL(10,2),
    payment_status VARCHAR(20),
    PRIMARY KEY (payment_id),
    FOREIGN KEY (request_id) REFERENCES blood_request(request_id),
    FOREIGN KEY (hospital_id) REFERENCES hospital(hospital_id),
    FOREIGN KEY (bank_id) REFERENCES blood_bank(bank_id)
);

-- Insert Sample Data Only if Not Exists (Simple approach: just insert and ignore errors or carefully insert)
-- Using INSERT IGNORE for idempotency
INSERT IGNORE INTO blood_bank (bank_id, bank_name, city, contact_no) VALUES (1, 'Kerala Central Blood Bank', 'Trivandrum', '9876543210'); 
INSERT IGNORE INTO blood_stock (stock_id, bank_id, blood_group, available_units, last_updated) VALUES (1, 1, 'O+', 50, '2026-03-02'); 
INSERT IGNORE INTO donor (donor_id, name, age, gender, phone_no, blood_group, last_donation_date, city, status) VALUES (1, 'Arun Kumar', 27, 'Male', '8888888888', 'O+', '2025-01-09', 'Kochi', 'inactive'); 
INSERT IGNORE INTO health_check (check_id, donor_id, check_date, weight, blood_pressure, hemoglobin, eligibility_status) VALUES (1, 1, '2025-03-01', 70, '120/80', 14.5, 'Eligible'); 
INSERT IGNORE INTO donation_record (donation_id, donor_id, check_id, bank_id, donation_date, quantity) VALUES (1, 1, 1, 1, '2024-06-10', 450); 
INSERT IGNORE INTO hospital (hospital_id, hospital_name, city, contact_no) VALUES (1, 'KIMS Hospital', 'Trivandrum', '9998887776');
INSERT IGNORE INTO patient (patient_id, hospital_id, name, age, gender, blood_group) VALUES (1, 1, 'Suresh Kumar', 45, 'Male', 'B-');
INSERT IGNORE INTO blood_request (request_id, hospital_id, patient_id, bank_id, request_date, units_required, status) VALUES (1, 1, 1, 1, CURDATE(), 2, 'Pending');
