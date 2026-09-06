import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { testConnection } from './db/pool.js';
import { runMigrations } from './db/migrate.js';
import { configurationRouter } from './modules/configuration/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { sendSuccess } from './utils/response.js';
async function startServer() {
    const app = express();
    const PORT = 3000;
    // Body parsers
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    // Basic request logger in development
    if (process.env.NODE_ENV !== 'production') {
        app.use((req, res, next) => {
            const start = Date.now();
            res.on('finish', () => {
                if (req.path.startsWith('/api')) {
                    console.log(`[${req.method}] ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms)`);
                }
            });
            next();
        });
    }
    // Health and Diagnostic Endpoints
    app.get('/api/health', async (req, res) => {
        const dbStatus = await testConnection();
        return sendSuccess(res, {
            status: 'healthy',
            database: dbStatus,
            uptime: process.uptime(),
            service: 'StayOS PMS Configuration API',
            version: '1.0.0',
        });
    });
    // DB Migration Endpoint (for applying SQL schema & trigger to connected Supabase instance)
    app.post('/api/migrate', async (req, res, next) => {
        try {
            const result = await runMigrations();
            if (!result.success) {
                return res.status(500).json({
                    error: {
                        code: 'MIGRATION_FAILED',
                        message: result.error,
                    },
                    applied: result.applied,
                });
            }
            return sendSuccess(res, {
                message: 'Database migrations and triggers applied successfully',
                applied: result.applied,
            });
        }
        catch (err) {
            next(err);
        }
    });
    // ==================== API ROUTING ====================
    // Mount StayOS Configuration REST Modules
    app.use('/api/v1/configuration', configurationRouter);
    app.use('/api/configuration', configurationRouter); // Version-agnostic fallback
    // ==================== STATIC / VITE MIDDLEWARE ====================
    if (process.env.NODE_ENV !== 'production') {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'spa',
        });
        app.use(vite.middlewares);
    }
    else {
        const distPath = path.join(process.cwd(), 'dist');
        app.use(express.static(distPath));
        app.get('*all', (req, res) => {
            res.sendFile(path.join(distPath, 'index.html'));
        });
    }
    // ==================== CENTRALIZED ERROR HANDLER ====================
    // Must be registered after all route handlers and middlewares
    app.use(errorHandler);
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`[StayOS PMS Backend] Server listening on http://0.0.0.0:${PORT}`);
        console.log(`[StayOS PMS Backend] REST API available at http://0.0.0.0:${PORT}/api/v1/configuration`);
    });
}
startServer().catch((err) => {
    console.error('Fatal server startup error:', err);
    process.exit(1);
});
