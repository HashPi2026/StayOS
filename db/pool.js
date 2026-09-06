import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;
const isSupabaseOrRemote = Boolean(connectionString && (connectionString.includes('supabase.co') || connectionString.includes('pooler.supabase.com'))) ||
    process.env.PGSSLMODE === 'require' ||
    process.env.NODE_ENV === 'production';
export const pool = new Pool({
    connectionString: connectionString || undefined,
    host: process.env.PGHOST || 'localhost',
    port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || undefined,
    database: process.env.PGDATABASE || 'postgres',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ssl: isSupabaseOrRemote ? { rejectUnauthorized: false } : undefined,
});
pool.on('error', (err) => {
    console.error('[PostgreSQL Pool Error]: Unexpected error on idle client', err);
});
export async function query(text, params) {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.DEBUG_SQL === 'true') {
        console.log('[Executed Query]:', { text, duration, rows: res.rowCount });
    }
    return res;
}
export async function testConnection() {
    try {
        const res = await pool.query('SELECT NOW() as now, current_database() as db;');
        return {
            connected: true,
            message: `Connected to database: ${res.rows[0].db}`,
            timestamp: res.rows[0].now,
        };
    }
    catch (err) {
        return {
            connected: false,
            message: `Database connection failed: ${err.message || err}`,
        };
    }
}
