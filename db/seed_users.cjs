const { pool } = require('./pool.js');

async function seedUsers() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Ensure columns exist on app_user
    await client.query(`
      ALTER TABLE app_user ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
      ALTER TABLE app_user ADD COLUMN IF NOT EXISTS department VARCHAR(100);
      ALTER TABLE app_user ADD COLUMN IF NOT EXISTS avatar_url TEXT;
      ALTER TABLE app_user ADD COLUMN IF NOT EXISTS initials VARCHAR(10);
      ALTER TABLE app_user ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE app_user ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
    `);

    // 2. Roles for Property 10001 (Destin Inn) & 10002 (Surat Marriott)
    const roles = [
      { id: 1, clientId: 10001, name: 'Property Administrator', short: 'Admin', type: 'ADMIN', desc: 'Full administrative access to Destin Inn & Suites PMS' },
      { id: 2, clientId: 10001, name: 'Front Desk Associate', short: 'FrontDesk', type: 'STAFF', desc: 'Front desk and guest check-in operations for Destin Inn & Suites' },
      { id: 3, clientId: 10002, name: 'General Manager & Director', short: 'GM', type: 'ADMIN', desc: 'Hotel executive command, strategy, and full property administration for Surat Marriott Hotel' },
      { id: 4, clientId: 10002, name: 'Front Office Executive', short: 'FO-Exec', type: 'STAFF', desc: 'Front office operations and guest check-in for Surat Marriott Hotel' },
      { id: 5, clientId: 10001, name: 'General Manager', short: 'GM', type: 'ADMIN', desc: 'Executive hotel operations, approvals, and performance oversight' },
      { id: 6, clientId: 10001, name: 'Housekeeping Supervisor', short: 'HK-Sup', type: 'OPERATIONS', desc: 'Room cleaning inspection, attendant task assignments, and linen inventory' },
      { id: 7, clientId: 10001, name: 'Night Auditor', short: 'NightAudit', type: 'STAFF', desc: 'End-of-day closing, rate audits, and night front desk service' },
      { id: 8, clientId: 10001, name: 'Finance Controller', short: 'Finance', type: 'FINANCE', desc: 'Ledger balancing, folio taxation, invoices, and accounting reconciliation' },
      { id: 9, clientId: 10001, name: 'Front Desk Manager', short: 'FDM', type: 'STAFF', desc: 'Daily shift supervision, check-in flow, and room allocation' },
      { id: 10, clientId: 10002, name: 'Executive Housekeeper', short: 'EHK', type: 'OPERATIONS', desc: 'Housekeeping supervision, laundry management, and room inspection for Surat Marriott Hotel' },
      { id: 11, clientId: 10002, name: 'Financial Controller', short: 'FIN-CTRL', type: 'FINANCE', desc: 'GST compliance, folio ledger, vendor payments, and accounts audit for Surat Marriott Hotel' },
      { id: 12, clientId: 10002, name: 'Banquet & Events Director', short: 'BANQUET', type: 'OPERATIONS', desc: 'Banqueting, wedding catering, and Diamond Bourse corporate conference coordination' },
      { id: 13, clientId: 10002, name: 'Marriott Bonvoy Loyalty Host', short: 'LOYALTY', type: 'STAFF', desc: 'VIP guest relations, Ambassador concierge, and Marriott Bonvoy elite benefits desk' }
    ];

    for (const r of roles) {
      await client.query(`
        INSERT INTO role_privilege (role_id, client_id, role_name, short_name, role_type, description)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (role_id) DO UPDATE SET
          client_id = EXCLUDED.client_id,
          role_name = EXCLUDED.role_name,
          short_name = EXCLUDED.short_name,
          role_type = EXCLUDED.role_type,
          description = EXCLUDED.description;
      `, [r.id, r.clientId || 10001, r.name, r.short, r.type, r.desc]);
    }

    // Grant module access to roles
    const allMods = ['dashboard', 'reservation', 'front_desk', 'rate_availability', 'audit', 'business_channels', 'guest', 'housekeeping', 'utility', 'reports', 'configuration'];
    for (const r of roles) {
      for (const m of allMods) {
        await client.query(`
          INSERT INTO role_module_access (role_id, module_key)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING;
        `, [r.id, m]);
      }
    }

    // 3. Exactly 9 Users for Property 10001
    const users = [
      {
        id: 1,
        name: 'Jay Mistry',
        roleId: 1,
        desc: 'General Administrator & Lead Operator for Destin Inn & Suites',
        active: true,
        phone: '+1 (850) 555-0100',
        dept: 'Executive Administration',
        initials: 'JM',
        email: 'jaymistry1804@gmail.com',
        username: 'jaymistry.destin',
        avatar: null
      },
      {
        id: 2,
        clientId: 10001,
        name: 'Sarah Jenkins',
        roleId: 2,
        desc: 'Front Desk Lead for Destin Inn & Suites',
        active: true,
        phone: '+1 (850) 555-0101',
        dept: 'Front Desk & Guest Services',
        initials: 'SJ',
        email: 'sarah.jenkins@destininn.com',
        username: 'sarah.destin',
        avatar: null
      },
      {
        id: 3,
        clientId: 10002,
        name: 'Rajesh Mehta',
        roleId: 3,
        desc: 'General Manager for Surat Marriott Hotel',
        active: true,
        phone: '+91 261 555 0100',
        dept: 'Hotel Executive Command',
        initials: 'RM',
        email: 'rajesh.mehta@marriott.com',
        username: 'rajesh.marriott',
        avatar: null
      },
      {
        id: 4,
        clientId: 10002,
        name: 'Priya Shah',
        roleId: 4,
        desc: 'Front Office Manager for Surat Marriott Hotel',
        active: true,
        phone: '+91 261 555 0101',
        dept: 'Front Office & Marriott Bonvoy',
        initials: 'PS',
        email: 'priya.shah@marriott.com',
        username: 'priya.marriott',
        avatar: null
      },
      {
        id: 5,
        clientId: 10001,
        name: 'David Chen',
        roleId: 5,
        desc: 'General Hotel Operations & Property Manager',
        active: true,
        phone: '+1 (850) 555-0102',
        dept: 'General Hotel Operations',
        initials: 'DC',
        email: 'd.chen@destininn.com',
        username: 'david.destin',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBMrhzMyBThwFWkOminxngfS1TWXqmewRnJXbLUbWjUh-4M3YFgws71hGaREwvrP5cwMMi1mqWV7XoBisq8SwuwVZ-eF0PcNHiuzKgsR0moBR9PadOyJXsb4Bd7P4NPpST6Np6N6adBccfbZ91NZzO3vMC0wERlLxkpJUS7P9Fybj1jEX_4imtdKLmdc6m29vkoN-8ArCXnXncz_DCWBwLqSDI9D4E9kcCXy7Ok0EBFtIqQDl_xYUE3'
      },
      {
        id: 6,
        name: 'Maria Rodriguez',
        roleId: 2,
        desc: 'Front Desk Receptionist & Guest Experience',
        active: true,
        phone: '+1 (850) 555-0103',
        dept: 'Front Desk & Guest Services',
        initials: 'MR',
        email: 'm.rodriguez@destininn.com',
        username: 'maria.destin',
        avatar: null
      },
      {
        id: 7,
        name: 'Emily Clark',
        roleId: 2,
        desc: 'Front Desk & Reservations Specialist',
        active: false,
        phone: '+1 (850) 555-0104',
        dept: 'Front Desk & Guest Services',
        initials: 'EC',
        email: 'e.clark@destininn.com',
        username: 'emily.destin',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAOURQ24KYK8MwUGubNG1kwNaCIqxZj-UWJ-wWSef0lUU5-lN0GriIr75MOaxGx5P-e7UV26n5cHrX9qpnmamkkIAfAaAdwNi1mSGfJFsyuvRyPB-ckFLsDTCP016B9WyQIFqenQMWx7AIo3Xc1L22YVfIOpNh33YSQs_k9dZgibGM4iEfp2WLb1NWIx9B7q1f0wPe3VXK0Yqt8ITVhCSaxBd6iTjnJo--vPuaHRs7Xrk8zalRhyAY8'
      },
      {
        id: 8,
        name: 'Carlos Mendez',
        roleId: 6,
        desc: 'Housekeeping Supervisor & Facilities Coordinator',
        active: true,
        phone: '+1 (850) 555-0105',
        dept: 'Housekeeping & Facilities',
        initials: 'CM',
        email: 'c.mendez@destininn.com',
        username: 'carlos.destin',
        avatar: null
      },
      {
        id: 9,
        name: 'Alexandre Dumas',
        roleId: 7,
        desc: 'Night Auditor & Revenue Operations',
        active: true,
        phone: '+1 (850) 555-0106',
        dept: 'Night Auditing & Revenue',
        initials: 'AD',
        email: 'a.dumas@destininn.com',
        username: 'alexandre.destin',
        avatar: null
      },
      {
        id: 10,
        name: 'Priya Sharma',
        roleId: 8,
        desc: 'Finance Controller & Ledger Auditor',
        active: true,
        phone: '+1 (850) 555-0107',
        dept: 'Accounting & Payroll',
        initials: 'PS',
        email: 'p.sharma@destininn.com',
        username: 'priyasharma.destin',
        avatar: null
      },
      {
        id: 11,
        name: 'Marcus Vance',
        roleId: 9,
        desc: 'Front Desk Operations Manager',
        active: true,
        phone: '+1 (850) 555-0108',
        dept: 'Front Desk Operations',
        initials: 'MV',
        email: 'm.vance@destininn.com',
        username: 'marcus.destin',
        avatar: null
      },
      {
        id: 12,
        clientId: 10002,
        name: 'Amit Singhania',
        roleId: 11,
        desc: 'Financial Controller & Tax Auditor for Surat Marriott Hotel',
        active: true,
        phone: '+91 261 555 0102',
        dept: 'Finance & Accounts',
        initials: 'AS',
        email: 'amit.singhania@marriott.com',
        username: 'amit.marriott',
        avatar: null
      },
      {
        id: 13,
        clientId: 10002,
        name: 'Sunita Parmar',
        roleId: 10,
        desc: 'Executive Housekeeper & Laundry Head for Surat Marriott Hotel',
        active: true,
        phone: '+91 261 555 0103',
        dept: 'Housekeeping & Facilities',
        initials: 'SP',
        email: 'sunita.parmar@marriott.com',
        username: 'sunita.marriott',
        avatar: null
      },
      {
        id: 14,
        clientId: 10002,
        name: 'Rohan Dave',
        roleId: 13,
        desc: 'Marriott Bonvoy Loyalty Host & VIP Concierge',
        active: true,
        phone: '+91 261 555 0104',
        dept: 'Guest Services & Loyalty',
        initials: 'RD',
        email: 'rohan.dave@marriott.com',
        username: 'rohan.marriott',
        avatar: null
      },
      {
        id: 15,
        clientId: 10002,
        name: 'Vikram Solanki',
        roleId: 12,
        desc: 'Director of Banquets & Diamond Bourse Events',
        active: true,
        phone: '+91 261 555 0105',
        dept: 'Convention & Banqueting',
        initials: 'VS',
        email: 'vikram.solanki@marriott.com',
        username: 'vikram.marriott',
        avatar: null
      }
    ];

    for (const u of users) {
      const userClientId = u.clientId || 10001;
      const isSurat = userClientId === 10002;
      const salt = isSurat ? '0398a9a66454f68e5beb44f588093e93' : 'e67f7e4b3c476b68821140bc9cca6c2c';
      const hash = isSurat
        ? '32004810a6cc0ca913066554c05a02031ddec0b7bf5b9c1ffd5a953b9fb57a0c92ee5a3fef0eb64360162ae6bb17e2a1a7f4e29e847549dfab07cdd753ee685d'
        : '90f09f2590f0bf8d6a35a0ec705320437867d544e171d160581cca216f1e1a69b377d4c4ce4696ea556e1c44f80a2fd151667aabd072253f1e06b9456c21fa1f';

      await client.query(`
        INSERT INTO app_user (user_id, client_id, role_id, user_name, description, is_active, phone, department, avatar_url, initials)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (user_id) DO UPDATE SET
          client_id = EXCLUDED.client_id,
          role_id = EXCLUDED.role_id,
          user_name = EXCLUDED.user_name,
          description = EXCLUDED.description,
          is_active = EXCLUDED.is_active,
          phone = EXCLUDED.phone,
          department = EXCLUDED.department,
          avatar_url = EXCLUDED.avatar_url,
          initials = EXCLUDED.initials;
      `, [u.id, userClientId, u.roleId, u.name, u.desc, u.active, u.phone, u.dept, u.avatar, u.initials]);

      await client.query(`
        INSERT INTO user_login_credential (credential_id, user_id, username, email, login_email, password_hash, password_salt, is_active)
        VALUES ($1, $2, $3, $4, $4, $5, $6, $7)
        ON CONFLICT (user_id) DO UPDATE SET
          username = EXCLUDED.username,
          email = EXCLUDED.email,
          login_email = EXCLUDED.login_email,
          password_hash = EXCLUDED.password_hash,
          password_salt = EXCLUDED.password_salt,
          is_active = EXCLUDED.is_active;
      `, [u.id, u.id, u.username, u.email, hash, salt, u.active]);
    }

    // Update sequence
    await client.query(`SELECT setval('app_user_user_id_seq', (SELECT MAX(user_id) FROM app_user));`);
    await client.query(`SELECT setval('user_login_credential_credential_id_seq', (SELECT MAX(credential_id) FROM user_login_credential));`);
    await client.query(`SELECT setval('role_privilege_role_id_seq', (SELECT MAX(role_id) FROM role_privilege));`);

    await client.query('COMMIT');
    console.log('Successfully seeded users and credentials for properties 10001 and 10002 in PostgreSQL database!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Failed to seed users:', err);
    throw err;
  } finally {
    client.release();
  }
}

seedUsers()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
