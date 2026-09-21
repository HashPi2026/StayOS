import { Router } from 'express';
import { query } from '../../../db/pool.js';
import { sendSuccess, sendCreated, sendNoContent } from '../../../utils/response.js';
import { NotFoundError, ValidationError } from '../../../utils/errors.js';

export const policyRouter = Router();

policyRouter.get('/', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const result = await query(
      `SELECT * FROM hotel_policy WHERE client_id = $1 ORDER BY policy_id ASC`,
      [clientId]
    );
    sendSuccess(res, result.rows);
  } catch (err) {
    next(err);
  }
});

policyRouter.post('/', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const { title, category, description, is_active, policy_id: incomingId, id: altId } = req.body;

    if (!title) {
      throw new ValidationError('Policy title is required.');
    }

    const policy_id = incomingId || altId || `HP_${Date.now()}`;

    const result = await query(
      `INSERT INTO hotel_policy (policy_id, client_id, title, category, description, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [policy_id, clientId, title, category || 'General', description || '', is_active ?? true]
    );

    sendCreated(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
});

policyRouter.put('/:id', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const id = req.params.id;
    const { title, category, description, is_active } = req.body;

    const result = await query(
      `UPDATE hotel_policy SET
        title = COALESCE($1, title),
        category = COALESCE($2, category),
        description = COALESCE($3, description),
        is_active = COALESCE($4, is_active),
        updated_at = CURRENT_TIMESTAMP
       WHERE client_id = $5 AND policy_id = $6
       RETURNING *`,
      [title, category, description, is_active, clientId, id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError(`Policy #${id} not found.`);
    }

    sendSuccess(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
});

policyRouter.delete('/:id', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const id = req.params.id;

    const result = await query(
      `DELETE FROM hotel_policy WHERE client_id = $1 AND policy_id = $2`,
      [clientId, id]
    );

    if (result.rowCount === 0) {
      throw new NotFoundError(`Policy #${id} not found.`);
    }

    sendNoContent(res);
  } catch (err) {
    next(err);
  }
});
