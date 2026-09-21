import { Router } from 'express';
import { query } from '../../../db/pool.js';
import { sendSuccess, sendCreated, sendNoContent } from '../../../utils/response.js';
import { NotFoundError, ValidationError } from '../../../utils/errors.js';

export const measurementUnitRouter = Router();

measurementUnitRouter.get('/', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const result = await query(
      `SELECT * FROM measurement_unit WHERE client_id = $1 ORDER BY measurement_id ASC`,
      [clientId]
    );
    sendSuccess(res, result.rows);
  } catch (err) {
    next(err);
  }
});

measurementUnitRouter.post('/', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const { measurement, short_name, description } = req.body;

    if (!measurement || !short_name) {
      throw new ValidationError('Measurement name and short name are required.');
    }

    const result = await query(
      `INSERT INTO measurement_unit (client_id, measurement, short_name, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [clientId, measurement, short_name, description || '']
    );

    sendCreated(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
});

measurementUnitRouter.put('/:id', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const id = parseInt(req.params.id, 10);
    const { measurement, short_name, description } = req.body;

    const result = await query(
      `UPDATE measurement_unit SET
        measurement = COALESCE($1, measurement),
        short_name = COALESCE($2, short_name),
        description = COALESCE($3, description)
       WHERE client_id = $4 AND measurement_id = $5
       RETURNING *`,
      [measurement, short_name, description, clientId, id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError(`Measurement unit #${id} not found.`);
    }

    sendSuccess(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
});

measurementUnitRouter.delete('/:id', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const id = parseInt(req.params.id, 10);

    const result = await query(
      `DELETE FROM measurement_unit WHERE client_id = $1 AND measurement_id = $2`,
      [clientId, id]
    );

    if (result.rowCount === 0) {
      throw new NotFoundError(`Measurement unit #${id} not found.`);
    }

    sendNoContent(res);
  } catch (err) {
    next(err);
  }
});
