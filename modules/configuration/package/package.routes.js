import { Router } from 'express';
import { query } from '../../../db/pool.js';
import { sendSuccess, sendCreated, sendNoContent } from '../../../utils/response.js';
import { NotFoundError, ValidationError } from '../../../utils/errors.js';

export const packageRouter = Router();

packageRouter.get('/', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const result = await query(
      `SELECT * FROM rate_package WHERE client_id = $1 ORDER BY package_id ASC`,
      [clientId]
    );
    sendSuccess(res, result.rows);
  } catch (err) {
    next(err);
  }
});

packageRouter.post('/', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const {
      code,
      name,
      description,
      rate_type_id,
      package_type,
      inclusions,
      base_price,
      extra_adult_price,
      extra_child_price,
      valid_from,
      valid_to,
      min_stay_nights,
      is_active,
      is_crs_enabled,
    } = req.body;

    if (!code || !name) {
      throw new ValidationError('Package code and name are required.');
    }

    const result = await query(
      `INSERT INTO rate_package (
        client_id, code, name, description, rate_type_id, package_type,
        inclusions, base_price, extra_adult_price, extra_child_price,
        valid_from, valid_to, min_stay_nights, is_active, is_crs_enabled,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10,
        $11, $12, $13, $14, $15,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING *`,
      [
        clientId,
        code,
        name,
        description || '',
        rate_type_id || null,
        package_type || 'leisure',
        JSON.stringify(inclusions || []),
        base_price || 0,
        extra_adult_price || 0,
        extra_child_price || 0,
        valid_from || null,
        valid_to || null,
        min_stay_nights || 1,
        is_active ?? true,
        is_crs_enabled ?? false,
      ]
    );

    sendCreated(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
});

packageRouter.put('/:id', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const packageId = parseInt(req.params.id, 10);

    const {
      code,
      name,
      description,
      rate_type_id,
      package_type,
      inclusions,
      base_price,
      extra_adult_price,
      extra_child_price,
      valid_from,
      valid_to,
      min_stay_nights,
      is_active,
      is_crs_enabled,
    } = req.body;

    const result = await query(
      `UPDATE rate_package SET
        code = COALESCE($1, code),
        name = COALESCE($2, name),
        description = COALESCE($3, description),
        rate_type_id = COALESCE($4, rate_type_id),
        package_type = COALESCE($5, package_type),
        inclusions = COALESCE($6, inclusions),
        base_price = COALESCE($7, base_price),
        extra_adult_price = COALESCE($8, extra_adult_price),
        extra_child_price = COALESCE($9, extra_child_price),
        valid_from = $10,
        valid_to = $11,
        min_stay_nights = COALESCE($12, min_stay_nights),
        is_active = COALESCE($13, is_active),
        is_crs_enabled = COALESCE($14, is_crs_enabled),
        updated_at = CURRENT_TIMESTAMP
      WHERE client_id = $15 AND package_id = $16
      RETURNING *`,
      [
        code,
        name,
        description,
        rate_type_id,
        package_type,
        inclusions ? JSON.stringify(inclusions) : null,
        base_price,
        extra_adult_price,
        extra_child_price,
        valid_from,
        valid_to,
        min_stay_nights,
        is_active,
        is_crs_enabled,
        clientId,
        packageId,
      ]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError(`Package #${packageId} not found.`);
    }

    sendSuccess(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
});

packageRouter.delete('/:id', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const packageId = parseInt(req.params.id, 10);

    const result = await query(
      `DELETE FROM rate_package WHERE client_id = $1 AND package_id = $2`,
      [clientId, packageId]
    );

    if (result.rowCount === 0) {
      throw new NotFoundError(`Package #${packageId} not found.`);
    }

    sendNoContent(res);
  } catch (err) {
    next(err);
  }
});
