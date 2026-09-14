-- =====================================================================
-- StayOS PMS — Guest Module — PostgreSQL Migration
-- 8 tables: guest, guest_contact, guest_document, contact_category,
-- contact, contact_detail, contact_document, lost_found_item.
-- Run AFTER stayos_configuration_migration.sql — references property,
-- document_type, building, floor, room from that migration.
-- =====================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS guest (
    guest_id      SERIAL PRIMARY KEY,
    client_id     VARCHAR(50) NOT NULL REFERENCES property(client_id),
    title         VARCHAR(20),
    first_name    VARCHAR(50) NOT NULL,
    middle_name   VARCHAR(50),
    last_name     VARCHAR(50) NOT NULL,
    suffix        VARCHAR(20),
    birth_date    DATE,
    gender        VARCHAR(10),
    nationality   VARCHAR(50),
    company       VARCHAR(100),
    designation   VARCHAR(50),
    department    VARCHAR(50),
    guest_remark  TEXT,
    dnr_status    VARCHAR(20) NOT NULL DEFAULT 'No',
    dnr_reason    TEXT,
    CONSTRAINT chk_guest_dnr_status CHECK (dnr_status IN ('No', 'Yes Warning', 'Yes')),
    CONSTRAINT chk_guest_dnr_reason CHECK (dnr_status = 'No' OR dnr_reason IS NOT NULL)
);

-- No direct client_id — scoped via the parent guest row.
CREATE TABLE IF NOT EXISTS guest_contact (
    guest_contact_id  SERIAL PRIMARY KEY,
    guest_id          INTEGER NOT NULL REFERENCES guest(guest_id) ON DELETE CASCADE,
    contact_type      VARCHAR(20),
    is_primary        BOOLEAN NOT NULL DEFAULT FALSE,
    phone_number      VARCHAR(20),
    email_address     VARCHAR(100),
    address_type      VARCHAR(20),
    address           VARCHAR(255),
    city              VARCHAR(50),
    state             VARCHAR(50),
    zip_code          VARCHAR(20),
    country           VARCHAR(50)
);
CREATE INDEX IF NOT EXISTS idx_guest_contact_guest_id ON guest_contact(guest_id);

-- No direct client_id — scoped via the parent guest row.
CREATE TABLE IF NOT EXISTS guest_document (
    guest_document_id  SERIAL PRIMARY KEY,
    guest_id           INTEGER NOT NULL REFERENCES guest(guest_id) ON DELETE CASCADE,
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
    back_image         VARCHAR(255)
);
CREATE INDEX IF NOT EXISTS idx_guest_document_guest_id ON guest_document(guest_id);

CREATE TABLE IF NOT EXISTS contact_category (
    contact_category_id  SERIAL PRIMARY KEY,
    client_id             VARCHAR(50) NOT NULL REFERENCES property(client_id),
    category_name         VARCHAR(50) NOT NULL,
    CONSTRAINT uq_contact_category_name UNIQUE (client_id, category_name)
);

CREATE TABLE IF NOT EXISTS contact (
    contact_id            SERIAL PRIMARY KEY,
    client_id             VARCHAR(50) NOT NULL REFERENCES property(client_id),
    contact_category_id   INTEGER NOT NULL REFERENCES contact_category(contact_category_id),
    full_name             VARCHAR(100) NOT NULL,
    birth_date            DATE,
    company               VARCHAR(100)
);

-- No direct client_id — scoped via the parent contact row.
CREATE TABLE IF NOT EXISTS contact_detail (
    contact_detail_id  SERIAL PRIMARY KEY,
    contact_id         INTEGER NOT NULL REFERENCES contact(contact_id) ON DELETE CASCADE,
    contact_type       VARCHAR(20),
    is_primary         BOOLEAN NOT NULL DEFAULT FALSE,
    phone_number       VARCHAR(20),
    email_address      VARCHAR(100),
    address_type       VARCHAR(20),
    address            VARCHAR(255),
    city               VARCHAR(50),
    state              VARCHAR(50),
    zip_code           VARCHAR(20),
    country            VARCHAR(50)
);
CREATE INDEX IF NOT EXISTS idx_contact_detail_contact_id ON contact_detail(contact_id);

-- No direct client_id — scoped via the parent contact row.
CREATE TABLE IF NOT EXISTS contact_document (
    contact_document_id  SERIAL PRIMARY KEY,
    contact_id           INTEGER NOT NULL REFERENCES contact(contact_id) ON DELETE CASCADE,
    document_type_id     INTEGER NOT NULL REFERENCES document_type(document_type_id),
    document_number      VARCHAR(50)
);
CREATE INDEX IF NOT EXISTS idx_contact_document_contact_id ON contact_document(contact_id);

CREATE TABLE IF NOT EXISTS lost_found_item (
    lost_found_id         SERIAL PRIMARY KEY,
    client_id             VARCHAR(50) NOT NULL REFERENCES property(client_id),
    record_type           VARCHAR(10) NOT NULL,
    item_name              VARCHAR(50) NOT NULL,
    color                  VARCHAR(30),
    location_description   VARCHAR(100),
    item_value             NUMERIC(10,2),
    building_id            INTEGER REFERENCES building(building_id),
    floor_id               INTEGER REFERENCES floor(floor_id),
    room_id                INTEGER REFERENCES room(room_id),
    current_location        VARCHAR(100),
    who_found               VARCHAR(50),
    reported_by_name        VARCHAR(100),
    reported_by_address     VARCHAR(255),
    reported_by_city        VARCHAR(50),
    reported_by_state       VARCHAR(50),
    reported_by_zip         VARCHAR(20),
    reported_by_country     VARCHAR(50),
    reported_by_phone       VARCHAR(20),
    resolution_type         VARCHAR(20),
    resolved_by             VARCHAR(100),
    return_date             DATE,
    discard_date            DATE,
    date_entry              DATE NOT NULL DEFAULT CURRENT_DATE,
    CONSTRAINT chk_lost_found_record_type CHECK (record_type IN ('Lost', 'Found')),
    CONSTRAINT chk_lost_found_resolution_type CHECK (resolution_type IS NULL OR resolution_type IN ('Returned', 'Discarded')),
    CONSTRAINT chk_lost_found_resolution_fields CHECK (
        (resolution_type IS NULL AND resolved_by IS NULL)
        OR (resolution_type = 'Returned' AND resolved_by IS NOT NULL AND return_date IS NOT NULL)
        OR (resolution_type = 'Discarded' AND resolved_by IS NOT NULL AND discard_date IS NOT NULL)
    )
);

-- Update module_registry so Guest module is marked as built
UPDATE module_registry
SET is_built = TRUE
WHERE module_key = 'guest';

COMMIT;
