import { Router } from 'express';
import { query } from '../../../db/pool.js';
import { sendSuccess, sendCreated, sendNoContent } from '../../../utils/response.js';
import { NotFoundError, ValidationError } from '../../../utils/errors.js';

export const exchangeRateRouter = Router();

exchangeRateRouter.get('/', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const result = await query(
      `SELECT * FROM exchange_rate WHERE client_id = $1 ORDER BY is_base_rate DESC, exchange_rate_id ASC`,
      [clientId]
    );
    sendSuccess(res, result.rows);
  } catch (err) {
    next(err);
  }
});

exchangeRateRouter.post('/', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const { country_name, currency_name, currency_sign, rate, is_base_rate } = req.body;

    if (!country_name || !currency_name) {
      throw new ValidationError('Country name and currency name are required.');
    }

    if (is_base_rate) {
      // Unset previous base rate
      await query(`UPDATE exchange_rate SET is_base_rate = FALSE WHERE client_id = $1`, [clientId]);
    }

    const result = await query(
      `INSERT INTO exchange_rate (client_id, country_name, currency_name, currency_sign, rate, is_base_rate)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [clientId, country_name, currency_name, currency_sign || '$', rate || 1.0, is_base_rate ?? false]
    );

    sendCreated(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
});

exchangeRateRouter.put('/:id', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const id = parseInt(req.params.id, 10);
    const { country_name, currency_name, currency_sign, rate, is_base_rate } = req.body;

    if (is_base_rate) {
      await query(`UPDATE exchange_rate SET is_base_rate = FALSE WHERE client_id = $1`, [clientId]);
    }

    const result = await query(
      `UPDATE exchange_rate SET
        country_name = COALESCE($1, country_name),
        currency_name = COALESCE($2, currency_name),
        currency_sign = COALESCE($3, currency_sign),
        rate = COALESCE($4, rate),
        is_base_rate = COALESCE($5, is_base_rate)
       WHERE client_id = $6 AND exchange_rate_id = $7
       RETURNING *`,
      [country_name, currency_name, currency_sign, rate, is_base_rate, clientId, id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError(`Exchange rate #${id} not found.`);
    }

    sendSuccess(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
});

exchangeRateRouter.delete('/:id', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const id = parseInt(req.params.id, 10);

    const result = await query(
      `DELETE FROM exchange_rate WHERE client_id = $1 AND exchange_rate_id = $2`,
      [clientId, id]
    );

    if (result.rowCount === 0) {
      throw new NotFoundError(`Exchange rate #${id} not found.`);
    }

    sendNoContent(res);
  } catch (err) {
    next(err);
  }
});
