import { Router } from 'express';
import { query } from '../../../db/pool.js';
import { sendSuccess, sendCreated, sendNoContent } from '../../../utils/response.js';
import { NotFoundError, ValidationError } from '../../../utils/errors.js';

export const guestCategoryRouter = Router();

guestCategoryRouter.get('/', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const result = await query(
      `SELECT * FROM guest_category WHERE client_id = $1 ORDER BY guest_category_id ASC`,
      [clientId]
    );
    sendSuccess(res, result.rows);
  } catch (err) {
    next(err);
  }
});

guestCategoryRouter.post('/', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const { category_name, short_name, description, is_highlight, color_code } = req.body;

    if (!category_name || !short_name) {
      throw new ValidationError('Category name and short name are required.');
    }

    const result = await query(
      `INSERT INTO guest_category (client_id, category_name, short_name, description, is_highlight, color_code)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [clientId, category_name, short_name, description || '', is_highlight ?? false, color_code || '#3b82f6']
    );

    sendCreated(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
});

guestCategoryRouter.put('/:id', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const id = parseInt(req.params.id, 10);
    const { category_name, short_name, description, is_highlight, color_code } = req.body;

    const result = await query(
      `UPDATE guest_category SET
        category_name = COALESCE($1, category_name),
        short_name = COALESCE($2, short_name),
        description = COALESCE($3, description),
        is_highlight = COALESCE($4, is_highlight),
        color_code = COALESCE($5, color_code)
       WHERE client_id = $6 AND guest_category_id = $7
       RETURNING *`,
      [category_name, short_name, description, is_highlight, color_code, clientId, id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError(`Guest category #${id} not found.`);
    }

    sendSuccess(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
});

guestCategoryRouter.delete('/:id', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const id = parseInt(req.params.id, 10);

    const result = await query(
      `DELETE FROM guest_category WHERE client_id = $1 AND guest_category_id = $2`,
      [clientId, id]
    );

    if (result.rowCount === 0) {
      throw new NotFoundError(`Guest category #${id} not found.`);
    }

    sendNoContent(res);
  } catch (err) {
    next(err);
  }
});
