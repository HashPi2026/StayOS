BEGIN;

-- Enrich guest table with full profile fields shown in the frontend UI
ALTER TABLE guest ADD COLUMN IF NOT EXISTS guest_code VARCHAR(50);
ALTER TABLE guest ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT FALSE;
ALTER TABLE guest ADD COLUMN IF NOT EXISTS vip_tier VARCHAR(50);
ALTER TABLE guest ADD COLUMN IF NOT EXISTS total_stays INTEGER DEFAULT 0;
ALTER TABLE guest ADD COLUMN IF NOT EXISTS total_nights INTEGER DEFAULT 0;
ALTER TABLE guest ADD COLUMN IF NOT EXISTS total_spend NUMERIC(12,2) DEFAULT 0;
ALTER TABLE guest ADD COLUMN IF NOT EXISTS last_visit VARCHAR(50);
ALTER TABLE guest ADD COLUMN IF NOT EXISTS last_room VARCHAR(50);
ALTER TABLE guest ADD COLUMN IF NOT EXISTS in_house BOOLEAN DEFAULT FALSE;
ALTER TABLE guest ADD COLUMN IF NOT EXISTS created_date VARCHAR(50);

-- Enrich guest_contact
ALTER TABLE guest_contact ALTER COLUMN contact_type TYPE VARCHAR(50);
ALTER TABLE guest_contact ALTER COLUMN address_type TYPE VARCHAR(50);
ALTER TABLE guest_contact ADD COLUMN IF NOT EXISTS folio_dispatch BOOLEAN DEFAULT FALSE;
ALTER TABLE guest_contact ADD COLUMN IF NOT EXISTS country_code VARCHAR(10);

-- Enrich guest_document
ALTER TABLE guest_document ADD COLUMN IF NOT EXISTS is_ocr_verified BOOLEAN DEFAULT FALSE;

-- Enrich contact & contact_category for commercial directory
ALTER TABLE contact_detail ALTER COLUMN contact_type TYPE VARCHAR(50);
ALTER TABLE contact_detail ALTER COLUMN address_type TYPE VARCHAR(50);
ALTER TABLE contact_category ADD COLUMN IF NOT EXISTS short_name VARCHAR(50);
ALTER TABLE contact_category ADD COLUMN IF NOT EXISTS color_code VARCHAR(30);
ALTER TABLE contact_category ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE contact ADD COLUMN IF NOT EXISTS designation VARCHAR(100);
ALTER TABLE contact ADD COLUMN IF NOT EXISTS tax_pin VARCHAR(50);
ALTER TABLE contact ADD COLUMN IF NOT EXISTS account_manager VARCHAR(100);
ALTER TABLE contact ADD COLUMN IF NOT EXISTS contract_status VARCHAR(50);
ALTER TABLE contact ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

ALTER TABLE contact_document ADD COLUMN IF NOT EXISTS valid_till DATE;
ALTER TABLE contact_document ADD COLUMN IF NOT EXISTS status VARCHAR(50);
ALTER TABLE contact_document ADD COLUMN IF NOT EXISTS file_attachment_name VARCHAR(255);

-- Enrich lost_found_item
ALTER TABLE lost_found_item ADD COLUMN IF NOT EXISTS item_code VARCHAR(50);
ALTER TABLE lost_found_item ADD COLUMN IF NOT EXISTS category_name VARCHAR(100);
ALTER TABLE lost_found_item ADD COLUMN IF NOT EXISTS color_hex VARCHAR(20);
ALTER TABLE lost_found_item ADD COLUMN IF NOT EXISTS characteristics TEXT;
ALTER TABLE lost_found_item ADD COLUMN IF NOT EXISTS serial_number VARCHAR(100);
ALTER TABLE lost_found_item ADD COLUMN IF NOT EXISTS storage_vault VARCHAR(100);
ALTER TABLE lost_found_item ADD COLUMN IF NOT EXISTS custody_notes TEXT;
ALTER TABLE lost_found_item ADD COLUMN IF NOT EXISTS retention_days_remaining INTEGER DEFAULT 90;
ALTER TABLE lost_found_item ADD COLUMN IF NOT EXISTS disposition_status VARCHAR(50) DEFAULT 'open';

COMMIT;
