import { pool } from './pool.js';

export async function seedMultiTenantData() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('[Seed] Purging all old properties and tables...');

    // 0. Cleanly truncate all tables to remove all old properties
    await client.query(`
      TRUNCATE TABLE
        notification_item,
        audit_log,
        hotel_policy,
        guest_category,
        crs_tax_exempt,
        scanner_configuration,
        doorlock_terminal_mapping,
        doorlock,
        payment_gateway,
        listview_setting,
        guest_mandatory_data,
        general_setting_email,
        general_setting_credit_card,
        general_setting_folio,
        general_setting_display,
        general_setting_localization,
        general_setting_night_audit,
        general_setting_feature,
        general_setting_rental,
        policy,
        email_template,
        user_login_credential,
        app_user,
        role_module_access,
        role_privilege,
        exchange_rate,
        payment_type,
        measurement_unit,
        other_charges,
        other_charges_category,
        rate_type,
        tax_configuration,
        tax,
        room,
        room_status,
        room_type,
        floor,
        building,
        document_type,
        property
      CASCADE;
    `);

    console.log('[Seed] Adding the 2 requested properties: Destin Inn and Suite & Surat Marriott Hotel...');

    // 1. Insert the 2 new properties
    await client.query(`
      INSERT INTO property (
        client_id, property_name, region, address, city, state, url, latitude, longitude,
        country, postal_code, email, phone, currency, currency_symbol, star_rating, status,
        subscription_plan, subscription_status, billing_cycle, max_rooms, cap_theorem_model, isolation_level, active_cluster_node
      )
      VALUES 
        (
          'DIS_001', 
          'Destin Inn & Suites', 
          'na', 
          '713 Harbor Blvd', 
          'Destin', 
          'Florida', 
          'https://destininn.com/', 
          30.3935, 
          -86.4958,
          'United States', 
          '32541', 
          'info@destininn.com', 
          '+1 (850) 837-7326', 
          'USD', 
          '$', 
          4.0, 
          'operational',
          'Pro', 
          'active', 
          'monthly', 
          120, 
          'CP', 
          'database_and_storage_partition', 
          'us-east-cluster-01'
        ),
        (
          'STVMC_SURAT', 
          'Surat Marriott Hotel', 
          'apac', 
          'Ambika Niketan, Dumas Road', 
          'Surat', 
          'Gujarat', 
          'https://www.marriott.com/en-us/hotels/stvmc-surat-marriott-hotel/overview/?scid=f2ae0541-1279-4f24-b197-a979c79310b0', 
          21.1610, 
          72.7847,
          'India', 
          '395007', 
          'surat.marriott@marriott.com', 
          '+91 261 711 7000', 
          'INR', 
          '₹', 
          5.0, 
          'operational',
          'Enterprise', 
          'active', 
          'annually', 
          300, 
          'CP', 
          'database_and_storage_partition', 
          'apac-south-cluster-01'
        );
    `);

    // 2. Roles for DIS_001 & STVMC_SURAT
    await client.query(`
      INSERT INTO role_privilege (role_id, client_id, role_name, short_name, role_type, description)
      VALUES 
        (1, 'DIS_001', 'Property Administrator', 'Admin', 'ADMIN', 'Full administrative access to Destin Inn & Suites PMS'),
        (2, 'DIS_001', 'Front Desk Associate', 'FrontDesk', 'STAFF', 'Front desk and guest check-in operations for Destin Inn & Suites'),
        (3, 'STVMC_SURAT', 'General Manager & Director', 'GM', 'ADMIN', 'Executive command and PMS administration for Surat Marriott Hotel'),
        (4, 'STVMC_SURAT', 'Front Office Executive', 'FO-Exec', 'STAFF', 'Front desk and Marriott Bonvoy guest operations for Surat Marriott Hotel'),
        (5, 'DIS_001', 'General Manager', 'GM', 'ADMIN', 'Executive hotel operations, approvals, and performance oversight'),
        (6, 'DIS_001', 'Housekeeping Supervisor', 'HK-Sup', 'OPERATIONS', 'Room cleaning inspection, attendant task assignments, and linen inventory'),
        (7, 'DIS_001', 'Night Auditor', 'NightAudit', 'STAFF', 'End-of-day closing, rate audits, and night front desk service'),
        (8, 'DIS_001', 'Finance Controller', 'Finance', 'FINANCE', 'Ledger balancing, folio taxation, invoices, and accounting reconciliation'),
        (9, 'DIS_001', 'Front Desk Manager', 'FDM', 'STAFF', 'Daily shift supervision, check-in flow, and room allocation')
      ON CONFLICT (role_id) DO UPDATE SET
        role_name = EXCLUDED.role_name,
        short_name = EXCLUDED.short_name,
        role_type = EXCLUDED.role_type,
        description = EXCLUDED.description;
    `);

    // 3. Module Permissions
    const allModules = [
      'dashboard', 'reservation', 'front_desk', 'rate_availability', 'audit',
      'business_channels', 'guest', 'housekeeping', 'utility', 'reports', 'configuration'
    ];
    for (const mod of allModules) {
      await client.query(`INSERT INTO role_module_access (role_id, module_key) VALUES (1, $1), (3, $1), (5, $1), (8, $1) ON CONFLICT DO NOTHING;`, [mod]);
    }
    const staffModules = ['dashboard', 'reservation', 'front_desk', 'guest', 'housekeeping', 'reports'];
    for (const mod of staffModules) {
      await client.query(`INSERT INTO role_module_access (role_id, module_key) VALUES (2, $1), (4, $1), (6, $1), (7, $1), (9, $1) ON CONFLICT DO NOTHING;`, [mod]);
    }

    // 4. App Users & Logins (All 9 users for DIS_001 matching User Management)
    await client.query(`
      INSERT INTO app_user (user_id, client_id, role_id, user_name, description, is_active, phone, department, avatar_url, initials)
      VALUES 
        (1, 'DIS_001', 1, 'Jay Mistry', 'General Administrator & Lead Operator for Destin Inn & Suites', true, '+1 (850) 555-0100', 'Executive Administration', null, 'JM'),
        (2, 'DIS_001', 2, 'Sarah Jenkins', 'Front Desk Lead for Destin Inn & Suites', true, '+1 (850) 555-0101', 'Front Desk & Guest Services', null, 'SJ'),
        (3, 'STVMC_SURAT', 3, 'Rajesh Mehta', 'General Manager for Surat Marriott Hotel', true, '+91 261 555 0100', 'Hotel Executive Command', null, 'RM'),
        (4, 'STVMC_SURAT', 4, 'Priya Shah', 'Front Office Manager for Surat Marriott Hotel', true, '+91 261 555 0101', 'Front Office & Marriott Bonvoy', null, 'PS'),
        (5, 'DIS_001', 5, 'David Chen', 'General Hotel Operations & Property Manager', true, '+1 (850) 555-0102', 'General Hotel Operations', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBMrhzMyBThwFWkOminxngfS1TWXqmewRnJXbLUbWjUh-4M3YFgws71hGaREwvrP5cwMMi1mqWV7XoBisq8SwuwVZ-eF0PcNHiuzKgsR0moBR9PadOyJXsb4Bd7P4NPpST6Np6N6adBccfbZ91NZzO3vMC0wERlLxkpJUS7P9Fybj1jEX_4imtdKLmdc6m29vkoN-8ArCXnXncz_DCWBwLqSDI9D4E9kcCXy7Ok0EBFtIqQDl_xYUE3', 'DC'),
        (6, 'DIS_001', 2, 'Maria Rodriguez', 'Front Desk Receptionist & Guest Experience', true, '+1 (850) 555-0103', 'Front Desk & Guest Services', null, 'MR'),
        (7, 'DIS_001', 2, 'Emily Clark', 'Front Desk & Reservations Specialist', false, '+1 (850) 555-0104', 'Front Desk & Guest Services', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAOURQ24KYK8MwUGubNG1kwNaCIqxZj-UWJ-wWSef0lUU5-lN0GriIr75MOaxGx5P-e7UV26n5cHrX9qpnmamkkIAfAaAdwNi1mSGfJFsyuvRyPB-ckFLsDTCP016B9WyQIFqenQMWx7AIo3Xc1L22YVfIOpNh33YSQs_k9dZgibGM4iEfp2WLb1NWIx9B7q1f0wPe3VXK0Yqt8ITVhCSaxBd6iTjnJo--vPuaHRs7Xrk8zalRhyAY8', 'EC'),
        (8, 'DIS_001', 6, 'Carlos Mendez', 'Housekeeping Supervisor & Facilities Coordinator', true, '+1 (850) 555-0105', 'Housekeeping & Facilities', null, 'CM'),
        (9, 'DIS_001', 7, 'Alexandre Dumas', 'Night Auditor & Revenue Operations', true, '+1 (850) 555-0106', 'Night Auditing & Revenue', null, 'AD'),
        (10, 'DIS_001', 8, 'Priya Sharma', 'Finance Controller & Ledger Auditor', true, '+1 (850) 555-0107', 'Accounting & Payroll', null, 'PS'),
        (11, 'DIS_001', 9, 'Marcus Vance', 'Front Desk Operations Manager', true, '+1 (850) 555-0108', 'Front Desk Operations', null, 'MV')
      ON CONFLICT (user_id) DO UPDATE SET
        role_id = EXCLUDED.role_id,
        user_name = EXCLUDED.user_name,
        description = EXCLUDED.description,
        is_active = EXCLUDED.is_active,
        phone = EXCLUDED.phone,
        department = EXCLUDED.department,
        avatar_url = EXCLUDED.avatar_url,
        initials = EXCLUDED.initials;
    `);

    await client.query(`
      INSERT INTO user_login_credential (credential_id, user_id, username, email, login_email, password_hash, is_active)
      VALUES 
        (1, 1, 'jaymistry.destin', 'jaymistry1804@gmail.com', 'jaymistry1804@gmail.com', '$2b$10$stayos_mock_hash_destin_2026', true),
        (2, 2, 'sarah.destin', 'sarah.jenkins@destininn.com', 'sarah.jenkins@destininn.com', '$2b$10$stayos_mock_hash_destin_2026', true),
        (3, 3, 'rajesh.marriott', 'rajesh.mehta@marriott.com', 'rajesh.mehta@marriott.com', '$2b$10$stayos_mock_hash_marriott_2026', true),
        (4, 4, 'priya.marriott', 'priya.shah@marriott.com', 'priya.shah@marriott.com', '$2b$10$stayos_mock_hash_marriott_2026', true),
        (5, 5, 'david.destin', 'd.chen@destininn.com', 'd.chen@destininn.com', '$2b$10$stayos_mock_hash_destin_2026', true),
        (6, 6, 'maria.destin', 'm.rodriguez@destininn.com', 'm.rodriguez@destininn.com', '$2b$10$stayos_mock_hash_destin_2026', true),
        (7, 7, 'emily.destin', 'e.clark@destininn.com', 'e.clark@destininn.com', '$2b$10$stayos_mock_hash_destin_2026', false),
        (8, 8, 'carlos.destin', 'c.mendez@destininn.com', 'c.mendez@destininn.com', '$2b$10$stayos_mock_hash_destin_2026', true),
        (9, 9, 'alexandre.destin', 'a.dumas@destininn.com', 'a.dumas@destininn.com', '$2b$10$stayos_mock_hash_destin_2026', true),
        (10, 10, 'priyasharma.destin', 'p.sharma@destininn.com', 'p.sharma@destininn.com', '$2b$10$stayos_mock_hash_destin_2026', true),
        (11, 11, 'marcus.destin', 'm.vance@destininn.com', 'm.vance@destininn.com', '$2b$10$stayos_mock_hash_destin_2026', true)
      ON CONFLICT (user_id) DO UPDATE SET
        username = EXCLUDED.username,
        email = EXCLUDED.email,
        login_email = EXCLUDED.login_email,
        is_active = EXCLUDED.is_active;
    `);

    // 5. Buildings for DIS_001 (Destin Inn)
    const disBldRes = await client.query(`
      INSERT INTO building (client_id, building_name, description, code, status, total_floors, total_rooms, has_active_rooms)
      VALUES 
        ('DIS_001', 'Harbor Wing', 'Primary waterfront hotel wing facing Destin Harbor marina and boardwalk.', 'BLD-HARBOR', 'active', 3, 48, true),
        ('DIS_001', 'Gulf Breeze Annex', 'Quiet coastal accommodations with direct access to outdoor pool.', 'BLD-GULF', 'active', 2, 32, true)
      RETURNING building_id, building_name;
    `);

    const harborWingId = disBldRes.rows.find(r => r.building_name === 'Harbor Wing')?.building_id;
    const gulfBreezeId = disBldRes.rows.find(r => r.building_name === 'Gulf Breeze Annex')?.building_id;

    // Floors for Harbor Wing
    const disFlr1 = await client.query(`
      INSERT INTO floor (client_id, building_id, floor_name, floor_number, description, status, total_rooms)
      VALUES 
        ('DIS_001', $1, 'Harbor Walk Level', 1, 'Ground level rooms with patio direct access to marina boardwalk', 'active', 16),
        ('DIS_001', $1, 'Harbor View Level', 2, 'Second floor with private balconies overlooking the harbor', 'active', 16),
        ('DIS_001', $1, 'Sunset Deck Level', 3, 'Top floor featuring unobstructed views of East Pass sunset', 'active', 16)
      RETURNING floor_id, floor_name;
    `, [harborWingId]);

    // Floors for Gulf Breeze Annex
    const disFlr2 = await client.query(`
      INSERT INTO floor (client_id, building_id, floor_name, floor_number, description, status, total_rooms)
      VALUES 
        ('DIS_001', $1, 'Palm Court Floor 1', 1, 'Courtyard level opening toward the outdoor garden and pool cabanas', 'active', 16),
        ('DIS_001', $1, 'Emerald Floor 2', 2, 'Upper annex level with coastal breeze views', 'active', 16)
      RETURNING floor_id, floor_name;
    `, [gulfBreezeId]);

    const disFloor1Id = disFlr1.rows[0].floor_id;
    const disFloor2Id = disFlr1.rows[1].floor_id;
    const disFloor3Id = disFlr1.rows[2].floor_id;
    const disAnnex1Id = disFlr2.rows[0].floor_id;
    const disAnnex2Id = disFlr2.rows[1].floor_id;

    // Room Types for Destin Inn & Suites
    const disRtRes = await client.query(`
      INSERT INTO room_type (
        client_id, floor_id, building_id, short_name, room_type_name, room_type_color, description,
        over_booking, allow_in_occupancy, is_crs, category, base_rate, extra_adult_rate, extra_child_rate,
        capacity, max_adults, max_children, bed_type, bed_count, extra_bed_allowed, max_extra_beds,
        size_sqm, size_sqft, view_type, smoking_policy, is_accessible, status
      )
      VALUES 
        ('DIS_001', $1, $2, 'STD-KNG', 'Standard King Room', '#2563EB', 'Comfortable king bed with work desk, microwave, mini-fridge, and harbor access.', 1, true, true, 'Standard', 129.00, 20.00, 10.00, 2, 2, 1, 'King Bed', 1, false, 0, 32.0, 345, 'City / Garden', 'Non-Smoking', false, 'active'),
        ('DIS_001', $1, $2, 'DBL-DBL', 'Two Double Beds', '#0D9488', 'Spacious double bed configuration ideal for vacationing families visiting Destin beaches.', 2, true, true, 'Standard', 149.00, 25.00, 15.00, 4, 4, 2, 'Double Beds', 2, true, 1, 36.0, 388, 'Courtyard Pool', 'Non-Smoking', false, 'active'),
        ('DIS_001', $3, $2, 'DLX-HBR', 'Deluxe Harbor View Suite', '#D97706', 'Premium suite with private balcony, plush king bed, sleeper sofa, and harbor panorama.', 1, true, true, 'Suite', 189.00, 30.00, 15.00, 3, 3, 2, 'King Bed + Sofa', 2, true, 1, 48.0, 516, 'Marina Harbor View', 'Non-Smoking', false, 'active'),
        ('DIS_001', $1, $2, 'ADA-KNG', 'Accessible King Room', '#7C3AED', 'ADA accessible king room with roll-in shower, wide doorways, and grab bars.', 0, true, true, 'Standard', 129.00, 20.00, 10.00, 2, 2, 1, 'King Bed', 1, false, 0, 34.0, 366, 'Courtyard', 'Non-Smoking', true, 'active')
      RETURNING room_type_id, short_name;
    `, [disFloor1Id, harborWingId, disFloor3Id]);

    const stdKngId = disRtRes.rows.find(r => r.short_name === 'STD-KNG')?.room_type_id;
    const dblDblId = disRtRes.rows.find(r => r.short_name === 'DBL-DBL')?.room_type_id;
    const dlxHbrId = disRtRes.rows.find(r => r.short_name === 'DLX-HBR')?.room_type_id;
    const adaKngId = disRtRes.rows.find(r => r.short_name === 'ADA-KNG')?.room_type_id;

    // Rooms for Destin Inn & Suites
    await client.query(`
      INSERT INTO room (client_id, room_type_id, floor_id, building_id, room_name, short_name, room_number, status, rate, is_hourly_rental, is_smoking, is_handicap, is_pet_allowed)
      VALUES 
        ('DIS_001', $1, $2, $3, 'Room 101 - Harbor Walk King', '101', '101', 'available', 129.00, false, false, false, false),
        ('DIS_001', $4, $2, $3, 'Room 102 - Accessible King', '102', '102', 'available', 129.00, false, false, true, false),
        ('DIS_001', $5, $2, $3, 'Room 103 - Harbor Double Double', '103', '103', 'occupied', 149.00, false, false, false, true),
        ('DIS_001', $5, $2, $3, 'Room 104 - Harbor Double Double', '104', '104', 'available', 149.00, false, false, false, true),
        ('DIS_001', $1, $6, $3, 'Room 201 - Harbor View King', '201', '201', 'available', 139.00, false, false, false, false),
        ('DIS_001', $5, $6, $3, 'Room 202 - Harbor Family Double', '202', '202', 'occupied', 159.00, false, false, false, false),
        ('DIS_001', $7, $8, $3, 'Room 301 - Top Deck Sunset Suite', '301', '301', 'available', 189.00, false, false, false, false),
        ('DIS_001', $7, $8, $3, 'Room 302 - Harbor Panorama Suite', '302', '302', 'clean', 189.00, false, false, false, false),
        ('DIS_001', $1, $9, $10, 'Room G-101 - Palm Garden King', 'G-101', 'G-101', 'available', 124.00, false, false, false, true),
        ('DIS_001', $5, $9, $10, 'Room G-102 - Palm Poolside Double', 'G-102', 'G-102', 'available', 144.00, false, false, false, true),
        ('DIS_001', $1, $11, $10, 'Room G-201 - Emerald Breeze King', 'G-201', 'G-201', 'available', 129.00, false, false, false, false),
        ('DIS_001', $5, $11, $10, 'Room G-202 - Emerald Breeze Double', 'G-202', 'G-202', 'clean', 149.00, false, false, false, false);
    `, [
      stdKngId, disFloor1Id, harborWingId,
      adaKngId,
      dblDblId,
      disFloor2Id,
      dlxHbrId, disFloor3Id,
      disAnnex1Id, gulfBreezeId,
      disAnnex2Id
    ]);

    // Taxes for Destin Inn & Suites
    await client.query(`
      INSERT INTO tax (client_id, tax_name, code, description, tax_type, per_day_tax, per_stay_tax, rule_type, tax_value, rate_percentage, application_method, calculation_strategy, jurisdiction, effective_date, is_active)
      VALUES 
        ('DIS_001', 'Florida State Sales Tax', 'FL-ST-06', 'Florida standard mandatory lodging sales tax', 'percentage', true, false, 'percentage', 6.00, 6.00, 'per_night', 'exclusive', 'State of Florida', '2024-01-01', true),
        ('DIS_001', 'Okaloosa Tourist Development Tax', 'OK-TDT-05', 'Okaloosa County bed and tourist development tax (TDT)', 'percentage', true, false, 'percentage', 5.00, 5.00, 'per_night', 'exclusive', 'Okaloosa County', '2024-01-01', true),
        ('DIS_001', 'Destin City Municipal Surtax', 'DST-SUR-01', 'Destin municipal infrastructure and emergency service fee', 'percentage', true, false, 'percentage', 1.00, 1.00, 'per_night', 'exclusive', 'City of Destin', '2024-01-01', true);
    `);

    // Rate Types for Destin Inn & Suites
    await client.query(`
      INSERT INTO rate_type (client_id, short_name, rate_type_name, code, market_code, meal_plan, is_active)
      VALUES 
        ('DIS_001', 'BAR', 'Best Available Rate (BAR)', 'BAR-FLEX', 'RETAIL', 'Room Only', true),
        ('DIS_001', 'AAA', 'AAA / AARP Senior Discount', 'AAA-SENIOR', 'DISCOUNT', 'Room Only', true),
        ('DIS_001', 'PKG', 'Emerald Coast Summer Getaway', 'SUMMER-PKG', 'PROMO', 'Continental Breakfast Included', true),
        ('DIS_001', 'GOV', 'Government & Military Per Diem', 'GOV-MIL', 'GOVERNMENT', 'Room Only', true);
    `);

    // Policies for Destin Inn & Suites
    await client.query(`
      INSERT INTO hotel_policy (policy_id, client_id, title, category, description, is_active)
      VALUES 
        ('HP_DIS_01', 'DIS_001', '48-Hour Cancellation Guarantee', 'cancellation', 'Cancellations received 48 hours prior to check-in (3 PM) are fully refundable without penalty.', true),
        ('HP_DIS_02', 'DIS_001', '100% Smoke-Free Property Policy', 'house_rules', 'Strict non-smoking policy enforced inside all guest rooms and balconies. $250 cleaning fee applies for violations.', true),
        ('HP_DIS_03', 'DIS_001', 'Designated Pet-Friendly Rooms Only', 'pet', 'Pets under 40 lbs permitted exclusively in designated Gulf Breeze Annex ground floor rooms with a $35/night pet fee.', true),
        ('HP_DIS_04', 'DIS_001', 'Standard Check-in & Departure', 'checkin_checkout', 'Check-in time starts at 3:00 PM CST. Check-out time is strictly 11:00 AM CST.', true);
    `);

    // Guest Categories for Destin Inn & Suites
    await client.query(`
      INSERT INTO guest_category (client_id, category_name, short_name, description, is_highlight, color_code)
      VALUES 
        ('DIS_001', 'Direct Web Booker', 'DIR-WEB', 'Guests booking directly on destininn.com with complimentary parking', false, '#3B82F6'),
        ('DIS_001', 'Snowbird Winter Resident', 'SNOWBIRD', 'Extended stay guests residing during winter months', false, '#0D9488'),
        ('DIS_001', 'Active Military & Veterans', 'MIL-VET', 'US Armed Forces active duty and veteran personnel', false, '#059669'),
        ('DIS_001', 'VIP Coastal Club', 'VIP-CST', 'Loyal returning guests with complimentary room upgrades', true, '#EAB308');
    `);

    // Payment Types for Destin Inn & Suites
    await client.query(`
      INSERT INTO payment_type (client_id, short_name, payment_type_name, category_name, description, credit_card_processing)
      VALUES 
        ('DIS_001', 'VISA', 'Visa Card', 'Credit Card', 'Major credit card network', true),
        ('DIS_001', 'MC', 'MasterCard', 'Credit Card', 'Major credit card network', true),
        ('DIS_001', 'AMEX', 'American Express', 'Credit Card', 'Corporate & premium cards', true),
        ('DIS_001', 'CASH', 'Cash USD', 'Cash', 'Front desk cash transactions', false);
    `);

    // Document Types for Destin Inn & Suites
    await client.query(`
      INSERT INTO document_type (client_id, short_name, document_name, document_category, description, is_default)
      VALUES 
        ('DIS_001', 'DL', 'State Driver License', 'Government ID', 'US State issued driver license', true),
        ('DIS_001', 'PASSPORT', 'Passport', 'Government ID', 'International or US passport', false);
    `);

    // 6. Buildings for STVMC_SURAT (Surat Marriott Hotel)
    const suratBldRes = await client.query(`
      INSERT INTO building (client_id, building_name, description, code, status, total_floors, total_rooms, has_active_rooms)
      VALUES 
        ('STVMC_SURAT', 'Tapi River Tower', 'Flagship 9-story luxury tower offering scenic waterfront views of the Tapi River.', 'BLD-TAPI', 'active', 9, 96, true),
        ('STVMC_SURAT', 'Diamond Executive Wing', 'Exclusive 5-story executive wing dedicated to Surat business leaders and Marriott Bonvoy Elite guests.', 'BLD-DIAMOND', 'active', 5, 60, true)
      RETURNING building_id, building_name;
    `);

    const tapiTowerId = suratBldRes.rows.find(r => r.building_name === 'Tapi River Tower')?.building_id;
    const diamondWingId = suratBldRes.rows.find(r => r.building_name === 'Diamond Executive Wing')?.building_id;

    // Floors for Tapi River Tower
    const suratFlr1 = await client.query(`
      INSERT INTO floor (client_id, building_id, floor_name, floor_number, description, status, total_rooms)
      VALUES 
        ('STVMC_SURAT', $1, 'Lobby & Table One Dining', 1, 'Grand reception, concierge desk, business centre, and all-day dining restaurant', 'active', 0),
        ('STVMC_SURAT', $1, 'Tapi Floor 2', 2, 'Deluxe guest accommodations with garden and pool view', 'active', 16),
        ('STVMC_SURAT', $1, 'Tapi Floor 3', 3, 'Deluxe guest rooms and junior suites', 'active', 16),
        ('STVMC_SURAT', $1, 'Tapi Riverfront Floor 5', 5, 'Mid-level panoramic rooms overlooking the sacred Tapi River', 'active', 16),
        ('STVMC_SURAT', $1, 'Tapi Panorama Floor 8', 8, 'High-floor premium river view rooms with expansive vistas', 'active', 16)
      RETURNING floor_id, floor_name;
    `, [tapiTowerId]);

    // Floors for Diamond Wing
    const suratFlr2 = await client.query(`
      INSERT INTO floor (client_id, building_id, floor_name, floor_number, description, status, total_rooms)
      VALUES 
        ('STVMC_SURAT', $1, 'Executive Floor 1', 1, 'Executive king rooms with high-speed corporate workstation facilities', 'active', 15),
        ('STVMC_SURAT', $1, 'Executive Floor 2', 2, 'Corporate business rooms with express laundry amenities', 'active', 15),
        ('STVMC_SURAT', $1, 'M Club Lounge Level 3', 3, 'Dedicated Marriott Bonvoy M Club lounge and club suites', 'active', 15),
        ('STVMC_SURAT', $1, 'Presidential Penthouse Level 4', 4, 'Exclusive top floor hosting the Presidential Suite and luxury boardrooms', 'active', 15)
      RETURNING floor_id, floor_name;
    `, [diamondWingId]);

    const tapiLobbyId = suratFlr1.rows[0].floor_id;
    const tapiFlr2Id = suratFlr1.rows[1].floor_id;
    const tapiFlr3Id = suratFlr1.rows[2].floor_id;
    const tapiFlr5Id = suratFlr1.rows[3].floor_id;
    const tapiFlr8Id = suratFlr1.rows[4].floor_id;

    const diamondFlr1Id = suratFlr2.rows[0].floor_id;
    const diamondFlr2Id = suratFlr2.rows[1].floor_id;
    const diamondFlr3Id = suratFlr2.rows[2].floor_id;
    const diamondFlr4Id = suratFlr2.rows[3].floor_id;

    // Room Types for Surat Marriott Hotel
    const suratRtRes = await client.query(`
      INSERT INTO room_type (
        client_id, floor_id, building_id, short_name, room_type_name, room_type_color, description,
        over_booking, allow_in_occupancy, is_crs, category, base_rate, extra_adult_rate, extra_child_rate,
        capacity, max_adults, max_children, bed_type, bed_count, extra_bed_allowed, max_extra_beds,
        size_sqm, size_sqft, view_type, smoking_policy, is_accessible, status
      )
      VALUES 
        ('STVMC_SURAT', $1, $2, 'DLX-TAPI', 'Deluxe Guest Room', '#3B82F6', 'Contemporary 38-sqm luxury room with plush Marriott Revive bedding and marble bathroom.', 3, true, true, 'Deluxe', 7500.00, 1500.00, 750.00, 3, 3, 1, '1 King or 2 Twin Beds', 1, true, 1, 38.0, 409, 'City & Pool View', 'Non-Smoking', false, 'active'),
        ('STVMC_SURAT', $3, $2, 'PRM-RVR', 'Tapi River View Premier Room', '#059669', 'Scenic 42-sqm waterfront room offering sweeping vistas of the Tapi River and Dumas Road.', 2, true, true, 'Premier', 9200.00, 1800.00, 900.00, 3, 3, 1, 'King Bed', 1, true, 1, 42.0, 452, 'Tapi River Waterfront', 'Non-Smoking', false, 'active'),
        ('STVMC_SURAT', $4, $5, 'EXEC-CLB', 'Executive M Club Room', '#7C3AED', 'Sophisticated business room on M Club level with complimentary breakfast, evening drinks, and private lounge access.', 2, true, true, 'Club', 11500.00, 2000.00, 1000.00, 2, 2, 1, 'King Bed', 1, true, 1, 46.0, 495, 'Skyline & River', 'Non-Smoking', false, 'active'),
        ('STVMC_SURAT', $6, $5, 'PRES-STE', 'Presidential Luxury Suite', '#DC2626', 'Palatial 110-sqm suite with expansive master bedroom, separate dining hall, pantry, and private butler service.', 1, true, true, 'Suite', 25000.00, 3500.00, 1500.00, 4, 4, 2, 'Luxury Master King', 1, true, 2, 110.0, 1184, 'Panoramic Tapi River', 'Non-Smoking', true, 'active')
      RETURNING room_type_id, short_name;
    `, [tapiFlr2Id, tapiTowerId, tapiFlr5Id, diamondFlr3Id, diamondWingId, diamondFlr4Id]);

    const dlxTapiId = suratRtRes.rows.find(r => r.short_name === 'DLX-TAPI')?.room_type_id;
    const prmRvrId = suratRtRes.rows.find(r => r.short_name === 'PRM-RVR')?.room_type_id;
    const execClbId = suratRtRes.rows.find(r => r.short_name === 'EXEC-CLB')?.room_type_id;
    const presSteId = suratRtRes.rows.find(r => r.short_name === 'PRES-STE')?.room_type_id;

    // Rooms for Surat Marriott Hotel
    await client.query(`
      INSERT INTO room (client_id, room_type_id, floor_id, building_id, room_name, short_name, room_number, status, rate, is_hourly_rental, is_smoking, is_handicap, is_pet_allowed)
      VALUES 
        ('STVMC_SURAT', $1, $2, $3, 'Room 201 - Deluxe City King', '201', '201', 'available', 7500.00, false, false, false, false),
        ('STVMC_SURAT', $1, $2, $3, 'Room 202 - Deluxe Twin Beds', '202', '202', 'occupied', 7500.00, false, false, false, false),
        ('STVMC_SURAT', $1, $4, $3, 'Room 301 - Deluxe Pool View', '301', '301', 'available', 7800.00, false, false, false, false),
        ('STVMC_SURAT', $5, $6, $3, 'Room 501 - Tapi Riverfront Premier', '501', '501', 'available', 9200.00, false, false, false, false),
        ('STVMC_SURAT', $5, $6, $3, 'Room 502 - Tapi Riverfront Premier', '502', '502', 'occupied', 9200.00, false, false, false, false),
        ('STVMC_SURAT', $5, $7, $3, 'Room 801 - Tapi Panoramic High Floor', '801', '801', 'available', 9800.00, false, false, false, false),
        ('STVMC_SURAT', $8, $9, $10, 'Room D-101 - Diamond Executive King', 'D-101', 'D-101', 'available', 10500.00, false, false, false, false),
        ('STVMC_SURAT', $8, $11, $10, 'Room D-201 - Diamond Executive Business', 'D-201', 'D-201', 'available', 10500.00, false, false, false, false),
        ('STVMC_SURAT', $8, $12, $10, 'Room D-301 - M Club Luxury King', 'D-301', 'D-301', 'occupied', 11500.00, false, false, false, false),
        ('STVMC_SURAT', $8, $12, $10, 'Room D-302 - M Club River Suite', 'D-302', 'D-302', 'available', 12500.00, false, false, false, false),
        ('STVMC_SURAT', $13, $14, $10, 'Suite D-401 - Surat Presidential Suite', 'D-401', 'D-401', 'clean', 25000.00, false, false, true, false);
    `, [
      dlxTapiId, tapiFlr2Id, tapiTowerId,
      tapiFlr3Id,
      prmRvrId, tapiFlr5Id,
      tapiFlr8Id,
      execClbId, diamondFlr1Id, diamondWingId,
      diamondFlr2Id,
      diamondFlr3Id,
      presSteId, diamondFlr4Id
    ]);

    // Taxes for Surat Marriott Hotel
    await client.query(`
      INSERT INTO tax (client_id, tax_name, code, description, tax_type, per_day_tax, per_stay_tax, rule_type, tax_value, rate_percentage, application_method, calculation_strategy, jurisdiction, effective_date, is_active)
      VALUES 
        ('STVMC_SURAT', 'GST - Room Tariff Below ₹7,500', 'GST-12', 'Goods and Services Tax (CGST 6% + SGST 6%) for standard room tariff', 'percentage', true, false, 'percentage', 12.00, 12.00, 'per_night', 'exclusive', 'Government of India & Gujarat', '2024-01-01', true),
        ('STVMC_SURAT', 'GST - Luxury Room Tariff ₹7,500+', 'GST-18', 'Goods and Services Tax (CGST 9% + SGST 9%) for premium & luxury hotel rooms', 'percentage', true, false, 'percentage', 18.00, 18.00, 'per_night', 'exclusive', 'Government of India & Gujarat', '2024-01-01', true),
        ('STVMC_SURAT', 'F&B Restaurant Dining GST', 'GST-FB-05', 'Goods and Services Tax on food and beverage consumption at Table One', 'percentage', true, false, 'percentage', 5.00, 5.00, 'per_night', 'exclusive', 'Government of India & Gujarat', '2024-01-01', true);
    `);

    // Rate Types for Surat Marriott Hotel
    await client.query(`
      INSERT INTO rate_type (client_id, short_name, rate_type_name, code, market_code, meal_plan, is_active)
      VALUES 
        ('STVMC_SURAT', 'MRB', 'Marriott Bonvoy Member Flexible Rate', 'MR-BONVOY', 'LOYALTY', 'Room Only + Free WiFi', true),
        ('STVMC_SURAT', 'SDB', 'Surat Diamond Bourse Corporate Rate', 'SDB-CORP', 'CORPORATE', 'Buffet Breakfast at Table One', true),
        ('STVMC_SURAT', 'DINE', 'Stay & Dine Breakfast Package', 'PKG-DINE', 'LEISURE', 'Bed & Breakfast (Table One)', true),
        ('STVMC_SURAT', 'ADV', 'Advance Purchase - Non Refundable', 'ADV-NONREF', 'PROMO', 'Room Only', true);
    `);

    // Policies for Surat Marriott Hotel
    await client.query(`
      INSERT INTO hotel_policy (policy_id, client_id, title, category, description, is_active)
      VALUES 
        ('HP_SURAT_01', 'STVMC_SURAT', 'Marriott Flexible 24-Hour Cancellation', 'cancellation', 'Modify or cancel reservation up to 24 hours prior to standard arrival time (3:00 PM IST) without penalty.', true),
        ('HP_SURAT_02', 'STVMC_SURAT', 'State Prohibition & Dry State Compliance', 'house_rules', 'Surat is located in Gujarat, a dry state. Alcohol consumption requires an official tourist/visitor permit issued by Gujarat Tourism.', true),
        ('HP_SURAT_03', 'STVMC_SURAT', 'Mandatory Government Photo ID Policy', 'checkin_checkout', 'All domestic guests must present a valid Aadhaar, Passport, or Driving License. Foreign nationals require valid passport & Indian visa.', true),
        ('HP_SURAT_04', 'STVMC_SURAT', 'Check-in & Check-out Standards', 'checkin_checkout', 'Check-in starts at 3:00 PM IST. Standard check-out is 12:00 PM noon IST. Late check-out subject to Marriott Bonvoy Elite status.', true);
    `);

    // Guest Categories for Surat Marriott Hotel
    await client.query(`
      INSERT INTO guest_category (client_id, category_name, short_name, description, is_highlight, color_code)
      VALUES 
        ('STVMC_SURAT', 'Marriott Bonvoy Titanium & Ambassador Elite', 'MR-TITANIUM', 'Highest tier Marriott Bonvoy members receiving 4 PM checkout and lounge privileges', true, '#7C3AED'),
        ('STVMC_SURAT', 'Surat Diamond Bourse Delegate', 'SDB-DELEGATE', 'Diamond traders and visiting international gemological gem dealers', true, '#0284C7'),
        ('STVMC_SURAT', 'Textile & Industrial Corporate Leader', 'CORP-TEXTILE', 'Executive partners from Hazira and Surat textile manufacturing clusters', false, '#475569'),
        ('STVMC_SURAT', 'Destination Wedding & Family Leisure', 'WED-LEISURE', 'Families visiting for banquet celebrations and Dumas waterfront vacations', false, '#DB2777');
    `);

    // Payment Types for Surat Marriott Hotel
    await client.query(`
      INSERT INTO payment_type (client_id, short_name, payment_type_name, category_name, description, credit_card_processing)
      VALUES 
        ('STVMC_SURAT', 'UPI', 'UPI / QR Instant Pay', 'Digital', 'Instant BHIM UPI, GPay, PhonePe QR payment', false),
        ('STVMC_SURAT', 'VISA', 'Visa International', 'Credit Card', 'Chip & Pin / Contactless card', true),
        ('STVMC_SURAT', 'MC', 'MasterCard International', 'Credit Card', 'Chip & Pin / Contactless card', true),
        ('STVMC_SURAT', 'AMEX', 'American Express India', 'Credit Card', 'Corporate and Bonvoy charge card', true),
        ('STVMC_SURAT', 'CASH', 'Indian Rupees Cash', 'Cash', 'Front desk cash transactions', false);
    `);

    // Document Types for Surat Marriott Hotel
    await client.query(`
      INSERT INTO document_type (client_id, short_name, document_name, document_category, description, is_default)
      VALUES 
        ('STVMC_SURAT', 'AADHAAR', 'Aadhaar Card', 'Government ID', 'UIDAI 12-digit biometric ID', true),
        ('STVMC_SURAT', 'PASSPORT', 'Passport & Visa', 'Government ID', 'Mandatory for foreign national arrivals', false),
        ('STVMC_SURAT', 'PAN', 'PAN Card', 'Tax Identification', 'Income Tax department identification', false);
    `);

    // 7. Seed Audit Logs for both properties
    await client.query(`
      INSERT INTO audit_log (log_id, client_id, user_name, action, module, details)
      VALUES 
        ('LOG_DIS_01', 'DIS_001', 'Jay Mistry', 'UPDATE', 'property', 'Initialized Destin Inn & Suites PMS configuration with 2 buildings and 80 rooms.'),
        ('LOG_DIS_02', 'DIS_001', 'System Cluster', 'SYNC', 'cluster', 'Verified CP CAP model partition on us-east-cluster-01.'),
        ('LOG_SURAT_01', 'STVMC_SURAT', 'Rajesh Mehta', 'UPDATE', 'property', 'Configured Surat Marriott Hotel on Dumas Road with Tapi Tower & Diamond Wing.'),
        ('LOG_SURAT_02', 'STVMC_SURAT', 'System Cluster', 'SYNC', 'cluster', 'Synchronized Marriott Bonvoy interface with apac-south-cluster-01.');
    `);

    // 8. Seed Notifications for both properties
    await client.query(`
      INSERT INTO notification_item (notification_id, client_id, title, message, type, is_read)
      VALUES 
        ('NOTIF_DIS_01', 'DIS_001', 'PMS Initialization Complete', 'Destin Inn & Suites (destininn.com) is operational on StayOS cloud.', 'system', false),
        ('NOTIF_DIS_02', 'DIS_001', 'High Season Occupancy Forecast', 'Upcoming weekend occupancy reaches 84.5% across Harbor Wing and Gulf Breeze Annex.', 'occupancy', false),
        ('NOTIF_SURAT_01', 'STVMC_SURAT', 'Welcome to Surat Marriott Hotel', 'Tapi River Tower and Diamond Executive Wing synchronized with Marriott Bonvoy.', 'system', false),
        ('NOTIF_SURAT_02', 'STVMC_SURAT', 'Diamond Bourse Corporate Arrivals', '32 delegates arriving today for the Surat International Gem Exhibition.', 'reservation', false);
    `);

    await client.query('COMMIT');
    console.log('[Seed] Database successfully cleared of all old properties and populated with the 2 new properties!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Seed Error]:', err);
    throw err;
  } finally {
    client.release();
  }
}

// Run if executed directly
if (process.argv[1] && process.argv[1].includes('seed_multi_tenant_data.js')) {
  seedMultiTenantData().then(() => process.exit(0)).catch(() => process.exit(1));
}
