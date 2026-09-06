-- =====================================================================
-- StayOS PMS — Pattern A Singleton Settings Auto-Provisioning Trigger
-- =====================================================================
-- Auto-populates default rows in all 10 Pattern A singleton setting tables
-- whenever a new row is inserted into property(client_id).
-- =====================================================================

-- Standalone provisioning procedure/function (callable manually if needed)
CREATE OR REPLACE FUNCTION fn_provision_property_singleton_settings_for_client(p_client_id VARCHAR(50))
RETURNS VOID AS $$
BEGIN
    -- 1. Rental Settings
    INSERT INTO general_setting_rental (client_id)
    VALUES (p_client_id)
    ON CONFLICT (client_id) DO NOTHING;

    -- 2. Feature Settings
    INSERT INTO general_setting_feature (client_id)
    VALUES (p_client_id)
    ON CONFLICT (client_id) DO NOTHING;

    -- 3. Night Audit Settings
    INSERT INTO general_setting_night_audit (client_id)
    VALUES (p_client_id)
    ON CONFLICT (client_id) DO NOTHING;

    -- 4. Localization Settings
    INSERT INTO general_setting_localization (client_id)
    VALUES (p_client_id)
    ON CONFLICT (client_id) DO NOTHING;

    -- 5. Display Settings
    INSERT INTO general_setting_display (client_id)
    VALUES (p_client_id)
    ON CONFLICT (client_id) DO NOTHING;

    -- 6. Folio Settings
    INSERT INTO general_setting_folio (client_id)
    VALUES (p_client_id)
    ON CONFLICT (client_id) DO NOTHING;

    -- 7. Credit Card Settings
    INSERT INTO general_setting_credit_card (client_id)
    VALUES (p_client_id)
    ON CONFLICT (client_id) DO NOTHING;

    -- 8. Email Settings
    INSERT INTO general_setting_email (client_id)
    VALUES (p_client_id)
    ON CONFLICT (client_id) DO NOTHING;

    -- 9. Guest Mandatory Data
    INSERT INTO guest_mandatory_data (client_id)
    VALUES (p_client_id)
    ON CONFLICT (client_id) DO NOTHING;

    -- 10. Listview Setting
    INSERT INTO listview_setting (client_id)
    VALUES (p_client_id)
    ON CONFLICT (client_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Trigger Function
CREATE OR REPLACE FUNCTION trg_fn_provision_property_singleton_settings()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM fn_provision_property_singleton_settings_for_client(NEW.client_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if already exists to ensure idempotency
DROP TRIGGER IF EXISTS trg_property_after_insert ON property;

-- AFTER INSERT trigger on property
CREATE TRIGGER trg_property_after_insert
    AFTER INSERT ON property
    FOR EACH ROW
    EXECUTE FUNCTION trg_fn_provision_property_singleton_settings();
