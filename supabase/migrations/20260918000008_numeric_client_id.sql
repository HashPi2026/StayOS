-- =====================================================================
-- Migration 008: Convert client_id to 5-digit Numeric Integer
-- =====================================================================
-- Maps DIS_001 -> 10001, STVMC_SURAT -> 10002
-- Alters client_id across all tables to INTEGER
-- Enforces 5-digit range (10000 to 99999) with sequence starting at 10003
-- =====================================================================

DO $$
BEGIN
    -- Only run if client_id in property is still character varying
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'property' 
          AND column_name = 'client_id' 
          AND data_type LIKE '%char%'
    ) THEN
        -- 1. Drop triggers and functions referencing old VARCHAR client_id
        DROP TRIGGER IF EXISTS trg_property_after_insert ON property;
        DROP FUNCTION IF EXISTS trg_fn_provision_property_singleton_settings();
        DROP FUNCTION IF EXISTS fn_provision_property_singleton_settings_for_client(VARCHAR);
        DROP FUNCTION IF EXISTS fn_provision_property_singleton_settings_for_client(INT);

        -- 2. Drop all foreign keys referencing property.client_id
        ALTER TABLE building DROP CONSTRAINT IF EXISTS building_client_id_fkey;
        ALTER TABLE floor DROP CONSTRAINT IF EXISTS floor_client_id_fkey;
        ALTER TABLE document_type DROP CONSTRAINT IF EXISTS document_type_client_id_fkey;
        ALTER TABLE room_type DROP CONSTRAINT IF EXISTS room_type_client_id_fkey;
        ALTER TABLE room DROP CONSTRAINT IF EXISTS room_client_id_fkey;
        ALTER TABLE room_status DROP CONSTRAINT IF EXISTS room_status_client_id_fkey;
        ALTER TABLE tax DROP CONSTRAINT IF EXISTS tax_client_id_fkey;
        ALTER TABLE tax_configuration DROP CONSTRAINT IF EXISTS tax_configuration_client_id_fkey;
        ALTER TABLE rate_type DROP CONSTRAINT IF EXISTS rate_type_client_id_fkey;
        ALTER TABLE other_charges_category DROP CONSTRAINT IF EXISTS other_charges_category_client_id_fkey;
        ALTER TABLE other_charges DROP CONSTRAINT IF EXISTS other_charges_client_id_fkey;
        ALTER TABLE measurement_unit DROP CONSTRAINT IF EXISTS measurement_unit_client_id_fkey;
        ALTER TABLE payment_type DROP CONSTRAINT IF EXISTS payment_type_client_id_fkey;
        ALTER TABLE exchange_rate DROP CONSTRAINT IF EXISTS exchange_rate_client_id_fkey;
        ALTER TABLE role_privilege DROP CONSTRAINT IF EXISTS role_privilege_client_id_fkey;
        ALTER TABLE app_user DROP CONSTRAINT IF EXISTS app_user_client_id_fkey;
        ALTER TABLE email_template DROP CONSTRAINT IF EXISTS email_template_client_id_fkey;
        ALTER TABLE policy DROP CONSTRAINT IF EXISTS policy_client_id_fkey;
        ALTER TABLE guest_category DROP CONSTRAINT IF EXISTS guest_category_client_id_fkey;
        ALTER TABLE general_setting_rental DROP CONSTRAINT IF EXISTS general_setting_rental_client_id_fkey;
        ALTER TABLE general_setting_feature DROP CONSTRAINT IF EXISTS general_setting_feature_client_id_fkey;
        ALTER TABLE general_setting_night_audit DROP CONSTRAINT IF EXISTS general_setting_night_audit_client_id_fkey;
        ALTER TABLE general_setting_localization DROP CONSTRAINT IF EXISTS general_setting_localization_client_id_fkey;
        ALTER TABLE general_setting_display DROP CONSTRAINT IF EXISTS general_setting_display_client_id_fkey;
        ALTER TABLE general_setting_folio DROP CONSTRAINT IF EXISTS general_setting_folio_client_id_fkey;
        ALTER TABLE general_setting_credit_card DROP CONSTRAINT IF EXISTS general_setting_credit_card_client_id_fkey;
        ALTER TABLE general_setting_email DROP CONSTRAINT IF EXISTS general_setting_email_client_id_fkey;
        ALTER TABLE guest_mandatory_data DROP CONSTRAINT IF EXISTS guest_mandatory_data_client_id_fkey;
        ALTER TABLE listview_setting DROP CONSTRAINT IF EXISTS listview_setting_client_id_fkey;
        ALTER TABLE payment_gateway DROP CONSTRAINT IF EXISTS payment_gateway_client_id_fkey;
        ALTER TABLE doorlock DROP CONSTRAINT IF EXISTS doorlock_client_id_fkey;
        ALTER TABLE doorlock_terminal_mapping DROP CONSTRAINT IF EXISTS doorlock_terminal_mapping_client_id_fkey;
        ALTER TABLE scanner_configuration DROP CONSTRAINT IF EXISTS scanner_configuration_client_id_fkey;
        ALTER TABLE crs_tax_exempt DROP CONSTRAINT IF EXISTS crs_tax_exempt_client_id_fkey;
        ALTER TABLE hotel_policy DROP CONSTRAINT IF EXISTS hotel_policy_client_id_fkey;
        ALTER TABLE audit_log DROP CONSTRAINT IF EXISTS audit_log_client_id_fkey;
        ALTER TABLE notification_item DROP CONSTRAINT IF EXISTS notification_item_client_id_fkey;
        ALTER TABLE flash_view_settings DROP CONSTRAINT IF EXISTS flash_view_settings_client_id_fkey;
        ALTER TABLE forecast DROP CONSTRAINT IF EXISTS forecast_client_id_fkey;
        ALTER TABLE room_rate DROP CONSTRAINT IF EXISTS room_rate_client_id_fkey;
        ALTER TABLE room_type_restriction DROP CONSTRAINT IF EXISTS room_type_restriction_client_id_fkey;
        ALTER TABLE guest DROP CONSTRAINT IF EXISTS guest_client_id_fkey;
        ALTER TABLE contact_category DROP CONSTRAINT IF EXISTS contact_category_client_id_fkey;
        ALTER TABLE contact DROP CONSTRAINT IF EXISTS contact_client_id_fkey;
        ALTER TABLE lost_found_item DROP CONSTRAINT IF EXISTS lost_found_item_client_id_fkey;

        -- 3. Remap values to 5-digit numbers
        UPDATE property SET client_id = '10001' WHERE client_id = 'DIS_001';
        UPDATE property SET client_id = '10002' WHERE client_id = 'STVMC_SURAT';

        UPDATE app_user SET client_id = '10001' WHERE client_id = 'DIS_001';
        UPDATE app_user SET client_id = '10002' WHERE client_id = 'STVMC_SURAT';

        UPDATE audit_log SET client_id = '10001' WHERE client_id = 'DIS_001';
        UPDATE audit_log SET client_id = '10002' WHERE client_id = 'STVMC_SURAT';

        UPDATE building SET client_id = '10001' WHERE client_id = 'DIS_001';
        UPDATE building SET client_id = '10002' WHERE client_id = 'STVMC_SURAT';

        UPDATE contact SET client_id = '10001' WHERE client_id = 'DIS_001';
        UPDATE contact SET client_id = '10002' WHERE client_id = 'STVMC_SURAT';

        UPDATE contact_category SET client_id = '10001' WHERE client_id = 'DIS_001';
        UPDATE contact_category SET client_id = '10002' WHERE client_id = 'STVMC_SURAT';

        UPDATE crs_tax_exempt SET client_id = '10001' WHERE client_id = 'DIS_001';
        UPDATE crs_tax_exempt SET client_id = '10002' WHERE client_id = 'STVMC_SURAT';

        UPDATE document_type SET client_id = '10001' WHERE client_id = 'DIS_001';
        UPDATE document_type SET client_id = '10002' WHERE client_id = 'STVMC_SURAT';

        UPDATE doorlock SET client_id = '10001' WHERE client_id = 'DIS_001';
        UPDATE doorlock SET client_id = '10002' WHERE client_id = 'STVMC_SURAT';

        UPDATE doorlock_terminal_mapping SET client_id = '10001' WHERE client_id = 'DIS_001';
        UPDATE doorlock_terminal_mapping SET client_id = '10002' WHERE client_id = 'STVMC_SURAT';

        UPDATE email_template SET client_id = '10001' WHERE client_id = 'DIS_001';
        UPDATE email_template SET client_id = '10002' WHERE client_id = 'STVMC_SURAT';

        UPDATE exchange_rate SET client_id = '10001' WHERE client_id = 'DIS_001';
        UPDATE exchange_rate SET client_id = '10002' WHERE client_id = 'STVMC_SURAT';

        UPDATE flash_view_settings SET client_id = '10001' WHERE client_id = 'DIS_001';
        UPDATE flash_view_settings SET client_id = '10002' WHERE client_id = 'STVMC_SURAT';

        UPDATE floor SET client_id = '10001' WHERE client_id = 'DIS_001';
        UPDATE floor SET client_id = '10002' WHERE client_id = 'STVMC_SURAT';

        UPDATE forecast SET client_id = '10001' WHERE client_id = 'DIS_001';
        UPDATE forecast SET client_id = '10002' WHERE client_id = 'STVMC_SURAT';

        UPDATE general_setting_credit_card SET client_id = '10001' WHERE client_id = 'DIS_001';
        UPDATE general_setting_credit_card SET client_id = '10002' WHERE client_id = 'STVMC_SURAT';

        UPDATE general_setting_display SET client_id = '10001' WHERE client_id = 'DIS_001';
        UPDATE general_setting_display SET client_id = '10002' WHERE client_id = 'STVMC_SURAT';

        UPDATE general_setting_email SET client_id = '10001' WHERE client_id = 'DIS_001';
        UPDATE general_setting_email SET client_id = '10002' WHERE client_id = 'STVMC_SURAT';

        UPDATE general_setting_feature SET client_id = '10001' WHERE client_id = 'DIS_001';
        UPDATE general_setting_feature SET client_id = '10002' WHERE client_id = 'STVMC_SURAT';

        UPDATE general_setting_folio SET client_id = '10001' WHERE client_id = 'DIS_001';
        UPDATE general_setting_folio SET client_id = '10002' WHERE client_id = 'STVMC_SURAT';

        UPDATE general_setting_localization SET client_id = '10001' WHERE client_id = 'DIS_001';
        UPDATE general_setting_localization SET client_id = '10002' WHERE client_id = 'STVMC_SURAT';

        UPDATE general_setting_night_audit SET client_id = '10001' WHERE client_id = 'DIS_001';
        UPDATE general_setting_night_audit SET client_id = '10002' WHERE client_id = 'STVMC_SURAT';

        UPDATE general_setting_rental SET client_id = '10001' WHERE client_id = 'DIS_001';
        UPDATE general_setting_rental SET client_id = '10002' WHERE client_id = 'STVMC_SURAT';

        UPDATE guest SET client_id = '10001' WHERE client_id = 'DIS_001';
        UPDATE guest SET client_id = '10002' WHERE client_id = 'STVMC_SURAT';

        UPDATE guest_category SET client_id = '10001' WHERE client_id = 'DIS_001';
        UPDATE guest_category SET client_id = '10002' WHERE client_id = 'STVMC_SURAT';

        UPDATE guest_mandatory_data SET client_id = '10001' WHERE client_id = 'DIS_001';
        UPDATE guest_mandatory_data SET client_id = '10002' WHERE client_id = 'STVMC_SURAT';

        UPDATE hotel_policy SET client_id = '10001' WHERE client_id = 'DIS_001';
        UPDATE hotel_policy SET client_id = '10002' WHERE client_id = 'STVMC_SURAT';

        UPDATE listview_setting SET client_id = '10001' WHERE client_id = 'DIS_001';
        UPDATE listview_setting SET client_id = '10002' WHERE client_id = 'STVMC_SURAT';

        UPDATE lost_found_item SET client_id = '10001' WHERE client_id = 'DIS_001';
        UPDATE lost_found_item SET client_id = '10002' WHERE client_id = 'STVMC_SURAT';

        UPDATE measurement_unit SET client_id = '10001' WHERE client_id = 'DIS_001';
        UPDATE measurement_unit SET client_id = '10002' WHERE client_id = 'STVMC_SURAT';

        UPDATE notification_item SET client_id = '10001' WHERE client_id = 'DIS_001';
        UPDATE notification_item SET client_id = '10002' WHERE client_id = 'STVMC_SURAT';

        UPDATE other_charges SET client_id = '10001' WHERE client_id = 'DIS_001';
        UPDATE other_charges SET client_id = '10002' WHERE client_id = 'STVMC_SURAT';

        UPDATE other_charges_category SET client_id = '10001' WHERE client_id = 'DIS_001';
        UPDATE other_charges_category SET client_id = '10002' WHERE client_id = 'STVMC_SURAT';

        UPDATE payment_gateway SET client_id = '10001' WHERE client_id = 'DIS_001';
        UPDATE payment_gateway SET client_id = '10002' WHERE client_id = 'STVMC_SURAT';

        UPDATE payment_type SET client_id = '10001' WHERE client_id = 'DIS_001';
        UPDATE payment_type SET client_id = '10002' WHERE client_id = 'STVMC_SURAT';

        UPDATE policy SET client_id = '10001' WHERE client_id = 'DIS_001';
        UPDATE policy SET client_id = '10002' WHERE client_id = 'STVMC_SURAT';

        UPDATE rate_type SET client_id = '10001' WHERE client_id = 'DIS_001';
        UPDATE rate_type SET client_id = '10002' WHERE client_id = 'STVMC_SURAT';

        UPDATE role_privilege SET client_id = '10001' WHERE client_id = 'DIS_001';
        UPDATE role_privilege SET client_id = '10002' WHERE client_id = 'STVMC_SURAT';

        UPDATE room SET client_id = '10001' WHERE client_id = 'DIS_001';
        UPDATE room SET client_id = '10002' WHERE client_id = 'STVMC_SURAT';

        UPDATE room_rate SET client_id = '10001' WHERE client_id = 'DIS_001';
        UPDATE room_rate SET client_id = '10002' WHERE client_id = 'STVMC_SURAT';

        UPDATE room_status SET client_id = '10001' WHERE client_id = 'DIS_001';
        UPDATE room_status SET client_id = '10002' WHERE client_id = 'STVMC_SURAT';

        UPDATE room_type SET client_id = '10001' WHERE client_id = 'DIS_001';
        UPDATE room_type SET client_id = '10002' WHERE client_id = 'STVMC_SURAT';

        UPDATE room_type_restriction SET client_id = '10001' WHERE client_id = 'DIS_001';
        UPDATE room_type_restriction SET client_id = '10002' WHERE client_id = 'STVMC_SURAT';

        UPDATE scanner_configuration SET client_id = '10001' WHERE client_id = 'DIS_001';
        UPDATE scanner_configuration SET client_id = '10002' WHERE client_id = 'STVMC_SURAT';

        UPDATE tax SET client_id = '10001' WHERE client_id = 'DIS_001';
        UPDATE tax SET client_id = '10002' WHERE client_id = 'STVMC_SURAT';

        UPDATE tax_configuration SET client_id = '10001' WHERE client_id = 'DIS_001';
        UPDATE tax_configuration SET client_id = '10002' WHERE client_id = 'STVMC_SURAT';

        -- 4. Alter column types
        ALTER TABLE property ALTER COLUMN client_id TYPE INTEGER USING client_id::INTEGER;
        ALTER TABLE app_user ALTER COLUMN client_id TYPE INTEGER USING client_id::INTEGER;
        ALTER TABLE audit_log ALTER COLUMN client_id TYPE INTEGER USING client_id::INTEGER;
        ALTER TABLE building ALTER COLUMN client_id TYPE INTEGER USING client_id::INTEGER;
        ALTER TABLE contact ALTER COLUMN client_id TYPE INTEGER USING client_id::INTEGER;
        ALTER TABLE contact_category ALTER COLUMN client_id TYPE INTEGER USING client_id::INTEGER;
        ALTER TABLE crs_tax_exempt ALTER COLUMN client_id TYPE INTEGER USING client_id::INTEGER;
        ALTER TABLE document_type ALTER COLUMN client_id TYPE INTEGER USING client_id::INTEGER;
        ALTER TABLE doorlock ALTER COLUMN client_id TYPE INTEGER USING client_id::INTEGER;
        ALTER TABLE doorlock_terminal_mapping ALTER COLUMN client_id TYPE INTEGER USING client_id::INTEGER;
        ALTER TABLE email_template ALTER COLUMN client_id TYPE INTEGER USING client_id::INTEGER;
        ALTER TABLE exchange_rate ALTER COLUMN client_id TYPE INTEGER USING client_id::INTEGER;
        ALTER TABLE flash_view_settings ALTER COLUMN client_id TYPE INTEGER USING client_id::INTEGER;
        ALTER TABLE floor ALTER COLUMN client_id TYPE INTEGER USING client_id::INTEGER;
        ALTER TABLE forecast ALTER COLUMN client_id TYPE INTEGER USING client_id::INTEGER;
        ALTER TABLE general_setting_credit_card ALTER COLUMN client_id TYPE INTEGER USING client_id::INTEGER;
        ALTER TABLE general_setting_display ALTER COLUMN client_id TYPE INTEGER USING client_id::INTEGER;
        ALTER TABLE general_setting_email ALTER COLUMN client_id TYPE INTEGER USING client_id::INTEGER;
        ALTER TABLE general_setting_feature ALTER COLUMN client_id TYPE INTEGER USING client_id::INTEGER;
        ALTER TABLE general_setting_folio ALTER COLUMN client_id TYPE INTEGER USING client_id::INTEGER;
        ALTER TABLE general_setting_localization ALTER COLUMN client_id TYPE INTEGER USING client_id::INTEGER;
        ALTER TABLE general_setting_night_audit ALTER COLUMN client_id TYPE INTEGER USING client_id::INTEGER;
        ALTER TABLE general_setting_rental ALTER COLUMN client_id TYPE INTEGER USING client_id::INTEGER;
        ALTER TABLE guest ALTER COLUMN client_id TYPE INTEGER USING client_id::INTEGER;
        ALTER TABLE guest_category ALTER COLUMN client_id TYPE INTEGER USING client_id::INTEGER;
        ALTER TABLE guest_mandatory_data ALTER COLUMN client_id TYPE INTEGER USING client_id::INTEGER;
        ALTER TABLE hotel_policy ALTER COLUMN client_id TYPE INTEGER USING client_id::INTEGER;
        ALTER TABLE listview_setting ALTER COLUMN client_id TYPE INTEGER USING client_id::INTEGER;
        ALTER TABLE lost_found_item ALTER COLUMN client_id TYPE INTEGER USING client_id::INTEGER;
        ALTER TABLE measurement_unit ALTER COLUMN client_id TYPE INTEGER USING client_id::INTEGER;
        ALTER TABLE notification_item ALTER COLUMN client_id TYPE INTEGER USING client_id::INTEGER;
        ALTER TABLE other_charges ALTER COLUMN client_id TYPE INTEGER USING client_id::INTEGER;
        ALTER TABLE other_charges_category ALTER COLUMN client_id TYPE INTEGER USING client_id::INTEGER;
        ALTER TABLE payment_gateway ALTER COLUMN client_id TYPE INTEGER USING client_id::INTEGER;
        ALTER TABLE payment_type ALTER COLUMN client_id TYPE INTEGER USING client_id::INTEGER;
        ALTER TABLE policy ALTER COLUMN client_id TYPE INTEGER USING client_id::INTEGER;
        ALTER TABLE rate_type ALTER COLUMN client_id TYPE INTEGER USING client_id::INTEGER;
        ALTER TABLE role_privilege ALTER COLUMN client_id TYPE INTEGER USING client_id::INTEGER;
        ALTER TABLE room ALTER COLUMN client_id TYPE INTEGER USING client_id::INTEGER;
        ALTER TABLE room_rate ALTER COLUMN client_id TYPE INTEGER USING client_id::INTEGER;
        ALTER TABLE room_status ALTER COLUMN client_id TYPE INTEGER USING client_id::INTEGER;
        ALTER TABLE room_type ALTER COLUMN client_id TYPE INTEGER USING client_id::INTEGER;
        ALTER TABLE room_type_restriction ALTER COLUMN client_id TYPE INTEGER USING client_id::INTEGER;
        ALTER TABLE scanner_configuration ALTER COLUMN client_id TYPE INTEGER USING client_id::INTEGER;
        ALTER TABLE tax ALTER COLUMN client_id TYPE INTEGER USING client_id::INTEGER;
        ALTER TABLE tax_configuration ALTER COLUMN client_id TYPE INTEGER USING client_id::INTEGER;

        -- 5. Sequence and 5-digit Check constraint
        CREATE SEQUENCE IF NOT EXISTS property_client_id_seq START WITH 10003 MINVALUE 10000 MAXVALUE 99999;
        ALTER TABLE property ALTER COLUMN client_id SET DEFAULT nextval('property_client_id_seq');
        ALTER TABLE property DROP CONSTRAINT IF EXISTS chk_property_client_id_5_digits;
        ALTER TABLE property ADD CONSTRAINT chk_property_client_id_5_digits CHECK (client_id >= 10000 AND client_id <= 99999);

        -- 6. Re-add foreign keys
        ALTER TABLE building ADD CONSTRAINT building_client_id_fkey FOREIGN KEY (client_id) REFERENCES property(client_id) ON DELETE CASCADE;
        ALTER TABLE floor ADD CONSTRAINT floor_client_id_fkey FOREIGN KEY (client_id) REFERENCES property(client_id) ON DELETE CASCADE;
        ALTER TABLE document_type ADD CONSTRAINT document_type_client_id_fkey FOREIGN KEY (client_id) REFERENCES property(client_id) ON DELETE CASCADE;
        ALTER TABLE room_type ADD CONSTRAINT room_type_client_id_fkey FOREIGN KEY (client_id) REFERENCES property(client_id) ON DELETE CASCADE;
        ALTER TABLE room ADD CONSTRAINT room_client_id_fkey FOREIGN KEY (client_id) REFERENCES property(client_id) ON DELETE CASCADE;
        ALTER TABLE room_status ADD CONSTRAINT room_status_client_id_fkey FOREIGN KEY (client_id) REFERENCES property(client_id) ON DELETE CASCADE;
        ALTER TABLE tax ADD CONSTRAINT tax_client_id_fkey FOREIGN KEY (client_id) REFERENCES property(client_id) ON DELETE CASCADE;
        ALTER TABLE tax_configuration ADD CONSTRAINT tax_configuration_client_id_fkey FOREIGN KEY (client_id) REFERENCES property(client_id) ON DELETE CASCADE;
        ALTER TABLE rate_type ADD CONSTRAINT rate_type_client_id_fkey FOREIGN KEY (client_id) REFERENCES property(client_id) ON DELETE CASCADE;
        ALTER TABLE other_charges_category ADD CONSTRAINT other_charges_category_client_id_fkey FOREIGN KEY (client_id) REFERENCES property(client_id) ON DELETE CASCADE;
        ALTER TABLE other_charges ADD CONSTRAINT other_charges_client_id_fkey FOREIGN KEY (client_id) REFERENCES property(client_id) ON DELETE CASCADE;
        ALTER TABLE measurement_unit ADD CONSTRAINT measurement_unit_client_id_fkey FOREIGN KEY (client_id) REFERENCES property(client_id) ON DELETE CASCADE;
        ALTER TABLE payment_type ADD CONSTRAINT payment_type_client_id_fkey FOREIGN KEY (client_id) REFERENCES property(client_id) ON DELETE CASCADE;
        ALTER TABLE exchange_rate ADD CONSTRAINT exchange_rate_client_id_fkey FOREIGN KEY (client_id) REFERENCES property(client_id) ON DELETE CASCADE;
        ALTER TABLE role_privilege ADD CONSTRAINT role_privilege_client_id_fkey FOREIGN KEY (client_id) REFERENCES property(client_id) ON DELETE CASCADE;
        ALTER TABLE app_user ADD CONSTRAINT app_user_client_id_fkey FOREIGN KEY (client_id) REFERENCES property(client_id) ON DELETE CASCADE;
        ALTER TABLE email_template ADD CONSTRAINT email_template_client_id_fkey FOREIGN KEY (client_id) REFERENCES property(client_id) ON DELETE CASCADE;
        ALTER TABLE policy ADD CONSTRAINT policy_client_id_fkey FOREIGN KEY (client_id) REFERENCES property(client_id) ON DELETE CASCADE;
        ALTER TABLE guest_category ADD CONSTRAINT guest_category_client_id_fkey FOREIGN KEY (client_id) REFERENCES property(client_id) ON DELETE CASCADE;
        ALTER TABLE general_setting_rental ADD CONSTRAINT general_setting_rental_client_id_fkey FOREIGN KEY (client_id) REFERENCES property(client_id) ON DELETE CASCADE;
        ALTER TABLE general_setting_feature ADD CONSTRAINT general_setting_feature_client_id_fkey FOREIGN KEY (client_id) REFERENCES property(client_id) ON DELETE CASCADE;
        ALTER TABLE general_setting_night_audit ADD CONSTRAINT general_setting_night_audit_client_id_fkey FOREIGN KEY (client_id) REFERENCES property(client_id) ON DELETE CASCADE;
        ALTER TABLE general_setting_localization ADD CONSTRAINT general_setting_localization_client_id_fkey FOREIGN KEY (client_id) REFERENCES property(client_id) ON DELETE CASCADE;
        ALTER TABLE general_setting_display ADD CONSTRAINT general_setting_display_client_id_fkey FOREIGN KEY (client_id) REFERENCES property(client_id) ON DELETE CASCADE;
        ALTER TABLE general_setting_folio ADD CONSTRAINT general_setting_folio_client_id_fkey FOREIGN KEY (client_id) REFERENCES property(client_id) ON DELETE CASCADE;
        ALTER TABLE general_setting_credit_card ADD CONSTRAINT general_setting_credit_card_client_id_fkey FOREIGN KEY (client_id) REFERENCES property(client_id) ON DELETE CASCADE;
        ALTER TABLE general_setting_email ADD CONSTRAINT general_setting_email_client_id_fkey FOREIGN KEY (client_id) REFERENCES property(client_id) ON DELETE CASCADE;
        ALTER TABLE guest_mandatory_data ADD CONSTRAINT guest_mandatory_data_client_id_fkey FOREIGN KEY (client_id) REFERENCES property(client_id) ON DELETE CASCADE;
        ALTER TABLE listview_setting ADD CONSTRAINT listview_setting_client_id_fkey FOREIGN KEY (client_id) REFERENCES property(client_id) ON DELETE CASCADE;
        ALTER TABLE payment_gateway ADD CONSTRAINT payment_gateway_client_id_fkey FOREIGN KEY (client_id) REFERENCES property(client_id) ON DELETE CASCADE;
        ALTER TABLE doorlock ADD CONSTRAINT doorlock_client_id_fkey FOREIGN KEY (client_id) REFERENCES property(client_id) ON DELETE CASCADE;
        ALTER TABLE doorlock_terminal_mapping ADD CONSTRAINT doorlock_terminal_mapping_client_id_fkey FOREIGN KEY (client_id) REFERENCES property(client_id) ON DELETE CASCADE;
        ALTER TABLE scanner_configuration ADD CONSTRAINT scanner_configuration_client_id_fkey FOREIGN KEY (client_id) REFERENCES property(client_id) ON DELETE CASCADE;
        ALTER TABLE crs_tax_exempt ADD CONSTRAINT crs_tax_exempt_client_id_fkey FOREIGN KEY (client_id) REFERENCES property(client_id) ON DELETE CASCADE;
        ALTER TABLE hotel_policy ADD CONSTRAINT hotel_policy_client_id_fkey FOREIGN KEY (client_id) REFERENCES property(client_id) ON DELETE CASCADE;
        ALTER TABLE audit_log ADD CONSTRAINT audit_log_client_id_fkey FOREIGN KEY (client_id) REFERENCES property(client_id) ON DELETE CASCADE;
        ALTER TABLE notification_item ADD CONSTRAINT notification_item_client_id_fkey FOREIGN KEY (client_id) REFERENCES property(client_id) ON DELETE CASCADE;
        ALTER TABLE flash_view_settings ADD CONSTRAINT flash_view_settings_client_id_fkey FOREIGN KEY (client_id) REFERENCES property(client_id) ON DELETE CASCADE;
        ALTER TABLE forecast ADD CONSTRAINT forecast_client_id_fkey FOREIGN KEY (client_id) REFERENCES property(client_id) ON DELETE CASCADE;
        ALTER TABLE room_rate ADD CONSTRAINT room_rate_client_id_fkey FOREIGN KEY (client_id) REFERENCES property(client_id) ON DELETE CASCADE;
        ALTER TABLE room_type_restriction ADD CONSTRAINT room_type_restriction_client_id_fkey FOREIGN KEY (client_id) REFERENCES property(client_id) ON DELETE CASCADE;
        ALTER TABLE guest ADD CONSTRAINT guest_client_id_fkey FOREIGN KEY (client_id) REFERENCES property(client_id) ON DELETE CASCADE;
        ALTER TABLE contact_category ADD CONSTRAINT contact_category_client_id_fkey FOREIGN KEY (client_id) REFERENCES property(client_id) ON DELETE CASCADE;
        ALTER TABLE contact ADD CONSTRAINT contact_client_id_fkey FOREIGN KEY (client_id) REFERENCES property(client_id) ON DELETE CASCADE;
        ALTER TABLE lost_found_item ADD CONSTRAINT lost_found_item_client_id_fkey FOREIGN KEY (client_id) REFERENCES property(client_id) ON DELETE CASCADE;

        -- 7. Trigger function with INTEGER
        EXECUTE $fn$
        CREATE OR REPLACE FUNCTION fn_provision_property_singleton_settings_for_client(p_client_id INT)
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
        $fn$;

        EXECUTE $trg_fn$
        CREATE OR REPLACE FUNCTION trg_fn_provision_property_singleton_settings()
        RETURNS TRIGGER AS $$
        BEGIN
            PERFORM fn_provision_property_singleton_settings_for_client(NEW.client_id);
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        $trg_fn$;

        CREATE TRIGGER trg_property_after_insert
            AFTER INSERT ON property
            FOR EACH ROW
            EXECUTE FUNCTION trg_fn_provision_property_singleton_settings();
    END IF;
END;
$$;
