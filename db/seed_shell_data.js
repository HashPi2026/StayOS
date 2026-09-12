import { pool } from './pool.js';

export async function seedShellData() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Ensure Role 1 (Property Administrator)
    await client.query(`
      INSERT INTO role_privilege (role_id, client_id, role_name, short_name, role_type, description)
      VALUES (1, 'PROP_DEMO_001', 'Property Administrator', 'Admin', 'ADMIN', 'Full access to all PMS modules and system configuration')
      ON CONFLICT (role_id) DO UPDATE SET
        role_name = EXCLUDED.role_name,
        role_type = EXCLUDED.role_type;
    `);

    // 2. Ensure Role 2 (Front Desk Associate)
    await client.query(`
      INSERT INTO role_privilege (role_id, client_id, role_name, short_name, role_type, description)
      VALUES (2, 'PROP_DEMO_001', 'Front Desk Associate', 'FrontDesk', 'STAFF', 'Access to reservations, front desk, and guest operations')
      ON CONFLICT (role_id) DO UPDATE SET
        role_name = EXCLUDED.role_name,
        role_type = EXCLUDED.role_type;
    `);

    // 3. Grant access for Role 1 (All 11 modules)
    const allModules = [
      'dashboard',
      'reservation',
      'front_desk',
      'rate_availability',
      'audit',
      'business_channels',
      'guest',
      'housekeeping',
      'utility',
      'reports',
      'configuration',
    ];
    for (const mod of allModules) {
      await client.query(
        `INSERT INTO role_module_access (role_id, module_key)
         VALUES (1, $1)
         ON CONFLICT (role_id, module_key) DO NOTHING`,
        [mod]
      );
    }

    // 4. Grant access for Role 2 (Staff - locked modules show with lock icon)
    const staffModules = ['dashboard', 'reservation', 'front_desk', 'guest', 'housekeeping'];
    for (const mod of staffModules) {
      await client.query(
        `INSERT INTO role_module_access (role_id, module_key)
         VALUES (2, $1)
         ON CONFLICT (role_id, module_key) DO NOTHING`,
        [mod]
      );
    }

    // 5. App Users
    await client.query(`
      INSERT INTO app_user (user_id, client_id, role_id, user_name, description, is_active)
      VALUES (1, 'PROP_DEMO_001', 1, 'Marcus Vance', 'General Manager & System Administrator', true)
      ON CONFLICT (user_id) DO NOTHING;
    `);
    await client.query(`
      INSERT INTO app_user (user_id, client_id, role_id, user_name, description, is_active)
      VALUES (2, 'PROP_DEMO_001', 2, 'Elena Rostova', 'Front Desk Supervisor', true)
      ON CONFLICT (user_id) DO NOTHING;
    `);

    await client.query('COMMIT');
    console.log('[Seed] Shell roles and module access successfully configured.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Seed Error]:', err);
  } finally {
    client.release();
  }
}

// Auto-run if executed directly
if (process.argv[1] && process.argv[1].includes('seed_shell_data.js')) {
  seedShellData().then(() => process.exit(0));
}
