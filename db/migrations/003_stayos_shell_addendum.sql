-- =====================================================================
-- StayOS PMS — Main PMS Shell — Addendum Migration
-- Adds module_registry + role_module_access to support sidebar navigation
-- and role-based menu visibility. Run AFTER stayos_configuration_migration.sql
-- since role_module_access references role_privilege(role_id).
-- =====================================================================

BEGIN;

-- Application-level constant table: one row per top-level PMS module.
-- Not tenant-scoped (no client_id) — this is the same 11-module list for every
-- property. is_built is flipped by an engineer once a module actually ships.
CREATE TABLE module_registry (
    module_key      VARCHAR(30) PRIMARY KEY,
    display_name    VARCHAR(50) NOT NULL,
    icon_key        VARCHAR(50),
    sort_order      INTEGER NOT NULL,
    is_built        BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO module_registry (module_key, display_name, icon_key, sort_order, is_built) VALUES
    ('dashboard',          'Dashboard',          'layout-dashboard', 1, FALSE),
    ('reservation',        'Reservation',        'calendar-check',   2, FALSE),
    ('front_desk',         'Front Desk',         'concierge-bell',   3, FALSE),
    ('rate_availability',  'Rate & Availability','tags',             4, FALSE),
    ('audit',              'Audit',              'clipboard-list',   5, FALSE),
    ('business_channels',  'Business Channels',  'share-2',          6, FALSE),
    ('guest',              'Guest',              'users',            7, FALSE),
    ('housekeeping',       'Housekeeping',       'broom',            8, FALSE),
    ('utility',            'Utility',            'wrench',           9, FALSE),
    ('reports',            'Reports',            'bar-chart-2',     10, FALSE),
    ('configuration',      'Configuration',      'settings',        11, TRUE);
    -- Configuration is_built = TRUE: it's the one module already live
    -- (as a separate app). Flip the others to TRUE as each ships.

-- Role -> Module visibility. Deny-by-default: a role with no row for a given
-- module_key is treated as locked/hidden, not visible (see Backend Workflow doc).
CREATE TABLE role_module_access (
    role_id      INTEGER NOT NULL REFERENCES role_privilege(role_id),
    module_key   VARCHAR(30) NOT NULL REFERENCES module_registry(module_key),
    PRIMARY KEY (role_id, module_key)
);

-- Note: no default rows inserted here — access per role is a property-specific
-- decision made by the Owner/Admin once roles exist (role_privilege is itself
-- tenant-scoped, created per property, not seeded globally).

COMMIT;

-- =====================================================================
-- End of Main PMS Shell addendum (2 tables).
-- =====================================================================
