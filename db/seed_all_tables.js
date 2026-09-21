import { pool } from './pool.js';

export async function seedAllTables() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('[Seed All Tables] Seeding missing table values for Property 10001 & 10002...');

    // 1. Tax Configurations (for tax table)
    const taxesRes = await client.query(`SELECT tax_id, client_id, tax_value, rate_percentage FROM tax`);
    for (const t of taxesRes.rows) {
      const rateVal = parseFloat(t.tax_value || t.rate_percentage || 0);
      await client.query(`
        INSERT INTO tax_configuration (client_id, tax_id, rate, from_date, last_date, is_active)
        VALUES ($1, $2, $3, '2024-01-01', '2030-12-31', true)
        ON CONFLICT DO NOTHING
      `, [t.client_id, t.tax_id, rateVal]);
    }

    // 2. Measurement Units
    const measurementUnits = [
      { code: 'KG', name: 'Kilogram', desc: 'Weight measurement for bulk laundry, linen, and kitchen items' },
      { code: 'L', name: 'Liter', desc: 'Liquid volume measurement for cleaning chemicals, oils, and beverages' },
      { code: 'PC', name: 'Piece', desc: 'Count for individual guest room amenities, towels, and retail items' },
      { code: 'NIGHT', name: 'Night', desc: 'Unit of stay duration for room rental and recurring service charges' },
      { code: 'HOUR', name: 'Hour', desc: 'Hourly rental basis for conference suites, banquet halls, and early check-in' },
      { code: 'SET', name: 'Set', desc: 'Packaged bundle units for bedding sets and toiletry kits' },
    ];
    for (const cid of [10001, 10002]) {
      for (const mu of measurementUnits) {
        await client.query(`
          INSERT INTO measurement_unit (client_id, measurement, short_name, description)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT DO NOTHING
        `, [cid, mu.name, mu.code, mu.desc]);
      }
    }

    // 3. Other Charge Categories & Other Charges
    const chargeCategories = [
      { code: 'FB', name: 'Food & Beverage', desc: 'Restaurant, minibar, poolside café, and room service dining charges', isDefault: true },
      { code: 'LDY', name: 'Laundry & Valet', desc: 'Guest dry cleaning, laundry press, and express shoe shine services', isDefault: false },
      { code: 'SPA', name: 'Spa & Wellness', desc: 'Ayurvedic treatments, full body massages, and wellness club facility fees', isDefault: false },
      { code: 'TRANS', name: 'Transportation', desc: 'Chauffeured airport transfers, city tours, and valet parking surcharges', isDefault: false },
      { code: 'FEES', name: 'Fees & Surcharges', desc: 'Resort facility fees, late check-out penalties, and extra rollaway bed charges', isDefault: false },
    ];

    for (const cid of [10001, 10002]) {
      for (const cat of chargeCategories) {
        const catRes = await client.query(`
          INSERT INTO other_charges_category (client_id, short_name, category_name, description, is_default)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING occ_id
        `, [cid, cat.code, cat.name, cat.desc, cat.isDefault]);
        const occId = catRes.rows[0].occ_id;

        if (cat.code === 'FB') {
          await client.query(`
            INSERT INTO other_charges (client_id, occ_id, short_name, charge_name, taxable, always_charge, reoccur_charge, crs_charge, pos_charge, forecasting_revenue)
            VALUES 
              ($1, $2, 'B-FAST', 'Gourmet Buffet Breakfast', true, false, false, true, true, true),
              ($1, $2, 'MINI-BAR', 'Deluxe In-Room Mini Bar', true, false, false, false, true, true),
              ($1, $2, 'HIGH-TEA', 'Afternoon Royal High Tea', true, false, false, true, true, true)
          `, [cid, occId]);
        } else if (cat.code === 'SPA') {
          await client.query(`
            INSERT INTO other_charges (client_id, occ_id, short_name, charge_name, taxable, always_charge, reoccur_charge, crs_charge, pos_charge, forecasting_revenue)
            VALUES 
              ($1, $2, 'SWEDISH', 'Swedish Full-Body Massage (60m)', true, false, false, true, true, true),
              ($1, $2, 'HYDRO', 'Hydrotherapy & Thermal Suite Access', true, false, false, false, true, true)
          `, [cid, occId]);
        } else if (cat.code === 'FEES') {
          await client.query(`
            INSERT INTO other_charges (client_id, occ_id, short_name, charge_name, taxable, always_charge, reoccur_charge, reoccur_frequency, crs_charge, pos_charge, forecasting_revenue)
            VALUES 
              ($1, $2, 'RESORT', 'Daily Resort Facility Fee', true, true, true, 1, true, false, true),
              ($1, $2, 'LATE-CO', 'Late Departure Fee (after 2 PM)', true, false, false, null, false, true, true)
          `, [cid, occId]);
        } else if (cat.code === 'TRANS') {
          await client.query(`
            INSERT INTO other_charges (client_id, occ_id, short_name, charge_name, taxable, always_charge, reoccur_charge, crs_charge, pos_charge, forecasting_revenue)
            VALUES 
              ($1, $2, 'AIR-XFER', 'Luxury Airport Transfer', true, false, false, true, true, true),
              ($1, $2, 'VALET', 'Overnight Valet Parking', false, false, true, true, false, true)
          `, [cid, occId]);
        }
      }
    }

    // 4. Exchange Rates
    await client.query(`
      INSERT INTO exchange_rate (client_id, country_name, currency_name, currency_sign, rate, is_base_rate)
      VALUES 
        (10001, 'United States', 'US Dollar', '$', 1.000000, true),
        (10001, 'Eurozone', 'Euro', '€', 0.920000, false),
        (10001, 'United Kingdom', 'British Pound', '£', 0.790000, false),
        (10001, 'Japan', 'Japanese Yen', '¥', 154.500000, false),
        (10001, 'India', 'Indian Rupee', '₹', 86.400000, false),
        (10001, 'United Arab Emirates', 'UAE Dirham', 'AED', 3.670000, false),

        (10002, 'India', 'Indian Rupee', '₹', 1.000000, true),
        (10002, 'United States', 'US Dollar', '$', 0.011574, false),
        (10002, 'Eurozone', 'Euro', '€', 0.010648, false),
        (10002, 'United Kingdom', 'British Pound', '£', 0.009144, false),
        (10002, 'United Arab Emirates', 'UAE Dirham', 'AED', 0.042500, false)
      ON CONFLICT DO NOTHING
    `);

    // 5. Email Templates
    const emailTemplates = [
      { name: 'Standard Reservation Confirmation', res: true, update: true, cancel: false, bCheckin: false, checkin: false, aCheckin: false, bCheckout: false, checkout: false, aCheckout: false, dob: false },
      { name: 'Pre-Arrival Welcome & Registration Link', res: false, update: false, cancel: false, bCheckin: true, checkin: false, aCheckin: false, bCheckout: false, checkout: false, aCheckout: false, dob: false },
      { name: 'VIP Digital Check-In FastTrack', res: false, update: false, cancel: false, bCheckin: false, checkin: true, aCheckin: false, bCheckout: false, checkout: false, aCheckout: false, dob: false },
      { name: 'In-Stay Experience & Butler Service Concierge', res: false, update: false, cancel: false, bCheckin: false, checkin: false, aCheckin: true, bCheckout: false, checkout: false, aCheckout: false, dob: false },
      { name: 'Pre-Departure Folio Verification', res: false, update: false, cancel: false, bCheckin: false, checkin: false, aCheckin: false, bCheckout: true, checkout: false, aCheckout: false, dob: false },
      { name: 'Official GST / VAT Tax Invoice Folio Dispatch', res: false, update: false, cancel: false, bCheckin: false, checkin: false, aCheckin: false, bCheckout: false, checkout: true, aCheckout: true, dob: false },
      { name: 'Reservation Cancellation Notice & Refund Advisory', res: false, update: false, cancel: true, bCheckin: false, checkin: false, aCheckin: false, bCheckout: false, checkout: false, aCheckout: false, dob: false },
      { name: 'Marriott Bonvoy Birthday & Anniversary Greeting', res: false, update: false, cancel: false, bCheckin: false, checkin: false, aCheckin: false, bCheckout: false, checkout: false, aCheckout: false, dob: true },
    ];
    for (const cid of [10001, 10002]) {
      for (const tmpl of emailTemplates) {
        await client.query(`
          INSERT INTO email_template (
            client_id, template_name, trigger_reservation, trigger_reservation_update, 
            trigger_reservation_cancel, trigger_after_reservation_cancel, trigger_before_check_in, 
            trigger_check_in, trigger_after_check_in, trigger_before_check_out, trigger_check_out, 
            trigger_after_check_out, trigger_date_of_birth
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `, [cid, tmpl.name, tmpl.res, tmpl.update, tmpl.cancel, tmpl.cancel, tmpl.bCheckin, tmpl.checkin, tmpl.aCheckin, tmpl.bCheckout, tmpl.checkout, tmpl.aCheckout, tmpl.dob]);
      }
    }

    // 6. Rate Packages
    const rateTypes10001 = await client.query(`SELECT rate_type_id FROM rate_type WHERE client_id = 10001 LIMIT 1`);
    const rateTypes10002 = await client.query(`SELECT rate_type_id FROM rate_type WHERE client_id = 10002 LIMIT 1`);
    const rtId1 = rateTypes10001.rows[0]?.rate_type_id || null;
    const rtId2 = rateTypes10002.rows[0]?.rate_type_id || null;

    await client.query(`
      INSERT INTO rate_package (
        client_id, code, name, description, rate_type_id, package_type, inclusions,
        base_price, extra_adult_price, extra_child_price, valid_from, valid_to, min_stay_nights,
        is_active, is_crs_enabled, created_at, updated_at
      ) VALUES
        (10001, 'PKG-BB-01', 'Bed & Coastal Breakfast Package', 'Daily gourmet breakfast buffet at Ocean Terrace with panoramic oceanview seating.', $1, 'Standard', '["Daily Breakfast", "Welcome Cocktail", "Free Valet"]'::jsonb, 269.00, 45.00, 25.00, '2024-01-01', '2030-12-31', 1, true, true, NOW(), NOW()),
        (10001, 'PKG-ROMANCE', 'Emerald Coast Romantic Getaway', 'Chilled champagne upon arrival, fresh Gulf strawberries, $100 spa credit, and 2 PM late check-out.', $1, 'Promotional', '["Chilled Champagne", "Strawberries", "$100 Spa Voucher", "Late Check-out"]'::jsonb, 399.00, 0.00, 0.00, '2024-01-01', '2030-12-31', 2, true, true, NOW(), NOW()),
        (10001, 'PKG-CORP-EXEC', 'Corporate Executive Business Traveler', 'High-speed fiber Wi-Fi, daily garment press, boardroom access (2 hrs), and roundtrip airport shuttle.', $1, 'Corporate', '["Airport Shuttle", "Boardroom Access", "Garment Pressing", "Executive Breakfast"]'::jsonb, 319.00, 50.00, 0.00, '2024-01-01', '2030-12-31', 1, true, true, NOW(), NOW()),

        (10002, 'PKG-SURAT-CORP', 'Diamond Executive Bourse Delegate Package', 'Direct airport shuttle, executive boardroom privileges, gourmet breakfast at Table One, and garment pressing.', $2, 'Corporate', '["Airport Transfer", "Table One Breakfast", "High-speed Wi-Fi", "Executive Lounge Access"]'::jsonb, 14500.00, 2500.00, 1200.00, '2024-01-01', '2030-12-31', 1, true, true, NOW(), NOW()),
        (10002, 'PKG-TAPI-ROMANCE', 'Tapi Waterfront Romance & High Tea', 'Panoramic river suite accommodation, candlelit waterfront dinner, custom bouquet, and late checkout.', $2, 'Promotional', '["Candlelight Dinner", "Riverview Suite", "Welcome High Tea", "Late Checkout"]'::jsonb, 19500.00, 0.00, 0.00, '2024-01-01', '2030-12-31', 2, true, true, NOW(), NOW()),
        (10002, 'PKG-BONVOY-WEEKEND', 'Marriott Bonvoy Weekend Leisure & Wellness', 'Double points bonus, 60-minute Ayurvedic spa massage, and lavish Sunday buffet brunch.', $2, 'Weekend', '["Ayurvedic Spa Session", "Sunday Brunch", "Double Points", "Poolside Cabana"]'::jsonb, 16800.00, 3000.00, 1500.00, '2024-01-01', '2030-12-31', 2, true, true, NOW(), NOW())
    `, [rtId1, rtId2]);

    // 7. Contact Categories
    const contactCategories = [
      { name: 'Corporate Travel Management', short: 'TMC', color: 'blue', desc: 'Travel management companies and corporate agency accounts' },
      { name: 'Diplomatic Mission / Consulate', short: 'DIP', color: 'purple', desc: 'Embassies, consulates, and bilateral mission delegations' },
      { name: 'Direct Corporate', short: 'CORP', color: 'indigo', desc: 'Companies with contracted negotiated corporate lodging rates' },
      { name: 'Event Management / MICE', short: 'MICE', color: 'amber', desc: 'Conferences, summits, weddings, and convention organizers' },
      { name: 'Wholesaler / Tour Operator', short: 'TOUR', color: 'emerald', desc: 'Inbound travel operators and international wholesalers' },
    ];

    for (const cid of [10001, 10002]) {
      for (const cc of contactCategories) {
        const ccRes = await client.query(`
          INSERT INTO contact_category (client_id, category_name, short_name, color_code, description)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING contact_category_id
        `, [cid, cc.name, cc.short, cc.color, cc.desc]);
        const catId = ccRes.rows[0].contact_category_id;

        if (cc.short === 'TMC') {
          const cRes = await client.query(`
            INSERT INTO contact (client_id, contact_category_id, full_name, company, designation, tax_pin, account_manager, contract_status, status)
            VALUES ($1, $2, 'Marcus Vance', 'American Express Global Business Travel', 'Senior Director of Global Lodging', 'EIN-13-5981024', 'Victoria Sterling', 'Active • Contracted', 'active')
            RETURNING contact_id
          `, [cid, catId]);
          const contactId = cRes.rows[0].contact_id;
          await client.query(`
            INSERT INTO contact_detail (contact_id, contact_type, is_primary, phone_number, email_address, address_type, address, city, state, zip_code, country)
            VALUES ($1, 'Corporate Office', true, '+1 (212) 640-2000', 'marcus.vance@amexgbt.com', 'Corporate HQ', '200 Vesey Street', 'New York', 'NY', '10285', 'United States')
          `, [contactId]);
        } else if (cc.short === 'DIP') {
          const cRes = await client.query(`
            INSERT INTO contact (client_id, contact_category_id, full_name, company, designation, tax_pin, account_manager, contract_status, status)
            VALUES ($1, $2, 'Claire de Saint-Germain', 'Consulate General of France', 'Chief of Protocol & Consular Logistics', 'FR-TAX-DIP-902', 'Jean Dupont', 'Permanent Diplomatic', 'active')
            RETURNING contact_id
          `, [cid, catId]);
          const contactId = cRes.rows[0].contact_id;
          await client.query(`
            INSERT INTO contact_detail (contact_id, contact_type, is_primary, phone_number, email_address, address_type, address, city, state, zip_code, country)
            VALUES ($1, 'Diplomatic Office', true, '+1 (212) 606-3600', 'protocol@consulfrance-newyork.org', 'Consulate Office', '934 Fifth Avenue', 'New York', 'NY', '10021', 'United States')
          `, [contactId]);
        } else if (cc.short === 'CORP') {
          const cRes = await client.query(`
            INSERT INTO contact (client_id, contact_category_id, full_name, company, designation, tax_pin, account_manager, contract_status, status)
            VALUES ($1, $2, 'Michael Sterling', 'Vanguard Dynamics Ltd', 'Corporate Travel Director', 'EIN-55-9921048', 'Rachel Vance', 'Expiring Q4', 'active')
            RETURNING contact_id
          `, [cid, catId]);
          const contactId = cRes.rows[0].contact_id;
          await client.query(`
            INSERT INTO contact_detail (contact_id, contact_type, is_primary, phone_number, email_address, address_type, address, city, state, zip_code, country)
            VALUES ($1, 'Corporate HQ', true, '+1 (617) 555-8291', 'travel@vanguard-dynamics.com', 'Corporate Headquarters', '100 Federal Street, 32nd Floor', 'Boston', 'MA', '02110', 'United States')
          `, [contactId]);
        }
      }
    }

    // 8. Lost & Found Items
    const lostFoundItemsData = [
      {
        code: 'LF-2026-0841',
        type: 'found',
        status: 'open',
        name: 'Montblanc Meisterstück Fountain Pen',
        cat: 'Writing Instruments / Valuables',
        color: 'Obsidian Black & Gold',
        hex: '#1a1a1a',
        val: 950.00,
        loc: 'Executive Lounge 14F • North Workstation 03',
        vault: 'VAULT-ALPHA-01',
        finder: 'Housekeeping Lead Attendant (Maria Santos)',
        repName: 'Front Desk Night Audit',
        notes: 'Precious resin barrel, 14K gold-coated nib with initials ERH. Stored in high-security keycard vault.',
        remDays: 82
      },
      {
        code: 'LF-2026-0840',
        type: 'lost',
        status: 'under_investigation',
        name: 'Cartier Santos 100 Chronograph Watch',
        cat: 'Horology / High-Value Jewelry',
        color: 'Two-Tone Rose Gold & Steel',
        hex: '#d4af37',
        val: 12400.00,
        loc: 'Reported lost near Hotel Swimming Pool & Cabana #4',
        vault: 'SECURITY-INVESTIGATION-DISPATCH',
        finder: null,
        repName: 'Sheikh Tariq Al-Rahman',
        notes: 'Security reviewing CCTV footage from 14:00 to 17:30 around outdoor cabana perimeter.',
        remDays: 89
      },
      {
        code: 'LF-2026-0839',
        type: 'found',
        status: 'claimed',
        name: 'Apple iPad Pro 12.9" M2 (Space Gray)',
        cat: 'Consumer Electronics & Mobile Tech',
        color: 'Space Gray',
        hex: '#4b5563',
        val: 1299.00,
        loc: 'Main Lobby Business Center Station B',
        vault: 'VAULT-BETA-04',
        finder: 'Concierge Staff',
        repName: 'Dr. Elena Rostova-Hughes',
        notes: 'Claimed and handed over to guest after successful passcode biometric confirmation.',
        remDays: 0
      },
      {
        code: 'LF-2026-0838',
        type: 'found',
        status: 'open',
        name: 'Rimowa Classic Cabin Suitcase (Silver)',
        cat: 'Luggage / Leather Goods',
        color: 'Anodized Silver Aluminum',
        hex: '#94a3b8',
        val: 1550.00,
        loc: 'Porte-Cochère Bell Captain Holding Area',
        vault: 'BAGGAGE-LOCKER-12',
        finder: 'Bell Captain Attendant',
        repName: 'Bell Desk Supervisor',
        notes: 'Unclaimed luggage bag with airline tag JFK-STV. Bag verified and stored under 24hr CCTV surveillance.',
        remDays: 74
      },
      {
        code: 'LF-STVMC-001',
        type: 'found',
        status: 'open',
        name: 'Prescription Ray-Ban Aviator Sunglasses',
        cat: 'Eyewear / Fashion Accessories',
        color: 'Gold Frame / Brown Gradient Lens',
        hex: '#b45309',
        val: 280.00,
        loc: 'Tapi Riverfront Promenade Restaurant Deck',
        vault: 'VAULT-TAPI-02',
        finder: 'Table One Server Attendant',
        repName: 'F&B Shift Manager',
        notes: 'Found in leather protective pouch on outdoor dining table #18 after dinner service.',
        remDays: 68
      }
    ];

    for (const cid of [10001, 10002]) {
      for (const item of lostFoundItemsData) {
        const recType = item.type === 'lost' ? 'Lost' : 'Found';
        const isResolved = item.status === 'claimed';
        const resType = isResolved ? 'Returned' : null;
        const resBy = isResolved ? 'Concierge Staff' : null;
        const retDate = isResolved ? '2026-03-01' : null;

        await client.query(`
          INSERT INTO lost_found_item (
            client_id, record_type, item_name, color, location_description, item_value,
            current_location, who_found, reported_by_name, resolution_type, resolved_by, return_date, date_entry,
            item_code, category_name, color_hex, characteristics, storage_vault, custody_notes,
            retention_days_remaining, disposition_status
          ) VALUES (
            $1, $2, $3, $4, $5, $6,
            $7, $8, $9, $10, $11, $12, CURRENT_DATE,
            $13, $14, $15, $16, $17, $18,
            $19, $20
          )
        `, [
          cid, recType, item.name, item.color, item.loc, item.val,
          item.vault, item.finder, item.repName, resType, resBy, retDate,
          item.code, item.cat, item.hex, item.notes, item.vault, item.notes,
          item.remDays, item.status
        ]);
      }
    }

    // 9. GUEST MASTER DATABASE (guest, guest_contact, guest_document)
    console.log('[Seed All Tables] Seeding rich guest profiles into guest, guest_contact, guest_document...');

    const masterGuests = [
      {
        code: 'GST-992014',
        title: 'Dr.',
        firstName: 'Elena',
        middleName: 'M.',
        lastName: 'Rostova-Hughes',
        suffix: 'PhD',
        birthDate: '1984-04-12',
        gender: 'Female',
        nationality: 'United States',
        company: 'Hughes Biotechnology AG',
        designation: 'Chief Scientific Officer',
        department: 'Genomics R&D',
        remarks: 'Prefers high floor quiet suite, hypoallergenic pillows, extra sparkling water, and late checkout when available.',
        dnrStatus: 'No',
        dnrReason: null,
        isVip: true,
        vipTier: 'VIP Tier 1 • Chairman Club',
        createdDate: '14-Mar-2022',
        totalStays: 14,
        totalNights: 42,
        totalSpend: 18420.00,
        lastVisit: '18-Jan-2026',
        lastRoom: 'Suite 1402 (Presidential)',
        inHouse: true,
        contacts: [
          {
            isPrimary: true,
            contactType: 'Mobile / Personal',
            phone: '+1 (415) 890-2194',
            countryCode: '+1',
            email: 'elena.rostova@hughes-bio.com',
            folioDispatch: true,
            addressType: 'Primary Residence',
            street: '742 Montgomery St, Penthouse B',
            city: 'San Francisco',
            state: 'CA',
            zip: '94111',
            country: 'United States'
          },
          {
            isPrimary: false,
            contactType: 'Office / Executive Assistant',
            phone: '+1 (650) 492-8800',
            countryCode: '+1',
            email: 'assistant-ea@hughes-bio.com',
            folioDispatch: false,
            addressType: 'Corporate HQ',
            street: '1200 Innovation Parkway, Suite 400',
            city: 'Palo Alto',
            state: 'CA',
            zip: '94304',
            country: 'United States'
          }
        ],
        documents: [
          {
            docTypeShort: 'PASSPORT',
            docNumber: 'USA-P98421098',
            validTill: '2031-08-24',
            nameOnDoc: 'ELENA MARIE ROSTOVA-HUGHES',
            issuedBy: 'United States Department of State',
            issuePlace: 'Washington D.C., USA',
            isPrimary: true,
            street: '742 Montgomery St, Penthouse B',
            city: 'San Francisco',
            state: 'CA',
            zip: '94111',
            country: 'United States',
            remarks: 'MRZ and biometric microchip verified by passport scanner on check-in.',
            isOcr: true
          }
        ]
      },
      {
        code: 'GST-992015',
        title: 'Mr.',
        firstName: 'Klaus',
        middleName: '',
        lastName: 'Schulze',
        suffix: '',
        birthDate: '1968-09-03',
        gender: 'Male',
        nationality: 'Germany',
        company: 'Federal Ministry for Economic Affairs and Climate Action',
        designation: 'Trade Counselor',
        department: 'Diplomatic Mission',
        remarks: 'Diplomatic passport holder. Requires invoice in EUR format and direct Embassy billing protocol.',
        dnrStatus: 'No',
        dnrReason: null,
        isVip: true,
        vipTier: 'VIP Tier 1 • Diplomatic Elite',
        createdDate: '19-Sep-2021',
        totalStays: 22,
        totalNights: 68,
        totalSpend: 29450.00,
        lastVisit: '10-Feb-2026',
        lastRoom: 'Room 804 (Executive Suite)',
        inHouse: false,
        contacts: [
          {
            isPrimary: true,
            contactType: 'Mobile / Personal',
            phone: '+49 171 4928104',
            countryCode: '+49',
            email: 'klaus.schulze@diplo-trade.de',
            folioDispatch: true,
            addressType: 'Primary Residence',
            street: 'Wilhelmstraße 49, Mitte',
            city: 'Berlin',
            state: 'Berlin',
            zip: '10117',
            country: 'Germany'
          }
        ],
        documents: [
          {
            docTypeShort: 'PASSPORT',
            docNumber: 'DEU-D1049281',
            validTill: '2030-05-14',
            nameOnDoc: 'KLAUS SCHULZE',
            issuedBy: 'Auswärtiges Amt',
            issuePlace: 'Berlin, Germany',
            isPrimary: true,
            street: 'Wilhelmstraße 49, Mitte',
            city: 'Berlin',
            state: 'Berlin',
            zip: '10117',
            country: 'Germany',
            remarks: 'Diplomatic status verified by Ministry credential card.',
            isOcr: true
          }
        ]
      },
      {
        code: 'GST-992016',
        title: 'Sheikh',
        firstName: 'Tariq',
        middleName: 'Bin Rashid',
        lastName: 'Al-Rahman',
        suffix: '',
        birthDate: '1979-11-20',
        gender: 'Male',
        nationality: 'United Arab Emirates',
        company: 'Al-Rahman Sovereign Investments LLC',
        designation: 'Executive Vice President',
        department: 'Private Wealth & Asset Allocation',
        remarks: 'Halal dining requirements strictly observed. Prayer mat and Qibla direction verified on room setup.',
        dnrStatus: 'No',
        dnrReason: null,
        isVip: true,
        vipTier: 'VIP Tier 1 • Royal Patron',
        createdDate: '02-Jan-2023',
        totalStays: 19,
        totalNights: 54,
        totalSpend: 42100.00,
        lastVisit: '04-Mar-2026',
        lastRoom: 'Suite 1501 (Royal Penthouse)',
        inHouse: true,
        contacts: [
          {
            isPrimary: true,
            contactType: 'Mobile / Personal',
            phone: '+971 50 8291048',
            countryCode: '+971',
            email: 'tariq@alrahman-equity.ae',
            folioDispatch: true,
            addressType: 'Primary Residence',
            street: 'Emirates Towers, Sheikh Zayed Rd',
            city: 'Dubai',
            state: 'Dubai',
            zip: 'P.O. Box 7200',
            country: 'United Arab Emirates'
          }
        ],
        documents: [
          {
            docTypeShort: 'PASSPORT',
            docNumber: 'ARE-A4820194',
            validTill: '2029-11-19',
            nameOnDoc: 'TARIQ BIN RASHID AL-RAHMAN',
            issuedBy: 'Federal Authority for Identity & Citizenship',
            issuePlace: 'Abu Dhabi, UAE',
            isPrimary: true,
            street: 'Emirates Towers, Sheikh Zayed Rd',
            city: 'Dubai',
            state: 'Dubai',
            zip: 'P.O. Box 7200',
            country: 'United Arab Emirates',
            remarks: 'Sovereign dignitary diplomatic entry recorded.',
            isOcr: true
          }
        ]
      },
      {
        code: 'GST-992017',
        title: 'Ms.',
        firstName: 'Yuka',
        middleName: '',
        lastName: 'Tanaka',
        suffix: '',
        birthDate: '1991-06-18',
        gender: 'Female',
        nationality: 'Japan',
        company: 'Tanaka Media & Global Communications Ltd',
        designation: 'Creative Director',
        department: 'Content Operations',
        remarks: 'Requested high-speed wired Ethernet connectivity for 4K video rendering and green tea service.',
        dnrStatus: 'No',
        dnrReason: null,
        isVip: false,
        vipTier: 'Marriott Bonvoy Gold Elite',
        createdDate: '11-Nov-2023',
        totalStays: 8,
        totalNights: 26,
        totalSpend: 9840.00,
        lastVisit: '22-Apr-2026',
        lastRoom: 'Room 612 (Deluxe King)',
        inHouse: true,
        contacts: [
          {
            isPrimary: true,
            contactType: 'Mobile / Personal',
            phone: '+81 90 4920 1829',
            countryCode: '+81',
            email: 'yuka.tanaka@tanakamedia.co.jp',
            folioDispatch: true,
            addressType: 'Primary Residence',
            street: 'Roppongi Hills Mori Tower 24F',
            city: 'Tokyo',
            state: 'Tokyo',
            zip: '106-6124',
            country: 'Japan'
          }
        ],
        documents: [
          {
            docTypeShort: 'PASSPORT',
            docNumber: 'JPN-TK840192',
            validTill: '2033-02-10',
            nameOnDoc: 'YUKA TANAKA',
            issuedBy: 'Ministry of Foreign Affairs Japan',
            issuePlace: 'Tokyo, Japan',
            isPrimary: true,
            street: 'Roppongi Hills Mori Tower 24F',
            city: 'Tokyo',
            state: 'Tokyo',
            zip: '106-6124',
            country: 'Japan',
            remarks: 'Verified Japanese biometric passport.',
            isOcr: true
          }
        ]
      },
      {
        code: 'GST-992018',
        title: 'Mr.',
        firstName: 'Oliver',
        middleName: 'J.',
        lastName: 'Bennett',
        suffix: 'Esq.',
        birthDate: '1987-01-30',
        gender: 'Male',
        nationality: 'United Kingdom',
        company: 'Self-Employed / Historic Architecture Consultant',
        designation: 'Historic Architecture Consultant',
        department: 'Independent',
        remarks: 'Warning Flagged: Balcony smoking dispute during previous stay. Requires supervisor check-in acknowledgment.',
        dnrStatus: 'Yes Warning',
        dnrReason: 'Balcony smoking policy infraction on 2025-11-04. Requires front desk supervisor check-in acknowledgment.',
        isVip: false,
        vipTier: '',
        createdDate: '15-May-2023',
        totalStays: 5,
        totalNights: 14,
        totalSpend: 4890.00,
        lastVisit: '04-Nov-2025',
        lastRoom: 'Room 304 (Standard Queen)',
        inHouse: false,
        contacts: [
          {
            isPrimary: true,
            contactType: 'Mobile / Personal',
            phone: '+44 7700 900481',
            countryCode: '+44',
            email: 'oliver.bennett88@gmail.com',
            folioDispatch: true,
            addressType: 'Primary Residence',
            street: '24 Kensington Church Street',
            city: 'London',
            state: 'Greater London',
            zip: 'W8 4EP',
            country: 'United Kingdom'
          }
        ],
        documents: [
          {
            docTypeShort: 'PASSPORT',
            docNumber: 'GBR-99201844',
            validTill: '2027-10-15',
            nameOnDoc: 'OLIVER JAMES BENNETT',
            issuedBy: 'His Majesty Passport Office',
            issuePlace: 'London, UK',
            isPrimary: true,
            street: '24 Kensington Church Street',
            city: 'London',
            state: 'Greater London',
            zip: 'W8 4EP',
            country: 'United Kingdom',
            remarks: 'UK passport on file.',
            isOcr: true
          }
        ]
      },
      {
        code: 'GST-STVMC-101',
        title: 'Mr.',
        firstName: 'Rajesh',
        middleName: 'K.',
        lastName: 'Mehta',
        suffix: '',
        birthDate: '1975-08-15',
        gender: 'Male',
        nationality: 'India',
        company: 'Reliance Industries Ltd',
        designation: 'Managing Director - Petrochemicals',
        department: 'Corporate Executive',
        remarks: 'Diamond Club VIP. Prefers high-floor room overlooking Tapi River, vegetarian Jain breakfast, green tea in room on arrival.',
        dnrStatus: 'No',
        dnrReason: null,
        isVip: true,
        vipTier: 'VIP Tier 1 • Marriott Bonvoy Titanium',
        createdDate: '12-Jan-2023',
        totalStays: 28,
        totalNights: 84,
        totalSpend: 1120000.00,
        lastVisit: '10-Jun-2026',
        lastRoom: 'Suite 902 (Tapi River Suite)',
        inHouse: true,
        contacts: [
          {
            isPrimary: true,
            contactType: 'Mobile / Personal',
            phone: '+91 98250 11234',
            countryCode: '+91',
            email: 'rajesh.mehta@reliance-exec.in',
            folioDispatch: true,
            addressType: 'Primary Residence',
            street: '42 Ambience Tower, Dumas Road',
            city: 'Surat',
            state: 'Gujarat',
            zip: '395007',
            country: 'India'
          }
        ],
        documents: [
          {
            docTypeShort: 'AADHAAR',
            docNumber: 'XXXX-XXXX-8421',
            validTill: '2035-12-31',
            nameOnDoc: 'RAJESH K MEHTA',
            issuedBy: 'UIDAI - Government of India',
            issuePlace: 'Gujarat, India',
            isPrimary: true,
            street: '42 Ambience Tower, Dumas Road',
            city: 'Surat',
            state: 'Gujarat',
            zip: '395007',
            country: 'India',
            remarks: 'Biometric UIDAI e-verification verified at check-in.',
            isOcr: true
          }
        ]
      },
      {
        code: 'GST-STVMC-102',
        title: 'Ms.',
        firstName: 'Priya',
        middleName: '',
        lastName: 'Sharma',
        suffix: '',
        birthDate: '1988-11-22',
        gender: 'Female',
        nationality: 'India',
        company: 'Tata Consultancy Services',
        designation: 'Principal Solutions Architect',
        department: 'Enterprise Cloud Solutions',
        remarks: 'Late checkout requested for 16:00 PM due to evening flight to Mumbai. Twin pillows requested.',
        dnrStatus: 'No',
        dnrReason: null,
        isVip: false,
        vipTier: 'Marriott Bonvoy Gold Elite',
        createdDate: '04-Feb-2024',
        totalStays: 9,
        totalNights: 22,
        totalSpend: 295000.00,
        lastVisit: '22-May-2026',
        lastRoom: 'Room 508 (Executive Twin)',
        inHouse: true,
        contacts: [
          {
            isPrimary: true,
            contactType: 'Mobile / Personal',
            phone: '+91 97129 44321',
            countryCode: '+91',
            email: 'priya.sharma@tcs.com',
            folioDispatch: true,
            addressType: 'Primary Residence',
            street: 'B-604, Godrej Garden City, SG Highway',
            city: 'Ahmedabad',
            state: 'Gujarat',
            zip: '382470',
            country: 'India'
          }
        ],
        documents: [
          {
            docTypeShort: 'PASSPORT',
            docNumber: 'IND-Z8472910',
            validTill: '2032-05-18',
            nameOnDoc: 'PRIYA SHARMA',
            issuedBy: 'Passport Office Ahmedabad',
            issuePlace: 'Ahmedabad, India',
            isPrimary: true,
            street: 'B-604, Godrej Garden City, SG Highway',
            city: 'Ahmedabad',
            state: 'Gujarat',
            zip: '382470',
            country: 'India',
            remarks: 'Physical passport inspected and copied.',
            isOcr: true
          }
        ]
      },
      {
        code: 'GST-STVMC-103',
        title: 'Mr.',
        firstName: 'Amit',
        middleName: 'B.',
        lastName: 'Patel',
        suffix: '',
        birthDate: '1982-03-09',
        gender: 'Male',
        nationality: 'India',
        company: 'Surat Diamond Bourse (SDB)',
        designation: 'Managing Partner',
        department: 'Diamond Trading & Exports',
        remarks: 'Requires in-room digital safe calibration for high-value gem samples. Requires secure courier coordination.',
        dnrStatus: 'No',
        dnrReason: null,
        isVip: true,
        vipTier: 'VIP Tier 2 • Ambassador Elite',
        createdDate: '18-Aug-2021',
        totalStays: 41,
        totalNights: 120,
        totalSpend: 1980000.00,
        lastVisit: '15-Jun-2026',
        lastRoom: 'Suite 1001 (Presidential Suite)',
        inHouse: false,
        contacts: [
          {
            isPrimary: true,
            contactType: 'Mobile / Personal',
            phone: '+91 98980 77654',
            countryCode: '+91',
            email: 'amit.patel@sdb-diamonds.in',
            folioDispatch: true,
            addressType: 'Primary Residence',
            street: 'Plot 12, Diamond City Park, Khajod',
            city: 'Surat',
            state: 'Gujarat',
            zip: '395007',
            country: 'India'
          }
        ],
        documents: [
          {
            docTypeShort: 'PAN',
            docNumber: 'ABCDE1234F',
            validTill: '2035-12-31',
            nameOnDoc: 'AMIT B PATEL',
            issuedBy: 'Income Tax Department of India',
            issuePlace: 'Surat, India',
            isPrimary: true,
            street: 'Plot 12, Diamond City Park, Khajod',
            city: 'Surat',
            state: 'Gujarat',
            zip: '395007',
            country: 'India',
            remarks: 'PAN card verified for commercial GST billing.',
            isOcr: true
          }
        ]
      }
    ];

    // Insert guests for both properties (10001 & 10002)
    for (const cid of [10001, 10002]) {
      // Find document types for this client
      const dtRes = await client.query(`SELECT document_type_id, short_name FROM document_type WHERE client_id = $1`, [cid]);
      const dtMap = {};
      for (const r of dtRes.rows) {
        dtMap[r.short_name.toUpperCase()] = r.document_type_id;
      }
      // Default fallback doc type if specific short name not found
      const defaultDocTypeId = dtRes.rows[0]?.document_type_id;

      for (const g of masterGuests) {
        const insertGuestSql = `
          INSERT INTO guest (
            client_id, title, first_name, middle_name, last_name, suffix,
            birth_date, gender, nationality, company, designation, department,
            guest_remark, dnr_status, dnr_reason,
            guest_code, is_vip, vip_tier, total_stays, total_nights, total_spend,
            last_visit, last_room, in_house, created_date
          ) VALUES (
            $1, $2, $3, $4, $5, $6,
            $7, $8, $9, $10, $11, $12,
            $13, $14, $15,
            $16, $17, $18, $19, $20, $21,
            $22, $23, $24, $25
          )
          RETURNING guest_id
        `;

        const guestRes = await client.query(insertGuestSql, [
          cid, g.title, g.firstName, g.middleName || null, g.lastName, g.suffix || null,
          g.birthDate, g.gender, g.nationality, g.company, g.designation, g.department,
          g.remarks, g.dnrStatus, g.dnrReason,
          g.code, g.isVip, g.vipTier, g.totalStays, g.totalNights, g.totalSpend,
          g.lastVisit, g.lastRoom, g.inHouse, g.createdDate
        ]);
        const guestId = guestRes.rows[0].guest_id;

        // Contacts
        for (const c of g.contacts) {
          await client.query(`
            INSERT INTO guest_contact (
              guest_id, contact_type, is_primary, phone_number, email_address,
              address_type, address, city, state, zip_code, country, folio_dispatch, country_code
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          `, [
            guestId, c.contactType, c.isPrimary, c.phone, c.email,
            c.addressType, c.street, c.city, c.state, c.zip, c.country, c.folioDispatch, c.countryCode
          ]);
        }

        // Documents
        for (const d of g.documents) {
          const docTypeId = dtMap[d.docTypeShort.toUpperCase()] || defaultDocTypeId;
          if (docTypeId) {
            await client.query(`
              INSERT INTO guest_document (
                guest_id, document_type_id, document_number, valid_till, name_on_document,
                issued_by, issue_place, is_primary, address, city, state, zip_code, country,
                remark, is_ocr_verified
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            `, [
              guestId, docTypeId, d.docNumber, d.validTill, d.nameOnDoc,
              d.issuedBy, d.issuePlace, d.isPrimary, d.street, d.city, d.state, d.zip, d.country,
              d.remarks, d.isOcr
            ]);
          }
        }
      }
    }

    // 10. Reservations linking guests and rooms
    console.log('[Seed All Tables] Seeding live reservations...');
    for (const cid of [10001, 10002]) {
      const guests = await client.query(`SELECT guest_id, first_name, last_name, guest_code FROM guest WHERE client_id = $1 LIMIT 3`, [cid]);
      const rooms = await client.query(`SELECT r.room_id, r.room_name, r.room_type_id FROM room r WHERE r.client_id = $1 LIMIT 3`, [cid]);
      
      if (guests.rows.length > 0 && rooms.rows.length > 0) {
        for (let i = 0; i < Math.min(guests.rows.length, rooms.rows.length); i++) {
          const g = guests.rows[i];
          const rm = rooms.rows[i];
          const bkNum = `BK-${cid}-${1001 + i}`;
          await client.query(`
            INSERT INTO reservation (
              client_id, booking_number, guest_name, guest_email, guest_phone,
              room_type_id, room_id, room_number, check_in_date, check_out_date,
              status, adults, children, total_amount, paid_amount, special_requests,
              created_by_name, created_at, updated_at
            ) VALUES (
              $1, $2, $3, $4, $5,
              $6, $7, $8, CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE + INTERVAL '2 days',
              'IN_HOUSE', 2, 0, 850.00, 850.00, 'High floor suite requested with river/harbor view.',
              'Front Desk Lead', NOW(), NOW()
            )
          `, [
            cid, bkNum, `${g.first_name} ${g.last_name}`, `${g.first_name.toLowerCase()}@example.com`,
            '+1 (555) 019-2831', rm.room_type_id, rm.room_id, rm.room_name
          ]);
        }
      }
    }

    // 11. Room Rates
    console.log('[Seed All Tables] Seeding room rates...');
    for (const cid of [10001, 10002]) {
      const roomTypes = await client.query(`SELECT room_type_id FROM room_type WHERE client_id = $1`, [cid]);
      const rateTypes = await client.query(`SELECT rate_type_id FROM rate_type WHERE client_id = $1`, [cid]);
      if (roomTypes.rows.length > 0 && rateTypes.rows.length > 0) {
        for (const rt of roomTypes.rows) {
          for (const rateT of rateTypes.rows) {
            const baseAmount = cid === 10001 ? 189.00 : 8500.00;
            await client.query(`
              INSERT INTO room_rate (
                client_id, rate_type_id, room_type_id, occupancy_type, occupancy_count, rate_date, rate_amount
              ) VALUES 
                ($1, $2, $3, 'Base', 1, CURRENT_DATE, $4),
                ($1, $2, $3, 'Adult', 2, CURRENT_DATE, $5)
              ON CONFLICT DO NOTHING
            `, [cid, rateT.rate_type_id, rt.room_type_id, baseAmount, baseAmount * 1.15]);
          }
        }
      }
    }

    await client.query('COMMIT');
    console.log('[Seed All Tables] All tables populated with comprehensive, high-quality production data!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Seed All Tables Error]:', err);
    throw err;
  } finally {
    client.release();
  }
}

// Run if directly executed
if (process.argv[1] && process.argv[1].includes('seed_all_tables.js')) {
  seedAllTables().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
}
