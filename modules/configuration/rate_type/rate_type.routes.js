import { Router } from 'express';
import { query } from '../../../db/pool.js';
import { sendSuccess, sendCreated, sendNoContent } from '../../../utils/response.js';
import { NotFoundError, ValidationError } from '../../../utils/errors.js';

export const rateTypeRouter = Router();

rateTypeRouter.get('/', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const result = await query(
      `SELECT * FROM rate_type WHERE client_id = $1 ORDER BY rate_type_id ASC`,
      [clientId]
    );
    sendSuccess(res, result.rows);
  } catch (err) {
    next(err);
  }
});

rateTypeRouter.post('/', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const {
      short_name,
      rate_type_name,
      description,
      bind_with_rate,
      is_hourly,
      is_crs_tax_inclusive,
      crs_enable,
      code,
      is_active,
      market_code,
      meal_plan,
    } = req.body;

    if (!short_name || !rate_type_name) {
      throw new ValidationError('Short name and rate type name are required.');
    }

    const result = await query(
      `INSERT INTO rate_type (
        client_id, short_name, rate_type_name, description, bind_with_rate,
        is_hourly, is_crs_tax_inclusive, crs_enable, code, is_active,
        market_code, meal_plan, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING *`,
      [
        clientId,
        short_name,
        rate_type_name,
        description || '',
        bind_with_rate || 0,
        is_hourly ?? false,
        is_crs_tax_inclusive ?? false,
        crs_enable ?? false,
        code || short_name,
        is_active ?? true,
        market_code || 'BAR',
        meal_plan || 'EP',
      ]
    );

    sendCreated(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
});

rateTypeRouter.put('/:id', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const id = parseInt(req.params.id, 10);
    const {
      short_name,
      rate_type_name,
      description,
      bind_with_rate,
      is_hourly,
      is_crs_tax_inclusive,
      crs_enable,
      code,
      is_active,
      market_code,
      meal_plan,
    } = req.body;

    const result = await query(
      `UPDATE rate_type SET
        short_name = COALESCE($1, short_name),
        rate_type_name = COALESCE($2, rate_type_name),
        description = COALESCE($3, description),
        bind_with_rate = COALESCE($4, bind_with_rate),
        is_hourly = COALESCE($5, is_hourly),
        is_crs_tax_inclusive = COALESCE($6, is_crs_tax_inclusive),
        crs_enable = COALESCE($7, crs_enable),
        code = COALESCE($8, code),
        is_active = COALESCE($9, is_active),
        market_code = COALESCE($10, market_code),
        meal_plan = COALESCE($11, meal_plan),
        updated_at = CURRENT_TIMESTAMP
       WHERE client_id = $12 AND rate_type_id = $13
       RETURNING *`,
      [
        short_name,
        rate_type_name,
        description,
        bind_with_rate,
        is_hourly,
        is_crs_tax_inclusive,
        crs_enable,
        code,
        is_active,
        market_code,
        meal_plan,
        clientId,
        id,
      ]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError(`Rate type #${id} not found.`);
    }

    sendSuccess(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
});

rateTypeRouter.delete('/:id', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const id = parseInt(req.params.id, 10);

    const result = await query(
      `DELETE FROM rate_type WHERE client_id = $1 AND rate_type_id = $2`,
      [clientId, id]
    );

    if (result.rowCount === 0) {
      throw new NotFoundError(`Rate type #${id} not found.`);
    }

    sendNoContent(res);
  } catch (err) {
    next(err);
  }
});
