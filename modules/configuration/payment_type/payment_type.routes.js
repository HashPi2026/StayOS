import { Router } from 'express';
import { query } from '../../../db/pool.js';
import { sendSuccess, sendCreated, sendNoContent } from '../../../utils/response.js';
import { NotFoundError, ValidationError } from '../../../utils/errors.js';

export const paymentTypeRouter = Router();

paymentTypeRouter.get('/', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const result = await query(
      `SELECT * FROM payment_type WHERE client_id = $1 ORDER BY payment_type_id ASC`,
      [clientId]
    );
    sendSuccess(res, result.rows);
  } catch (err) {
    next(err);
  }
});

paymentTypeRouter.post('/', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const { short_name, payment_type_name, category_name, description, credit_card_processing } = req.body;

    if (!short_name || !payment_type_name) {
      throw new ValidationError('Short name and payment type name are required.');
    }

    const result = await query(
      `INSERT INTO payment_type (client_id, short_name, payment_type_name, category_name, description, credit_card_processing)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [clientId, short_name, payment_type_name, category_name || 'Credit Card', description || '', credit_card_processing ?? false]
    );

    sendCreated(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
});

paymentTypeRouter.put('/:id', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const id = parseInt(req.params.id, 10);
    const { short_name, payment_type_name, category_name, description, credit_card_processing } = req.body;

    const result = await query(
      `UPDATE payment_type SET
        short_name = COALESCE($1, short_name),
        payment_type_name = COALESCE($2, payment_type_name),
        category_name = COALESCE($3, category_name),
        description = COALESCE($4, description),
        credit_card_processing = COALESCE($5, credit_card_processing)
       WHERE client_id = $6 AND payment_type_id = $7
       RETURNING *`,
      [short_name, payment_type_name, category_name, description, credit_card_processing, clientId, id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError(`Payment type #${id} not found.`);
    }

    sendSuccess(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
});

paymentTypeRouter.delete('/:id', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const id = parseInt(req.params.id, 10);

    const result = await query(
      `DELETE FROM payment_type WHERE client_id = $1 AND payment_type_id = $2`,
      [clientId, id]
    );

    if (result.rowCount === 0) {
      throw new NotFoundError(`Payment type #${id} not found.`);
    }

    sendNoContent(res);
  } catch (err) {
    next(err);
  }
});
