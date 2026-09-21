-- =====================================================================
-- StayOS PMS — Rate & Availability Module — PostgreSQL Migration
-- Generated from authoritative schema and stayos_rate_availability_migration.txt
-- =====================================================================

BEGIN;

-- Pattern A singleton: Flash screen's left-sidebar toggle preferences only.
-- The Flash grid itself (Total Room, CRS(n), Rate, V/Maint Room, Occupancy %)
-- is computed live from room, room_type, room_status, room_rate (and
-- reservation once that module exists) — there is no table for the grid data.
CREATE TABLE IF NOT EXISTS flash_view_settings (
    flash_view_setting_id  SERIAL PRIMARY KEY,
    client_id              VARCHAR(50) NOT NULL UNIQUE REFERENCES property(client_id),
    show_tooltip            BOOLEAN NOT NULL DEFAULT TRUE,
    show_rate               BOOLEAN NOT NULL DEFAULT TRUE,
    show_occupancy          BOOLEAN NOT NULL DEFAULT TRUE,
    show_crs_inventory      BOOLEAN NOT NULL DEFAULT TRUE,
    show_v_maint_room       BOOLEAN NOT NULL DEFAULT TRUE,
    show_chart              BOOLEAN NOT NULL DEFAULT TRUE
);

-- Property-wide, date-indexed forecast cache. No room_type_id column —
-- per-room-type forecasting is computed on demand from room_rate + room,
-- not stored here. Populated by a scheduled job (see Backend Workflow doc).
CREATE TABLE IF NOT EXISTS forecast (
    forecast_id             SERIAL PRIMARY KEY,
    client_id               VARCHAR(50) NOT NULL REFERENCES property(client_id),
    forecast_date           DATE NOT NULL,
    available_rooms         INTEGER,
    total_rooms             INTEGER,
    vacant_maint_rooms      INTEGER,
    stay_over_count         INTEGER,
    expected_checkin_count  INTEGER,
    expected_checkout_count INTEGER,
    expected_inhouse_count  INTEGER,
    room_revenue            NUMERIC(12,2),
    rooms_sold              INTEGER,
    occupancy_pct           NUMERIC(5,2),
    adr                     NUMERIC(10,2),
    CONSTRAINT uq_forecast_date UNIQUE (client_id, forecast_date)
);

-- The editable Rate screen grid + Flash's "Rate" sub-row.
-- No room_type_binding table: the Rate screen's binding action is a
-- one-time bulk-copy at write time (see Backend Workflow doc), not a
-- persisted derivation rule between two room types.
CREATE TABLE IF NOT EXISTS room_rate (
    room_rate_id     SERIAL PRIMARY KEY,
    client_id        VARCHAR(50) NOT NULL REFERENCES property(client_id),
    rate_type_id     INTEGER NOT NULL REFERENCES rate_type(rate_type_id),
    room_type_id     INTEGER NOT NULL REFERENCES room_type(room_type_id),
    occupancy_type   VARCHAR(20) NOT NULL,
    occupancy_count  INTEGER,
    rate_date        DATE NOT NULL,
    rate_amount      NUMERIC(10,2) NOT NULL CHECK (rate_amount >= 0),
    CONSTRAINT uq_room_rate UNIQUE (client_id, rate_type_id, room_type_id, occupancy_type, rate_date),
    CONSTRAINT chk_room_rate_occupancy_type CHECK (occupancy_type IN ('Base','Adult','Child','Pet'))
);

-- The Restriction screen grid.
CREATE TABLE IF NOT EXISTS room_type_restriction (
    room_type_restriction_id  SERIAL PRIMARY KEY,
    client_id                 VARCHAR(50) NOT NULL REFERENCES property(client_id),
    rate_type_id              INTEGER NOT NULL REFERENCES rate_type(rate_type_id),
    room_type_id               INTEGER NOT NULL REFERENCES room_type(room_type_id),
    restriction_date          DATE NOT NULL,
    close_to_arrival          BOOLEAN NOT NULL DEFAULT FALSE,
    close_to_departure        BOOLEAN NOT NULL DEFAULT FALSE,
    sold_out                  BOOLEAN NOT NULL DEFAULT FALSE,
    minimum_nights            INTEGER,
    maximum_nights            INTEGER,
    CONSTRAINT uq_room_type_restriction UNIQUE (client_id, rate_type_id, room_type_id, restriction_date),
    CONSTRAINT chk_restriction_nights CHECK (
        minimum_nights IS NULL OR maximum_nights IS NULL OR minimum_nights <= maximum_nights
    )
);

-- Ensure default flash_view_settings row for existing properties
INSERT INTO flash_view_settings (client_id)
SELECT client_id FROM property
ON CONFLICT (client_id) DO NOTHING;

-- Extend fn_provision_property_singleton_settings_for_client to include flash_view_settings
CREATE OR REPLACE FUNCTION fn_provision_property_singleton_settings_for_client(p_client_id VARCHAR(50))
RETURNS VOID AS $$
BEGIN
    INSERT INTO general_setting_rental (client_id) VALUES (p_client_id) ON CONFLICT (client_id) DO NOTHING;
    INSERT INTO general_setting_feature (client_id) VALUES (p_client_id) ON CONFLICT (client_id) DO NOTHING;
    INSERT INTO general_setting_night_audit (client_id) VALUES (p_client_id) ON CONFLICT (client_id) DO NOTHING;
    INSERT INTO general_setting_localization (client_id) VALUES (p_client_id) ON CONFLICT (client_id) DO NOTHING;
    INSERT INTO general_setting_display (client_id) VALUES (p_client_id) ON CONFLICT (client_id) DO NOTHING;
    INSERT INTO general_setting_folio (client_id) VALUES (p_client_id) ON CONFLICT (client_id) DO NOTHING;
    INSERT INTO general_setting_credit_card (client_id) VALUES (p_client_id) ON CONFLICT (client_id) DO NOTHING;
    INSERT INTO general_setting_email (client_id) VALUES (p_client_id) ON CONFLICT (client_id) DO NOTHING;
    INSERT INTO guest_mandatory_data (client_id) VALUES (p_client_id) ON CONFLICT (client_id) DO NOTHING;
    INSERT INTO listview_setting (client_id) VALUES (p_client_id) ON CONFLICT (client_id) DO NOTHING;
    INSERT INTO flash_view_settings (client_id) VALUES (p_client_id) ON CONFLICT (client_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Mark module_registry.is_built = TRUE for rate_availability
UPDATE module_registry
SET is_built = TRUE
WHERE module_key = 'rate_availability';

COMMIT;
