-- =====================================================================
-- StayOS PMS — Reservation Module — PostgreSQL Migration
-- 9 tables: "group", group_contact, group_document, reservation,
-- reservation_rental_detail, reservation_guest, reservation_other_charge,
-- reservation_payment, reservation_vehicle.
-- References: property, building, floor, room_type, room, rate_type,
-- other_charges_category, other_charges, payment_type, document_type,
-- app_user, and guest.
-- =====================================================================

BEGIN;

-- 1. "group" (quoted because GROUP is a SQL keyword)
CREATE TABLE IF NOT EXISTS "group" (
    group_id                      SERIAL PRIMARY KEY,
    client_id                     INTEGER NOT NULL REFERENCES property(client_id) ON DELETE CASCADE,
    group_name                    VARCHAR(100) NOT NULL,
    full_name                     VARCHAR(100),
    company                       VARCHAR(100),
    group_remark                  TEXT,
    check_in_date                 DATE,
    check_in_time                 TIME,
    check_out_date                DATE,
    check_out_time                TIME,
    no_of_days                    INTEGER,
    business_source_category_id   INTEGER,
    expiry_date                   DATE,
    created_at                    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_group_client_id ON "group"(client_id);

-- 2. group_contact
CREATE TABLE IF NOT EXISTS group_contact (
    group_contact_id  SERIAL PRIMARY KEY,
    group_id          INTEGER NOT NULL REFERENCES "group"(group_id) ON DELETE CASCADE,
    contact_type      VARCHAR(20),
    is_primary        BOOLEAN NOT NULL DEFAULT FALSE,
    phone_number      VARCHAR(20),
    email_address     VARCHAR(100),
    address_type      VARCHAR(20),
    address           VARCHAR(255),
    city              VARCHAR(50),
    state             VARCHAR(50),
    zip_code          VARCHAR(20),
    country           VARCHAR(50),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_group_contact_group_id ON group_contact(group_id);

-- 3. group_document
CREATE TABLE IF NOT EXISTS group_document (
    group_document_id  SERIAL PRIMARY KEY,
    group_id           INTEGER NOT NULL REFERENCES "group"(group_id) ON DELETE CASCADE,
    document_type_id   INTEGER NOT NULL REFERENCES document_type(document_type_id),
    document_number    VARCHAR(50),
    valid_till         DATE,
    name_on_document   VARCHAR(100),
    issued_by          VARCHAR(100),
    issue_place        VARCHAR(100),
    is_primary         BOOLEAN NOT NULL DEFAULT FALSE,
    address            VARCHAR(255),
    city               VARCHAR(50),
    state              VARCHAR(50),
    zip_code           VARCHAR(20),
    country            VARCHAR(50),
    remark             TEXT,
    front_image        VARCHAR(255),
    back_image         VARCHAR(255),
    created_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_group_document_group_id ON group_document(group_id);

-- 4. reservation (ensure full schema matches ER diagram)
CREATE TABLE IF NOT EXISTS reservation (
    reservation_id      SERIAL PRIMARY KEY,
    client_id           INTEGER NOT NULL REFERENCES property(client_id) ON DELETE CASCADE,
    booking_number      VARCHAR(50),
    check_in_date       DATE NOT NULL,
    check_out_date      DATE NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'Provisional'
);

ALTER TABLE reservation
    ADD COLUMN IF NOT EXISTS group_id INTEGER REFERENCES "group"(group_id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS folio_number VARCHAR(50),
    ADD COLUMN IF NOT EXISTS reservation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    ADD COLUMN IF NOT EXISTS crs_folio_number VARCHAR(50),
    ADD COLUMN IF NOT EXISTS revenue_posted BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS non_refundable BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS prepaid BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS check_in_time TIME DEFAULT '14:00',
    ADD COLUMN IF NOT EXISTS check_out_time TIME DEFAULT '11:00',
    ADD COLUMN IF NOT EXISTS no_of_days INTEGER,
    ADD COLUMN IF NOT EXISTS business_source_category_id INTEGER,
    ADD COLUMN IF NOT EXISTS building_id INTEGER REFERENCES building(building_id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS floor_id INTEGER REFERENCES floor(floor_id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS room_type_id INTEGER REFERENCES room_type(room_type_id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS room_id INTEGER REFERENCES room(room_id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS no_of_adults INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS no_of_children INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS rate_type_id INTEGER REFERENCES rate_type(rate_type_id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS rent NUMERIC(10,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_rent NUMERIC(10,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS tax NUMERIC(10,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_rental NUMERIC(10,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS other_charges NUMERIC(10,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS discount NUMERIC(10,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_charges NUMERIC(10,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS payments NUMERIC(10,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS cc_authorized NUMERIC(10,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS deposit NUMERIC(10,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS balance NUMERIC(10,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS turndown_service_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS turndown_time TIME,
    ADD COLUMN IF NOT EXISTS turndown_remark TEXT;

-- Populate folio_number from booking_number if empty
UPDATE reservation 
SET folio_number = booking_number 
WHERE folio_number IS NULL AND booking_number IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reservation_client_id ON reservation(client_id);
CREATE INDEX IF NOT EXISTS idx_reservation_room_dates ON reservation(room_id, check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_reservation_group_id ON reservation(group_id);

-- 5. reservation_rental_detail
CREATE TABLE IF NOT EXISTS reservation_rental_detail (
    reservation_rental_detail_id  SERIAL PRIMARY KEY,
    reservation_id                INTEGER NOT NULL REFERENCES reservation(reservation_id) ON DELETE CASCADE,
    rental_date                   DATE NOT NULL,
    rate_type_id                  INTEGER NOT NULL REFERENCES rate_type(rate_type_id),
    rate                          NUMERIC(10,2) NOT NULL DEFAULT 0,
    occ_tax                       NUMERIC(10,2) DEFAULT 0,
    per_day                       NUMERIC(10,2) DEFAULT 0,
    per_stay                      NUMERIC(10,2) DEFAULT 0,
    total_tax                     NUMERIC(10,2) DEFAULT 0,
    total_amount                  NUMERIC(10,2) DEFAULT 0,
    disp_folio                    BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_reservation_rental_date UNIQUE (reservation_id, rental_date)
);
CREATE INDEX IF NOT EXISTS idx_rental_detail_reservation_id ON reservation_rental_detail(reservation_id);

-- 6. reservation_guest
CREATE TABLE IF NOT EXISTS reservation_guest (
    reservation_guest_id  SERIAL PRIMARY KEY,
    reservation_id        INTEGER NOT NULL REFERENCES reservation(reservation_id) ON DELETE CASCADE,
    guest_id              INTEGER NOT NULL REFERENCES guest(guest_id) ON DELETE CASCADE,
    is_primary            BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_reservation_guest_reservation_id ON reservation_guest(reservation_id);
CREATE INDEX IF NOT EXISTS idx_reservation_guest_guest_id ON reservation_guest(guest_id);

-- 7. reservation_other_charge
CREATE TABLE IF NOT EXISTS reservation_other_charge (
    reservation_other_charge_id  SERIAL PRIMARY KEY,
    reservation_id               INTEGER NOT NULL REFERENCES reservation(reservation_id) ON DELETE CASCADE,
    occ_id                       INTEGER NOT NULL REFERENCES other_charges_category(occ_id),
    oc_id                        INTEGER NOT NULL REFERENCES other_charges(oc_id),
    charge_date                  DATE NOT NULL,
    reoccur                      BOOLEAN NOT NULL DEFAULT FALSE,
    disp_on_folio                BOOLEAN NOT NULL DEFAULT TRUE,
    rate                         NUMERIC(10,2) NOT NULL DEFAULT 0,
    qty                          INTEGER NOT NULL DEFAULT 1,
    tax                          NUMERIC(10,2) DEFAULT 0,
    total                        NUMERIC(10,2) DEFAULT 0,
    voucher_number               VARCHAR(50),
    remark                       TEXT,
    desk_user_id                 INTEGER REFERENCES app_user(user_id)
);
CREATE INDEX IF NOT EXISTS idx_other_charge_reservation_id ON reservation_other_charge(reservation_id);

-- 8. reservation_payment
CREATE TABLE IF NOT EXISTS reservation_payment (
    reservation_payment_id  SERIAL PRIMARY KEY,
    reservation_id          INTEGER NOT NULL REFERENCES reservation(reservation_id) ON DELETE CASCADE,
    payment_type_id         INTEGER NOT NULL REFERENCES payment_type(payment_type_id),
    payer_type              VARCHAR(20) NOT NULL DEFAULT 'Room/Guest',
    business_source_id      INTEGER,
    terminal                VARCHAR(50),
    card_number             VARCHAR(50),
    card_type               VARCHAR(30),
    valid_till              DATE,
    authorize               BOOLEAN NOT NULL DEFAULT FALSE,
    auth_number             VARCHAR(50),
    payment_date            DATE NOT NULL DEFAULT CURRENT_DATE,
    receipt_number          VARCHAR(50),
    disp_on_folio           BOOLEAN NOT NULL DEFAULT TRUE,
    amount                  NUMERIC(10,2) NOT NULL DEFAULT 0,
    exchange_rate           NUMERIC(10,4) NOT NULL DEFAULT 1,
    total                   NUMERIC(10,2) DEFAULT 0,
    remark                  TEXT,
    desk_user_id            INTEGER REFERENCES app_user(user_id),
    CONSTRAINT chk_payer_type CHECK (payer_type IN ('Room/Guest', 'Business Source'))
);
CREATE INDEX IF NOT EXISTS idx_payment_reservation_id ON reservation_payment(reservation_id);

-- 9. reservation_vehicle
CREATE TABLE IF NOT EXISTS reservation_vehicle (
    reservation_vehicle_id  SERIAL PRIMARY KEY,
    reservation_id          INTEGER NOT NULL REFERENCES reservation(reservation_id) ON DELETE CASCADE,
    vehicle_make            VARCHAR(50),
    vehicle_model           VARCHAR(50),
    vehicle_year            VARCHAR(10),
    license                 VARCHAR(20),
    state                   VARCHAR(50)
);
CREATE INDEX IF NOT EXISTS idx_vehicle_reservation_id ON reservation_vehicle(reservation_id);

COMMIT;
