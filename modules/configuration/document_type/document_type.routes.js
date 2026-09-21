import { Router } from 'express';
import { query } from '../../../db/pool.js';
import { sendSuccess, sendCreated, sendNoContent } from '../../../utils/response.js';
import { NotFoundError, ValidationError } from '../../../utils/errors.js';

export const documentTypeRouter = Router();

documentTypeRouter.get('/', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const result = await query(
      `SELECT * FROM document_type WHERE client_id = $1 ORDER BY document_type_id ASC`,
      [clientId]
    );
    sendSuccess(res, result.rows);
  } catch (err) {
    next(err);
  }
});

documentTypeRouter.post('/', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const { short_name, document_name, document_category, description, is_default } = req.body;

    if (!short_name || !document_name) {
      throw new ValidationError('Short name and document name are required.');
    }

    const result = await query(
      `INSERT INTO document_type (client_id, short_name, document_name, document_category, description, is_default)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [clientId, short_name, document_name, document_category || 'Identity', description || '', is_default ?? false]
    );

    sendCreated(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
});

documentTypeRouter.put('/:id', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const id = parseInt(req.params.id, 10);
    const { short_name, document_name, document_category, description, is_default } = req.body;

    const result = await query(
      `UPDATE document_type SET
        short_name = COALESCE($1, short_name),
        document_name = COALESCE($2, document_name),
        document_category = COALESCE($3, document_category),
        description = COALESCE($4, description),
        is_default = COALESCE($5, is_default)
       WHERE client_id = $6 AND document_type_id = $7
       RETURNING *`,
      [short_name, document_name, document_category, description, is_default, clientId, id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError(`Document type #${id} not found.`);
    }

    sendSuccess(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
});

documentTypeRouter.delete('/:id', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const id = parseInt(req.params.id, 10);

    const result = await query(
      `DELETE FROM document_type WHERE client_id = $1 AND document_type_id = $2`,
      [clientId, id]
    );

    if (result.rowCount === 0) {
      throw new NotFoundError(`Document type #${id} not found.`);
    }

    sendNoContent(res);
  } catch (err) {
    next(err);
  }
});
