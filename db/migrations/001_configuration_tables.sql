-- =====================================================================
-- StayOS PMS — Configuration Module — PostgreSQL Migration
-- Generated from: StayOS_Configuration_Database_Structure + Backend_Workflow
-- Run against a fresh Supabase/Postgres database, in this order (FK-safe).
-- =====================================================================

BEGIN;

-- ===================== 1. PROPERTY & ROOM HIERARCHY =====================

-- Property Master — one row per tenant. Client ID is the tenancy key referenced everywhere else.
CREATE TABLE IF NOT EXISTS property (
    client_id           VARCHAR(50) PRIMARY KEY,
    property_name       VARCHAR(50) NOT NULL,
    region              VARCHAR(50),
    address             VARCHAR(50),
    city                VARCHAR(50) NOT NULL,
    state               VARCHAR(50) NOT NULL,
    url                 VARCHAR(50),
    latitude            NUMERIC(9,6),
    longitude           NUMERIC(9,6)
);

CREATE TABLE IF NOT EXISTS building (
    building_id         SERIAL PRIMARY KEY,
    client_id           VARCHAR(50) NOT NULL REFERENCES property(client_id),
    building_name       VARCHAR(50) NOT NULL,
    description         TEXT,
    CONSTRAINT uq_building_name UNIQUE (client_id, building_name)
);

CREATE TABLE IF NOT EXISTS floor (
    floor_id            SERIAL PRIMARY KEY,
    client_id           VARCHAR(50) NOT NULL REFERENCES property(client_id),
    building_id         INTEGER NOT NULL REFERENCES building(building_id),
    floor_name          VARCHAR(50) NOT NULL,
    description         TEXT,
    CONSTRAINT uq_floor_name UNIQUE (building_id, floor_name)
);

CREATE TABLE IF NOT EXISTS room_type (
    room_type_id        SERIAL PRIMARY KEY,
    client_id           VARCHAR(50) NOT NULL REFERENCES property(client_id),
    floor_id            INTEGER NOT NULL REFERENCES floor(floor_id),
    building_id         INTEGER NOT NULL REFERENCES building(building_id),
    short_name          VARCHAR(50) NOT NULL,
    room_type_name      VARCHAR(50) NOT NULL,
    room_type_color     VARCHAR(20),
    description         TEXT,
    over_booking        INTEGER NOT NULL DEFAULT 0 CHECK (over_booking >= 0),
    allow_in_occupancy  BOOLEAN NOT NULL DEFAULT TRUE,
    is_crs              BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_room_type_short_name UNIQUE (client_id, short_name),
    CONSTRAINT uq_room_type_name UNIQUE (client_id, room_type_name)
);

CREATE TABLE IF NOT EXISTS room (
    room_id                 SERIAL PRIMARY KEY,
    client_id               VARCHAR(50) NOT NULL REFERENCES property(client_id),
    room_type_id            INTEGER NOT NULL REFERENCES room_type(room_type_id),
    floor_id                INTEGER NOT NULL REFERENCES floor(floor_id),
    building_id             INTEGER NOT NULL REFERENCES building(building_id),
    room_name               VARCHAR(50) NOT NULL,
    short_name              VARCHAR(50) NOT NULL,
    is_hourly_rental        BOOLEAN NOT NULL DEFAULT FALSE,
    is_smoking              BOOLEAN NOT NULL DEFAULT FALSE,
    is_handicap             BOOLEAN NOT NULL DEFAULT FALSE,
    is_pet_allowed          BOOLEAN NOT NULL DEFAULT FALSE,
    include_in_occupancy_adr BOOLEAN NOT NULL DEFAULT TRUE,
    is_crs_inventory        BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_room_name UNIQUE (client_id, room_name)
);

-- Master catalogue of possible statuses, not a live per-room state (live state lives in Housekeeping/Front Desk).
CREATE TABLE IF NOT EXISTS room_status (
    room_status_id      SERIAL PRIMARY KEY,
    client_id           VARCHAR(50) NOT NULL REFERENCES property(client_id),
    room_id             INTEGER REFERENCES room(room_id),
    room_type_id        INTEGER REFERENCES room_type(room_type_id),
    floor_id            INTEGER REFERENCES floor(floor_id),
    building_id         INTEGER REFERENCES building(building_id),
    status_name         VARCHAR(50) NOT NULL,
    short_name          VARCHAR(50),
    status_code         CHAR(7) NOT NULL,
    status_color        CHAR(7),
    text_color          CHAR(7),
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_room_status_code UNIQUE (client_id, status_code)
);

CREATE TABLE IF NOT EXISTS tax (
    tax_id              SERIAL PRIMARY KEY,
    client_id           VARCHAR(50) NOT NULL REFERENCES property(client_id),
    tax_name            VARCHAR(50) NOT NULL,
    tax_type            VARCHAR(50),
    per_day_tax         BOOLEAN NOT NULL DEFAULT FALSE,
    per_stay_tax        BOOLEAN NOT NULL DEFAULT FALSE,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_tax_name UNIQUE (client_id, tax_name),
    CONSTRAINT chk_tax_one_basis CHECK (per_day_tax <> per_stay_tax)
);

-- Overlap of active date ranges per tax_id is enforced at the service layer (see Backend Workflow doc), not by a simple CHECK constraint.
CREATE TABLE IF NOT EXISTS tax_configuration (
    tax_config_id       SERIAL PRIMARY KEY,
    client_id           VARCHAR(50) NOT NULL REFERENCES property(client_id),
    tax_id              INTEGER NOT NULL REFERENCES tax(tax_id),
    rate                NUMERIC(5,2) NOT NULL,
    from_date           DATE NOT NULL,
    last_date           DATE NOT NULL,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_tax_config_dates CHECK (from_date < last_date)
);

-- ===================== 2. CONFIGURATION MASTERS =====================

CREATE TABLE IF NOT EXISTS rate_type (
    rate_type_id        SERIAL PRIMARY KEY,
    client_id           VARCHAR(50) NOT NULL REFERENCES property(client_id),
    short_name          VARCHAR(50) NOT NULL,
    rate_type_name      VARCHAR(50) NOT NULL,
    description         TEXT,
    bind_with_rate      NUMERIC(5,2),
    is_hourly           BOOLEAN NOT NULL DEFAULT FALSE,
    is_crs_tax_inclusive BOOLEAN NOT NULL DEFAULT FALSE,
    crs_enable          BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_rate_type_name UNIQUE (client_id, rate_type_name)
);

CREATE TABLE IF NOT EXISTS document_type (
    document_type_id    SERIAL PRIMARY KEY,
    client_id           VARCHAR(50) NOT NULL REFERENCES property(client_id),
    short_name          VARCHAR(50) NOT NULL,
    document_name       VARCHAR(50) NOT NULL,
    document_category   VARCHAR(50),
    description         TEXT,
    is_default          BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS other_charges_category (
    occ_id              SERIAL PRIMARY KEY,
    client_id           VARCHAR(50) NOT NULL REFERENCES property(client_id),
    short_name          VARCHAR(50) NOT NULL,
    category_name       VARCHAR(50) NOT NULL,
    description         TEXT,
    is_default          BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS other_charges (
    oc_id                   SERIAL PRIMARY KEY,
    client_id               VARCHAR(50) NOT NULL REFERENCES property(client_id),
    occ_id                  INTEGER NOT NULL REFERENCES other_charges_category(occ_id),
    short_name              VARCHAR(50) NOT NULL,
    charge_name             VARCHAR(50) NOT NULL,
    taxable                 BOOLEAN NOT NULL DEFAULT FALSE,
    always_charge           BOOLEAN NOT NULL DEFAULT FALSE,
    reoccur_charge          BOOLEAN NOT NULL DEFAULT FALSE,
    reoccur_frequency       INTEGER,
    crs_charge              BOOLEAN NOT NULL DEFAULT FALSE,
    call_logging_charge     BOOLEAN NOT NULL DEFAULT FALSE,
    pos_charge              BOOLEAN NOT NULL DEFAULT FALSE,
    forecasting_revenue     BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT chk_reoccur_frequency CHECK (reoccur_charge = FALSE OR reoccur_frequency > 0)
);

CREATE TABLE IF NOT EXISTS measurement_unit (
    measurement_id      SERIAL PRIMARY KEY,
    client_id           VARCHAR(50) NOT NULL REFERENCES property(client_id),
    measurement         VARCHAR(50) NOT NULL,
    short_name          VARCHAR(50),
    description         TEXT
);

CREATE TABLE IF NOT EXISTS payment_type (
    payment_type_id     SERIAL PRIMARY KEY,
    client_id           VARCHAR(50) NOT NULL REFERENCES property(client_id),
    short_name          VARCHAR(50) NOT NULL,
    payment_type_name   VARCHAR(50) NOT NULL,
    category_name       VARCHAR(50),
    description         TEXT,
    credit_card_processing BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS exchange_rate (
    exchange_rate_id    SERIAL PRIMARY KEY,
    client_id           VARCHAR(50) NOT NULL REFERENCES property(client_id),
    country_name        VARCHAR(50),
    currency_name       VARCHAR(50) NOT NULL,
    currency_sign       VARCHAR(10),
    rate                NUMERIC(18,6) NOT NULL DEFAULT 1,
    is_base_rate        BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS role_privilege (
    role_id             SERIAL PRIMARY KEY,
    client_id           VARCHAR(50) NOT NULL REFERENCES property(client_id),
    role_name           VARCHAR(50) NOT NULL,
    short_name          VARCHAR(50),
    role_type           VARCHAR(50),
    description         TEXT,
    CONSTRAINT uq_role_name UNIQUE (client_id, role_name)
);

-- Named app_user (not user) since USER is a reserved word in Postgres. Login credentials live in the Auth service, not here.
CREATE TABLE IF NOT EXISTS app_user (
    user_id             SERIAL PRIMARY KEY,
    client_id           VARCHAR(50) NOT NULL REFERENCES property(client_id),
    role_id             INTEGER NOT NULL REFERENCES role_privilege(role_id),
    user_name           VARCHAR(50) NOT NULL,
    description         TEXT,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_user_name UNIQUE (client_id, user_name)
);

CREATE TABLE IF NOT EXISTS email_template (
    template_id                     SERIAL PRIMARY KEY,
    client_id                       VARCHAR(50) NOT NULL REFERENCES property(client_id),
    template_name                   VARCHAR(50) NOT NULL,
    trigger_reservation             BOOLEAN NOT NULL DEFAULT FALSE,
    trigger_reservation_update      BOOLEAN NOT NULL DEFAULT FALSE,
    trigger_reservation_cancel      BOOLEAN NOT NULL DEFAULT FALSE,
    trigger_after_reservation_cancel BOOLEAN NOT NULL DEFAULT FALSE,
    trigger_before_check_in         BOOLEAN NOT NULL DEFAULT FALSE,
    trigger_check_in                BOOLEAN NOT NULL DEFAULT FALSE,
    trigger_after_check_in          BOOLEAN NOT NULL DEFAULT FALSE,
    trigger_before_check_out        BOOLEAN NOT NULL DEFAULT FALSE,
    trigger_check_out               BOOLEAN NOT NULL DEFAULT FALSE,
    trigger_after_check_out         BOOLEAN NOT NULL DEFAULT FALSE,
    trigger_date_of_birth           BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS policy (
    policy_id           SERIAL PRIMARY KEY,
    client_id           VARCHAR(50) NOT NULL REFERENCES property(client_id),
    room_type_id        INTEGER NOT NULL REFERENCES room_type(room_type_id),
    rate_type_id        INTEGER NOT NULL REFERENCES rate_type(rate_type_id),
    policy_text         TEXT,
    CONSTRAINT uq_policy_room_rate UNIQUE (client_id, room_type_id, rate_type_id)
);

CREATE TABLE IF NOT EXISTS guest_category (
    guest_category_id   SERIAL PRIMARY KEY,
    client_id           VARCHAR(50) NOT NULL REFERENCES property(client_id),
    category_name       VARCHAR(50) NOT NULL,
    short_name          VARCHAR(50),
    description         TEXT,
    is_highlight        BOOLEAN NOT NULL DEFAULT FALSE,
    color_code          VARCHAR(7),
    CONSTRAINT uq_guest_category_name UNIQUE (client_id, category_name)
);

-- ===================== 3. SETTINGS (singleton per property) =====================

CREATE TABLE IF NOT EXISTS general_setting_rental (
    rental_setting_id                      SERIAL PRIMARY KEY,
    client_id                              VARCHAR(50) NOT NULL UNIQUE REFERENCES property(client_id),
    remember_rate_for_guest                BOOLEAN NOT NULL DEFAULT FALSE,
    allow_checkout_with_deposit            BOOLEAN NOT NULL DEFAULT FALSE,
    permits_only_zero_balance_checkout     BOOLEAN NOT NULL DEFAULT FALSE,
    remember_rate_for_company              BOOLEAN NOT NULL DEFAULT FALSE,
    allow_checkout_with_auth_payment       BOOLEAN NOT NULL DEFAULT FALSE,
    do_not_allow_extend_stay_prepaid       BOOLEAN NOT NULL DEFAULT FALSE,
    from_balance_limit                     NUMERIC(10,2) DEFAULT 0,
    to_balance_limit                       NUMERIC(10,2) DEFAULT 0,
    minimum_rental_age_year                INTEGER,
    flash_delinquent_balance_limit         NUMERIC(10,2) DEFAULT 0,
    max_stay_days_on_flash                 INTEGER,
    discount_apply_rent                    BOOLEAN NOT NULL DEFAULT FALSE,
    discount_apply_occupancy_tax           BOOLEAN NOT NULL DEFAULT FALSE,
    discount_apply_other_charges           BOOLEAN NOT NULL DEFAULT FALSE,
    discount_apply_other_charges_tax       BOOLEAN NOT NULL DEFAULT FALSE,
    room_status_after_check_out            VARCHAR(20),
    room_status_after_maintenance          VARCHAR(20),
    rate_change_confirmation               VARCHAR(50),
    include_v_dirty_as_available           BOOLEAN NOT NULL DEFAULT FALSE,
    fill_available_room_on_stay_change     BOOLEAN NOT NULL DEFAULT FALSE,
    auto_select_first_available_room       BOOLEAN NOT NULL DEFAULT FALSE,
    manual_posting_no_show_cancel_rev      BOOLEAN NOT NULL DEFAULT FALSE,
    auto_no_show_after_days                INTEGER,
    include_no_show_cancel_on_forecast     BOOLEAN NOT NULL DEFAULT FALSE,
    display_no_show_cancel_rent_separate   BOOLEAN NOT NULL DEFAULT FALSE,
    display_v_dirty_room_in_check_in       BOOLEAN NOT NULL DEFAULT FALSE,
    include_unposted_reservation_inventory BOOLEAN NOT NULL DEFAULT FALSE,
    auto_assign_room_to_crs_reservation    BOOLEAN NOT NULL DEFAULT FALSE,
    tax_inclusive_rate                     BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS general_setting_feature (
    feature_setting_id                 SERIAL PRIMARY KEY,
    client_id                          VARCHAR(50) NOT NULL UNIQUE REFERENCES property(client_id),
    enable_group                       BOOLEAN NOT NULL DEFAULT FALSE,
    enable_reservation_wo_room         BOOLEAN NOT NULL DEFAULT FALSE,
    enable_multiple_currency           BOOLEAN NOT NULL DEFAULT FALSE,
    enable_multi_room_selection        BOOLEAN NOT NULL DEFAULT FALSE,
    enable_reservation_expiry          BOOLEAN NOT NULL DEFAULT FALSE,
    enable_range_tax                   BOOLEAN NOT NULL DEFAULT FALSE,
    enable_business_source             BOOLEAN NOT NULL DEFAULT FALSE,
    enable_balance_transfer            BOOLEAN NOT NULL DEFAULT FALSE,
    enable_shift_operation             BOOLEAN NOT NULL DEFAULT FALSE,
    enable_deposit                     BOOLEAN NOT NULL DEFAULT FALSE,
    enable_signature_only_for_ota      BOOLEAN NOT NULL DEFAULT FALSE,
    enable_hk_inventory_mgmt           BOOLEAN NOT NULL DEFAULT FALSE,
    enable_swipe_card_reader_toggle    BOOLEAN NOT NULL DEFAULT FALSE,
    swipe_id_card                      BOOLEAN NOT NULL DEFAULT FALSE,
    swipe_credit_card                  BOOLEAN NOT NULL DEFAULT FALSE,
    enable_express_check_in            BOOLEAN NOT NULL DEFAULT FALSE,
    enable_express_check_out           BOOLEAN NOT NULL DEFAULT FALSE,
    enable_express_ci_payment_type     BOOLEAN NOT NULL DEFAULT FALSE,
    enable_rate_threshold_toggle       BOOLEAN NOT NULL DEFAULT FALSE,
    rate_threshold_consider_on         VARCHAR(50),
    enable_pos_interface_toggle        BOOLEAN NOT NULL DEFAULT FALSE,
    pos_interface_selection            VARCHAR(50),
    default_check_in_time              TIME,
    default_check_out_time             TIME,
    default_reservation_status         VARCHAR(50),
    default_rate_type_id               INTEGER REFERENCES rate_type(rate_type_id),
    default_stay_days                  INTEGER,
    max_documents_for_guest            INTEGER,
    future_reservation_allowed_years   INTEGER,
    default_hours                      INTEGER,
    hourly_blinking_interval_mins      INTEGER,
    enable_hk_frequency_toggle         BOOLEAN NOT NULL DEFAULT FALSE,
    housekeeping_frequency_type        VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS general_setting_night_audit (
    night_audit_setting_id                         SERIAL PRIMARY KEY,
    client_id                                      VARCHAR(50) NOT NULL UNIQUE REFERENCES property(client_id),
    night_audit_time                               TIME,
    prompt_for_night_audit_at                      BOOLEAN NOT NULL DEFAULT FALSE,
    prompt_time                                    TIME,
    auto_redirect_to_previous_view                 BOOLEAN NOT NULL DEFAULT FALSE,
    do_not_allow_payment_before_na                 BOOLEAN NOT NULL DEFAULT FALSE,
    daily_summary_report_with_card_type            BOOLEAN NOT NULL DEFAULT FALSE,
    allow_na_with_late_check_out_guest             BOOLEAN NOT NULL DEFAULT FALSE,
    auto_change_room_status_at_night_audit_toggle  BOOLEAN NOT NULL DEFAULT FALSE,
    form_dirty_and_clean_to_vacant                 BOOLEAN NOT NULL DEFAULT FALSE,
    auto_close_payment_gateway_batch_on_night_audit BOOLEAN NOT NULL DEFAULT FALSE,
    email_daily_summary_report                     BOOLEAN NOT NULL DEFAULT FALSE,
    email_daily_report                             BOOLEAN NOT NULL DEFAULT FALSE,
    email_daily_sheet_report                       BOOLEAN NOT NULL DEFAULT FALSE,
    email_daily_collection_report                  BOOLEAN NOT NULL DEFAULT FALSE,
    email_daily_creditcard_collection_report       BOOLEAN NOT NULL DEFAULT FALSE,
    email_daily_tax_report                         BOOLEAN NOT NULL DEFAULT FALSE,
    email_daily_other_charge_report                BOOLEAN NOT NULL DEFAULT FALSE,
    email_ledger_summary_report                    BOOLEAN NOT NULL DEFAULT FALSE,
    email_guest_ledger_report                      BOOLEAN NOT NULL DEFAULT FALSE,
    email_advance_deposit_ledger_report            BOOLEAN NOT NULL DEFAULT FALSE,
    email_account_receivable_ledger_report         BOOLEAN NOT NULL DEFAULT FALSE,
    email_monthly_collection_report                BOOLEAN NOT NULL DEFAULT FALSE,
    email_monthly_statistics_report                BOOLEAN NOT NULL DEFAULT FALSE,
    email_forecast_report                          BOOLEAN NOT NULL DEFAULT FALSE,
    email_daily_audit_ledger_summary_report        BOOLEAN NOT NULL DEFAULT FALSE,
    email_hotel_statistics_report                  BOOLEAN NOT NULL DEFAULT FALSE,
    email_arrival_report                           BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS general_setting_localization (
    localization_setting_id  SERIAL PRIMARY KEY,
    client_id                VARCHAR(50) NOT NULL UNIQUE REFERENCES property(client_id),
    country_id               VARCHAR(50),
    country_name             VARCHAR(50),
    country_alias            VARCHAR(50),
    state_label              VARCHAR(50),
    zip_label                VARCHAR(50),
    currency_id              VARCHAR(50),
    currency_code            VARCHAR(50),
    number_format            VARCHAR(50),
    room_title               VARCHAR(50),
    rate_type_title          VARCHAR(50),
    guest_title              VARCHAR(50),
    crs_folio_title          VARCHAR(50),
    miscellaneous_expense_title VARCHAR(50),
    miscellaneous_income_title  VARCHAR(50),
    time_format              VARCHAR(50),
    fiscal_year_from         DATE,
    fiscal_year_to           DATE,
    sunday                   BOOLEAN NOT NULL DEFAULT FALSE,
    monday                   BOOLEAN NOT NULL DEFAULT FALSE,
    tuesday                  BOOLEAN NOT NULL DEFAULT FALSE,
    wednesday                BOOLEAN NOT NULL DEFAULT FALSE,
    thursday                 BOOLEAN NOT NULL DEFAULT FALSE,
    friday                   BOOLEAN NOT NULL DEFAULT FALSE,
    saturday                 BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT chk_fiscal_year CHECK (fiscal_year_from < fiscal_year_to)
);

CREATE TABLE IF NOT EXISTS general_setting_display (
    display_setting_id                            SERIAL PRIMARY KEY,
    client_id                                     VARCHAR(50) NOT NULL UNIQUE REFERENCES property(client_id),
    display_deleted_other_charges                 BOOLEAN NOT NULL DEFAULT FALSE,
    display_non_refundable_logo                   BOOLEAN NOT NULL DEFAULT FALSE,
    display_image_non_smoking                     BOOLEAN NOT NULL DEFAULT FALSE,
    display_image_handicapped                     BOOLEAN NOT NULL DEFAULT FALSE,
    display_adult_rate                            BOOLEAN NOT NULL DEFAULT FALSE,
    display_pet_rate                              BOOLEAN NOT NULL DEFAULT FALSE,
    capitalize_guest_detail                       BOOLEAN NOT NULL DEFAULT FALSE,
    display_guest_search_history                  BOOLEAN NOT NULL DEFAULT FALSE,
    show_print_date_on_report                     BOOLEAN NOT NULL DEFAULT FALSE,
    display_check_in_confirmation_prompt_after_check_in BOOLEAN NOT NULL DEFAULT FALSE,
    display_deleted_payment                       BOOLEAN NOT NULL DEFAULT FALSE,
    display_masked_document_detail                BOOLEAN NOT NULL DEFAULT FALSE,
    display_image_smoking                         BOOLEAN NOT NULL DEFAULT FALSE,
    display_image_pet                             BOOLEAN NOT NULL DEFAULT FALSE,
    display_child_rate                            BOOLEAN NOT NULL DEFAULT FALSE,
    display_change_screen_on_cash_payment         BOOLEAN NOT NULL DEFAULT FALSE,
    guest_name_proper_case                        BOOLEAN NOT NULL DEFAULT FALSE,
    display_guest_verification_at_check_in        BOOLEAN NOT NULL DEFAULT FALSE,
    prompt_for_payment_confirmation_at_checkin    BOOLEAN NOT NULL DEFAULT FALSE,
    prompt_for_refund_payment_at_checkout         BOOLEAN NOT NULL DEFAULT FALSE,
    housekeeping_frequency_type_display           BOOLEAN NOT NULL DEFAULT FALSE,
    display_guest_name_on_housekeeping_report     BOOLEAN NOT NULL DEFAULT FALSE,
    housekeeping_frequency_display                BOOLEAN NOT NULL DEFAULT FALSE,
    display_no_of_pet_on_housekeeping_report      BOOLEAN NOT NULL DEFAULT FALSE,
    new_folio_title                               VARCHAR(50),
    group_folio_title                             VARCHAR(50),
    occupancy_tax_title                           VARCHAR(50),
    other_charges_tax_title                       VARCHAR(50),
    zip_code_title                                VARCHAR(50),
    micro_room_text                               VARCHAR(50),
    list_view_font_style                          VARCHAR(50),
    tape_view_font_style                          VARCHAR(50),
    room_view_font_style                          VARCHAR(50),
    report_font_size                              INTEGER,
    report_font_style                             VARCHAR(50),
    report_email_format                           VARCHAR(20),
    guest_message_at_checkin                      TEXT,
    guest_message_at_checkin_update                TEXT,
    guest_message_at_reservation                  TEXT,
    guest_message_at_reservation_update           TEXT,
    guest_message_at_checkout                     TEXT,
    date_format                                   VARCHAR(20),
    document_storage_ftp_detail                   VARCHAR(255),
    document_storage_type                         VARCHAR(20),
    signature_pad_display_amount                  VARCHAR(50),
    include_header_in_report                      BOOLEAN NOT NULL DEFAULT FALSE,
    reservation_page_layout                       VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS general_setting_folio (
    folio_setting_id                       SERIAL PRIMARY KEY,
    client_id                              VARCHAR(50) NOT NULL UNIQUE REFERENCES property(client_id),
    folio_number_type                      VARCHAR(20),
    folio_number_prefix                    VARCHAR(20),
    folio_number_start                     INTEGER,
    folio_number_group_type                VARCHAR(20),
    folio_number_group_prefix              VARCHAR(20),
    folio_number_group_start               INTEGER,
    receipt_number_payment_type            VARCHAR(20),
    receipt_number_payment_start           INTEGER,
    business_source_invoice_number_type    VARCHAR(20),
    business_source_invoice_number_prefix  VARCHAR(20),
    business_source_invoice_number_start   INTEGER,
    receipt_number_misc_income_type        VARCHAR(20),
    receipt_number_misc_income_start       INTEGER,
    cancellation_number_start              INTEGER,
    print_check_in_folio                   BOOLEAN NOT NULL DEFAULT FALSE,
    print_check_in_folio_type              VARCHAR(20),
    print_check_out_folio                  BOOLEAN NOT NULL DEFAULT FALSE,
    print_check_out_folio_type             VARCHAR(20),
    print_reservation_folio                BOOLEAN NOT NULL DEFAULT FALSE,
    print_reservation_folio_type           VARCHAR(20),
    print_registration_form_at_check_in    BOOLEAN NOT NULL DEFAULT FALSE,
    email_check_out_folio                  BOOLEAN NOT NULL DEFAULT FALSE,
    email_check_out_folio_type             VARCHAR(20),
    email_confirmation_letter              BOOLEAN NOT NULL DEFAULT FALSE,
    reservation_cancellation_letter        BOOLEAN NOT NULL DEFAULT FALSE,
    reservation_cancellation_letter_email_cc VARCHAR(255),
    download_reservation_notification_email BOOLEAN NOT NULL DEFAULT FALSE,
    email_check_in_folio                   BOOLEAN NOT NULL DEFAULT FALSE,
    email_check_in_folio_type              VARCHAR(20),
    email_reservation_folio                BOOLEAN NOT NULL DEFAULT FALSE,
    email_reservation_folio_type           VARCHAR(20),
    folio_on_print_button                  BOOLEAN NOT NULL DEFAULT FALSE,
    display_rate_type                      BOOLEAN NOT NULL DEFAULT FALSE,
    display_room_type                      BOOLEAN NOT NULL DEFAULT FALSE,
    display_guest_sign                     BOOLEAN NOT NULL DEFAULT FALSE,
    display_guest_remark_on_reg_form       BOOLEAN NOT NULL DEFAULT FALSE,
    display_business_source                BOOLEAN NOT NULL DEFAULT FALSE,
    display_desk_user_name                 BOOLEAN NOT NULL DEFAULT FALSE,
    display_printed_by_and_printed_date    BOOLEAN NOT NULL DEFAULT FALSE
);

-- pg_api_key is masked on read at the API layer, not stored encrypted-at-rest by the DB itself — pair with column-level encryption or a secrets manager in production.
CREATE TABLE IF NOT EXISTS general_setting_credit_card (
    credit_card_setting_id                 SERIAL PRIMARY KEY,
    client_id                              VARCHAR(50) NOT NULL UNIQUE REFERENCES property(client_id),
    online_credit_card_processing          BOOLEAN NOT NULL DEFAULT FALSE,
    change_credential                      BOOLEAN NOT NULL DEFAULT FALSE,
    tokenized_service                      VARCHAR(50),
    pg_api_key                             VARCHAR(255),
    gds                                    BOOLEAN NOT NULL DEFAULT FALSE,
    crm                                    BOOLEAN NOT NULL DEFAULT FALSE,
    default_credit_card_charge_method      VARCHAR(20),
    display_gateway_receipt_data           BOOLEAN NOT NULL DEFAULT FALSE,
    authorize_guest_credit_card_at_check_in_with_total_charges BOOLEAN NOT NULL DEFAULT FALSE,
    authorize_guest_credit_card_folio_type VARCHAR(20),
    charges_amount                         NUMERIC(10,2),
    charges_type                           VARCHAR(20),
    auto_release_checked_out_guest_authorization_at_night_audit BOOLEAN NOT NULL DEFAULT FALSE,
    refund_credit_card_payment_at_undo_time BOOLEAN NOT NULL DEFAULT FALSE,
    auto_collect_payment_for_prepaid_reservation_at_night_audit BOOLEAN NOT NULL DEFAULT FALSE,
    validate_cc_information                BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS general_setting_email (
    email_setting_id            SERIAL PRIMARY KEY,
    client_id                   VARCHAR(50) NOT NULL UNIQUE REFERENCES property(client_id),
    email_settings_enabled      BOOLEAN NOT NULL DEFAULT FALSE,
    server_name                 VARCHAR(100),
    port_number                 INTEGER,
    domain                      VARCHAR(100),
    ssl                         BOOLEAN NOT NULL DEFAULT TRUE,
    user_name                   VARCHAR(100),
    password                    VARCHAR(255),
    email_from                  VARCHAR(100),
    email_from_display_name     VARCHAR(100),
    email_recipient             VARCHAR(255),
    email_cc                    VARCHAR(255),
    reply_to                    VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS guest_mandatory_data (
    guest_mandatory_data_id   SERIAL PRIMARY KEY,
    client_id                 VARCHAR(50) NOT NULL UNIQUE REFERENCES property(client_id),
    title_mandatory           BOOLEAN NOT NULL DEFAULT FALSE,
    first_name_mandatory      BOOLEAN NOT NULL DEFAULT TRUE,
    middle_name_mandatory     BOOLEAN NOT NULL DEFAULT FALSE,
    last_name_mandatory       BOOLEAN NOT NULL DEFAULT TRUE,
    suffix_mandatory          BOOLEAN NOT NULL DEFAULT FALSE,
    birth_date_mandatory      BOOLEAN NOT NULL DEFAULT FALSE,
    gender_mandatory          BOOLEAN NOT NULL DEFAULT FALSE,
    nationality_mandatory     BOOLEAN NOT NULL DEFAULT FALSE,
    greeting_letter_mandatory BOOLEAN NOT NULL DEFAULT FALSE,
    greeting_address_mandatory BOOLEAN NOT NULL DEFAULT FALSE,
    designation_mandatory     BOOLEAN NOT NULL DEFAULT FALSE,
    department_mandatory      BOOLEAN NOT NULL DEFAULT FALSE,
    company_mandatory         BOOLEAN NOT NULL DEFAULT FALSE,
    business_phone_mandatory  BOOLEAN NOT NULL DEFAULT FALSE,
    home_phone_mandatory      BOOLEAN NOT NULL DEFAULT FALSE,
    mobile_mandatory          BOOLEAN NOT NULL DEFAULT TRUE,
    fax_mandatory             BOOLEAN NOT NULL DEFAULT FALSE,
    business_address_mandatory BOOLEAN NOT NULL DEFAULT FALSE,
    business_city_mandatory   BOOLEAN NOT NULL DEFAULT FALSE,
    business_state_mandatory  BOOLEAN NOT NULL DEFAULT FALSE,
    business_zip_mandatory    BOOLEAN NOT NULL DEFAULT FALSE,
    business_country_mandatory BOOLEAN NOT NULL DEFAULT FALSE,
    home_address_mandatory    BOOLEAN NOT NULL DEFAULT FALSE,
    home_city_mandatory       BOOLEAN NOT NULL DEFAULT FALSE,
    home_state_mandatory      BOOLEAN NOT NULL DEFAULT FALSE,
    home_zip_mandatory        BOOLEAN NOT NULL DEFAULT FALSE,
    home_country_mandatory    BOOLEAN NOT NULL DEFAULT FALSE,
    business_email_mandatory  BOOLEAN NOT NULL DEFAULT FALSE,
    home_email_mandatory      BOOLEAN NOT NULL DEFAULT FALSE,
    credit_card_mandatory     BOOLEAN NOT NULL DEFAULT FALSE,
    other_document_mandatory  BOOLEAN NOT NULL DEFAULT FALSE,
    vehicle_mandatory         BOOLEAN NOT NULL DEFAULT FALSE,
    business_source_mandatory BOOLEAN NOT NULL DEFAULT FALSE,
    sign_mandatory_at_check_in BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS listview_setting (
    listview_setting_id    SERIAL PRIMARY KEY,
    client_id              VARCHAR(50) NOT NULL UNIQUE REFERENCES property(client_id),
    room_type              BOOLEAN NOT NULL DEFAULT TRUE,
    short_name             BOOLEAN NOT NULL DEFAULT FALSE,
    room_name              BOOLEAN NOT NULL DEFAULT TRUE,
    date_in                BOOLEAN NOT NULL DEFAULT TRUE,
    date_out               BOOLEAN NOT NULL DEFAULT TRUE,
    total_charges          BOOLEAN NOT NULL DEFAULT TRUE,
    amount_paid            BOOLEAN NOT NULL DEFAULT FALSE,
    balance_amount         BOOLEAN NOT NULL DEFAULT TRUE,
    blocked_room_remark    BOOLEAN NOT NULL DEFAULT FALSE,
    check_in_remark        BOOLEAN NOT NULL DEFAULT FALSE,
    in_house_remark        BOOLEAN NOT NULL DEFAULT FALSE,
    check_out_remark       BOOLEAN NOT NULL DEFAULT FALSE,
    payment_remark         BOOLEAN NOT NULL DEFAULT FALSE,
    guest_remark           BOOLEAN NOT NULL DEFAULT FALSE,
    special_request_remark BOOLEAN NOT NULL DEFAULT FALSE,
    folio_number           BOOLEAN NOT NULL DEFAULT TRUE,
    number_of_days         BOOLEAN NOT NULL DEFAULT FALSE,
    total_guest            BOOLEAN NOT NULL DEFAULT FALSE,
    address                BOOLEAN NOT NULL DEFAULT FALSE,
    phone_number           BOOLEAN NOT NULL DEFAULT TRUE,
    mobile_number          BOOLEAN NOT NULL DEFAULT FALSE,
    email                  BOOLEAN NOT NULL DEFAULT FALSE,
    company                BOOLEAN NOT NULL DEFAULT FALSE,
    authorized_amount      BOOLEAN NOT NULL DEFAULT FALSE,
    credit_card            BOOLEAN NOT NULL DEFAULT FALSE,
    driver_license         BOOLEAN NOT NULL DEFAULT FALSE,
    vehicle                BOOLEAN NOT NULL DEFAULT FALSE,
    passport               BOOLEAN NOT NULL DEFAULT FALSE,
    total_deposit          BOOLEAN NOT NULL DEFAULT FALSE,
    adr                    BOOLEAN NOT NULL DEFAULT FALSE,
    business_source        BOOLEAN NOT NULL DEFAULT FALSE,
    room_type_short_name   BOOLEAN NOT NULL DEFAULT FALSE,
    first_name             BOOLEAN NOT NULL DEFAULT TRUE,
    last_name              BOOLEAN NOT NULL DEFAULT TRUE,
    display_order          INTEGER NOT NULL DEFAULT 0
);

-- ===================== 4. DEVICE CONFIGURATION & CRS TAX EXEMPT =====================

CREATE TABLE IF NOT EXISTS payment_gateway (
    payment_gateway_id      SERIAL PRIMARY KEY,
    client_id               VARCHAR(50) NOT NULL REFERENCES property(client_id),
    payment_gateway_name    VARCHAR(50) NOT NULL,
    terminal_name           VARCHAR(50),
    terminal_id_sr_no_location_id VARCHAR(50),
    ip_address_reader_id    VARCHAR(50),
    port                    VARCHAR(10)
);

CREATE TABLE IF NOT EXISTS doorlock (
    doorlock_id         SERIAL PRIMARY KEY,
    client_id           VARCHAR(50) NOT NULL REFERENCES property(client_id),
    doorlock_name       VARCHAR(50) NOT NULL,
    no_of_key_card      INTEGER
);

CREATE TABLE IF NOT EXISTS doorlock_terminal_mapping (
    doorlock_terminal_id  SERIAL PRIMARY KEY,
    client_id             VARCHAR(50) NOT NULL REFERENCES property(client_id),
    doorlock_id           INTEGER NOT NULL REFERENCES doorlock(doorlock_id),
    terminal_name         VARCHAR(50) NOT NULL,
    ip_address            VARCHAR(50),
    port                  VARCHAR(10),
    CONSTRAINT uq_doorlock_terminal UNIQUE (doorlock_id, terminal_name)
);

CREATE TABLE IF NOT EXISTS scanner_configuration (
    scanner_id          SERIAL PRIMARY KEY,
    client_id           VARCHAR(50) NOT NULL REFERENCES property(client_id),
    id_scanner          VARCHAR(50),
    terminal_name       VARCHAR(50) NOT NULL,
    ip_address          VARCHAR(50),
    port                VARCHAR(10)
);

CREATE TABLE IF NOT EXISTS crs_tax_exempt (
    crs_tax_exempt_id   SERIAL PRIMARY KEY,
    client_id           VARCHAR(50) NOT NULL REFERENCES property(client_id),
    engine_name         VARCHAR(50) NOT NULL,
    market_source       VARCHAR(50),
    tax_id              INTEGER NOT NULL REFERENCES tax(tax_id),
    CONSTRAINT uq_crs_tax_exempt UNIQUE (client_id, engine_name, market_source, tax_id)
);

COMMIT;
