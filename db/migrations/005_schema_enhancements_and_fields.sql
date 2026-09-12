-- =====================================================================
-- StayOS PMS — Migration 005: Schema Enhancements & Field Modernization
-- Adds comprehensive schema updates to existing tables and introduces
-- hotel policies, guest categories, audit logs, and notification tables
-- fully aligned with SaaS Multi-Tenancy and CAP Theorem specifications.
-- =====================================================================

BEGIN;

-- 1. PROPERTY MASTER: Expand column widths & add SaaS/CAP/Location fields
ALTER TABLE property ALTER COLUMN property_name TYPE VARCHAR(255);
ALTER TABLE property ALTER COLUMN address TYPE VARCHAR(255);
ALTER TABLE property ALTER COLUMN url TYPE VARCHAR(255);
ALTER TABLE property ALTER COLUMN city TYPE VARCHAR(100);
ALTER TABLE property ALTER COLUMN state TYPE VARCHAR(100);

ALTER TABLE property ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'United States';
ALTER TABLE property ADD COLUMN IF NOT EXISTS postal_code VARCHAR(50);
ALTER TABLE property ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE property ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE property ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USD';
ALTER TABLE property ADD COLUMN IF NOT EXISTS currency_symbol VARCHAR(10) DEFAULT '$';
ALTER TABLE property ADD COLUMN IF NOT EXISTS star_rating NUMERIC(2,1) DEFAULT 4.5;
ALTER TABLE property ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'operational';

-- Multi-Tenancy Subscription & CAP Theorem fields
ALTER TABLE property ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'Pro';
ALTER TABLE property ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'active';
ALTER TABLE property ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(50) DEFAULT 'monthly';
ALTER TABLE property ADD COLUMN IF NOT EXISTS max_rooms INTEGER DEFAULT 150;
ALTER TABLE property ADD COLUMN IF NOT EXISTS cap_theorem_model VARCHAR(20) DEFAULT 'CP';
ALTER TABLE property ADD COLUMN IF NOT EXISTS isolation_level VARCHAR(100) DEFAULT 'database_and_storage_partition';
ALTER TABLE property ADD COLUMN IF NOT EXISTS active_cluster_node VARCHAR(100) DEFAULT 'cluster-node-partition-01';
ALTER TABLE property ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE property ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;


-- 2. BUILDING: Expand name length, add status and room/floor tallies
ALTER TABLE building ALTER COLUMN building_name TYPE VARCHAR(150);
ALTER TABLE building ADD COLUMN IF NOT EXISTS code VARCHAR(50);
ALTER TABLE building ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
ALTER TABLE building ADD COLUMN IF NOT EXISTS total_floors INTEGER DEFAULT 1;
ALTER TABLE building ADD COLUMN IF NOT EXISTS total_rooms INTEGER DEFAULT 0;
ALTER TABLE building ADD COLUMN IF NOT EXISTS has_active_rooms BOOLEAN DEFAULT TRUE;
ALTER TABLE building ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE building ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;


-- 3. FLOOR: Expand floor name, add floor number, status, and room count
ALTER TABLE floor ALTER COLUMN floor_name TYPE VARCHAR(100);
ALTER TABLE floor ADD COLUMN IF NOT EXISTS floor_number INTEGER;
ALTER TABLE floor ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
ALTER TABLE floor ADD COLUMN IF NOT EXISTS total_rooms INTEGER DEFAULT 0;
ALTER TABLE floor ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE floor ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;


-- 4. ROOM TYPE: Add category, rates, capacity, bed info, physical dimensions
ALTER TABLE room_type ALTER COLUMN room_type_name TYPE VARCHAR(150);
ALTER TABLE room_type ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'Standard';
ALTER TABLE room_type ADD COLUMN IF NOT EXISTS base_rate NUMERIC(10,2) DEFAULT 0.00;
ALTER TABLE room_type ADD COLUMN IF NOT EXISTS extra_adult_rate NUMERIC(10,2) DEFAULT 0.00;
ALTER TABLE room_type ADD COLUMN IF NOT EXISTS extra_child_rate NUMERIC(10,2) DEFAULT 0.00;
ALTER TABLE room_type ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT 2;
ALTER TABLE room_type ADD COLUMN IF NOT EXISTS max_adults INTEGER DEFAULT 2;
ALTER TABLE room_type ADD COLUMN IF NOT EXISTS max_children INTEGER DEFAULT 1;
ALTER TABLE room_type ADD COLUMN IF NOT EXISTS bed_type VARCHAR(100) DEFAULT 'King Bed';
ALTER TABLE room_type ADD COLUMN IF NOT EXISTS bed_count INTEGER DEFAULT 1;
ALTER TABLE room_type ADD COLUMN IF NOT EXISTS extra_bed_allowed BOOLEAN DEFAULT FALSE;
ALTER TABLE room_type ADD COLUMN IF NOT EXISTS max_extra_beds INTEGER DEFAULT 0;
ALTER TABLE room_type ADD COLUMN IF NOT EXISTS size_sqm NUMERIC(8,2);
ALTER TABLE room_type ADD COLUMN IF NOT EXISTS size_sqft NUMERIC(8,2);
ALTER TABLE room_type ADD COLUMN IF NOT EXISTS view_type VARCHAR(100);
ALTER TABLE room_type ADD COLUMN IF NOT EXISTS smoking_policy VARCHAR(50) DEFAULT 'non-smoking';
ALTER TABLE room_type ADD COLUMN IF NOT EXISTS is_accessible BOOLEAN DEFAULT FALSE;
ALTER TABLE room_type ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
ALTER TABLE room_type ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE room_type ADD COLUMN IF NOT EXISTS amenities TEXT[];
ALTER TABLE room_type ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE room_type ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;


-- 5. ROOM: Add room number, status, nightly rate, timestamps
ALTER TABLE room ALTER COLUMN room_name TYPE VARCHAR(100);
ALTER TABLE room ADD COLUMN IF NOT EXISTS room_number VARCHAR(50);
ALTER TABLE room ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'available';
ALTER TABLE room ADD COLUMN IF NOT EXISTS rate NUMERIC(10,2) DEFAULT 0.00;
ALTER TABLE room ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE room ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;


-- 6. TAX: Expand name, add code, calculation strategies, and effective date
ALTER TABLE tax ALTER COLUMN tax_name TYPE VARCHAR(150);
ALTER TABLE tax ADD COLUMN IF NOT EXISTS code VARCHAR(50);
ALTER TABLE tax ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE tax ADD COLUMN IF NOT EXISTS rule_type VARCHAR(50) DEFAULT 'percentage';
ALTER TABLE tax ADD COLUMN IF NOT EXISTS tax_value NUMERIC(10,2) DEFAULT 0.00;
ALTER TABLE tax ADD COLUMN IF NOT EXISTS rate_percentage NUMERIC(5,2) DEFAULT 0.00;
ALTER TABLE tax ADD COLUMN IF NOT EXISTS application_method VARCHAR(50) DEFAULT 'per_night';
ALTER TABLE tax ADD COLUMN IF NOT EXISTS calculation_strategy VARCHAR(50) DEFAULT 'percentage';
ALTER TABLE tax ADD COLUMN IF NOT EXISTS jurisdiction VARCHAR(100);
ALTER TABLE tax ADD COLUMN IF NOT EXISTS effective_date DATE;
ALTER TABLE tax ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE tax ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;


-- 7. RATE TYPE: Add code, status, market code, meal plan
ALTER TABLE rate_type ADD COLUMN IF NOT EXISTS code VARCHAR(50);
ALTER TABLE rate_type ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE rate_type ADD COLUMN IF NOT EXISTS market_code VARCHAR(50);
ALTER TABLE rate_type ADD COLUMN IF NOT EXISTS meal_plan VARCHAR(50);
ALTER TABLE rate_type ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE rate_type ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;


-- 8. HOTEL POLICIES TABLE
CREATE TABLE IF NOT EXISTS hotel_policy (
    policy_id           VARCHAR(64) PRIMARY KEY,
    client_id           VARCHAR(50) NOT NULL REFERENCES property(client_id),
    title               VARCHAR(150) NOT NULL,
    category            VARCHAR(50) NOT NULL,
    description         TEXT,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_hotel_policy_client ON hotel_policy(client_id);


-- 9. GUEST CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS guest_category (
    category_id         VARCHAR(64) PRIMARY KEY,
    client_id           VARCHAR(50) NOT NULL REFERENCES property(client_id),
    name                VARCHAR(100) NOT NULL,
    code                VARCHAR(50) NOT NULL,
    discount_percent    NUMERIC(5,2) DEFAULT 0,
    description         TEXT,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_guest_category_client ON guest_category(client_id);


-- 10. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_log (
    log_id              VARCHAR(64) PRIMARY KEY,
    client_id           VARCHAR(50) NOT NULL REFERENCES property(client_id),
    timestamp           TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    user_name           VARCHAR(100) NOT NULL,
    action              VARCHAR(100) NOT NULL,
    module              VARCHAR(100) NOT NULL,
    details             TEXT,
    ip_address          VARCHAR(50)
);
CREATE INDEX IF NOT EXISTS idx_audit_log_client ON audit_log(client_id);


-- 11. NOTIFICATION ITEMS TABLE
CREATE TABLE IF NOT EXISTS notification_item (
    notification_id     VARCHAR(64) PRIMARY KEY,
    client_id           VARCHAR(50) NOT NULL REFERENCES property(client_id),
    title               VARCHAR(150) NOT NULL,
    message             TEXT NOT NULL,
    timestamp           TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    type                VARCHAR(50) DEFAULT 'info',
    is_read             BOOLEAN DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_notification_item_client ON notification_item(client_id);

COMMIT;
