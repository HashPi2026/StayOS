import fs from 'fs';
import path from 'path';
import { pool } from './pool.js';
function resolveMigrationsDir() {
    const cwdDir = path.join(process.cwd(), 'db', 'migrations');
    if (fs.existsSync(cwdDir)) {
        return cwdDir;
    }
    // Fallback if __dirname is available in CJS environments
    if (typeof __dirname !== 'undefined') {
        const localDir = path.join(__dirname, 'migrations');
        if (fs.existsSync(localDir))
            return localDir;
        const parentDir = path.join(__dirname, '..', 'db', 'migrations');
        if (fs.existsSync(parentDir))
            return parentDir;
    }
    return cwdDir;
}
export async function runMigrations() {
    const migrationsDir = resolveMigrationsDir();
    const applied = [];
    console.log('[Migration Runner] Starting database migration...');
    try {
        const files = fs
            .readdirSync(migrationsDir)
            .filter((file) => file.endsWith('.sql'))
            .sort();
        for (const file of files) {
            const filePath = path.join(migrationsDir, file);
            console.log(`[Migration Runner] Applying ${file}...`);
            const sql = fs.readFileSync(filePath, 'utf-8');
            const client = await pool.connect();
            try {
                await client.query(sql);
                applied.push(file);
                console.log(`[Migration Runner] Successfully applied ${file}`);
            }
            finally {
                client.release();
            }
        }
        console.log(`[Migration Runner] All migrations applied successfully (${applied.length} files).`);
        return { success: true, applied };
    }
    catch (err) {
        console.error('[Migration Runner] Migration failed:', err);
        return { success: false, applied, error: err.message || String(err) };
    }
}
// Allow direct execution: tsx db/migrate.ts
if (process.argv[1] && process.argv[1].endsWith('migrate.ts')) {
    runMigrations()
        .then((result) => {
        if (!result.success) {
            process.exit(1);
        }
        process.exit(0);
    })
        .catch((err) => {
        console.error(err);
        process.exit(1);
    });
}
