const { pool } = require('./pool.js');

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const statuses10001 = [
      { name: 'Clean', short: 'CLN', code: 'CLN', color: '#10B981', text: '#FFFFFF' },
      { name: 'Dirty', short: 'DRT', code: 'DRT', color: '#F59E0B', text: '#FFFFFF' },
      { name: 'Inspected', short: 'INS', code: 'INS', color: '#3B82F6', text: '#FFFFFF' },
      { name: 'Out of Order', short: 'OOO', code: 'OOO', color: '#EF4444', text: '#FFFFFF' },
      { name: 'Out of Service', short: 'OOS', code: 'OOS', color: '#6B7280', text: '#FFFFFF' }
    ];
    for (const s of statuses10001) {
      await client.query(
        'INSERT INTO room_status (client_id, status_name, short_name, status_code, status_color, text_color, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [10001, s.name, s.short, s.code, s.color, s.text, true]
      );
    }
    const statuses10002 = [
      { name: 'Clean & Sanitized', short: 'CLN', code: 'CLN', color: '#10B981', text: '#FFFFFF' },
      { name: 'Dirty - Turnover Pending', short: 'DRT', code: 'DRT', color: '#F59E0B', text: '#FFFFFF' },
      { name: 'Inspected - EHK Approved', short: 'INS', code: 'INS', color: '#3B82F6', text: '#FFFFFF' },
      { name: 'Out of Order - Maintenance', short: 'OOO', code: 'OOO', color: '#EF4444', text: '#FFFFFF' },
      { name: 'Out of Service - Renovation', short: 'OOS', code: 'OOS', color: '#6B7280', text: '#FFFFFF' },
      { name: 'VIP Reserved - Bonvoy', short: 'VIP', code: 'VIP', color: '#8B5CF6', text: '#FFFFFF' }
    ];
    for (const s of statuses10002) {
      await client.query(
        'INSERT INTO room_status (client_id, status_name, short_name, status_code, status_color, text_color, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [10002, s.name, s.short, s.code, s.color, s.text, true]
      );
    }
    await client.query('COMMIT');
    console.log('Room statuses seeded successfully');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Failed to seed room statuses:', e);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
