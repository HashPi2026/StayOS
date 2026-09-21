import { Router } from 'express';
import { query } from '../../../db/pool.js';
import { sendSuccess, sendCreated, sendNoContent } from '../../../utils/response.js';
import { NotFoundError, ValidationError } from '../../../utils/errors.js';

export const otherChargesRouter = Router();

// Other Charges Categories
otherChargesRouter.get('/categories', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const result = await query(
      `SELECT * FROM other_charges_category WHERE client_id = $1 ORDER BY occ_id ASC`,
      [clientId]
    );
    sendSuccess(res, result.rows);
  } catch (err) {
    next(err);
  }
});

otherChargesRouter.post('/categories', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const { short_name, category_name, description, is_default } = req.body;

    if (!short_name || !category_name) {
      throw new ValidationError('Category name and short name are required.');
    }

    const result = await query(
      `INSERT INTO other_charges_category (client_id, short_name, category_name, description, is_default)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [clientId, short_name, category_name, description || '', is_default ?? false]
    );

    sendCreated(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
});

otherChargesRouter.put('/categories/:id', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const id = parseInt(req.params.id, 10);
    const { short_name, category_name, description, is_default } = req.body;

    const result = await query(
      `UPDATE other_charges_category SET
        short_name = COALESCE($1, short_name),
        category_name = COALESCE($2, category_name),
        description = COALESCE($3, description),
        is_default = COALESCE($4, is_default)
       WHERE client_id = $5 AND occ_id = $6
       RETURNING *`,
      [short_name, category_name, description, is_default, clientId, id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError(`Category #${id} not found.`);
    }

    sendSuccess(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
});

otherChargesRouter.delete('/categories/:id', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const id = parseInt(req.params.id, 10);

    const result = await query(
      `DELETE FROM other_charges_category WHERE client_id = $1 AND occ_id = $2`,
      [clientId, id]
    );

    if (result.rowCount === 0) {
      throw new NotFoundError(`Category #${id} not found.`);
    }

    sendNoContent(res);
  } catch (err) {
    next(err);
  }
});

// Other Charges Items
otherChargesRouter.get('/', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const result = await query(
      `SELECT oc.*, occ.category_name 
       FROM other_charges oc
       LEFT JOIN other_charges_category occ ON oc.occ_id = occ.occ_id
       WHERE oc.client_id = $1 
       ORDER BY oc.oc_id ASC`,
      [clientId]
    );
    sendSuccess(res, result.rows);
  } catch (err) {
    next(err);
  }
});

otherChargesRouter.post('/', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const {
      occ_id,
      short_name,
      charge_name,
      taxable,
      always_charge,
      reoccur_charge,
      reoccur_frequency,
      crs_charge,
      call_logging_charge,
      pos_charge,
      forecasting_revenue,
    } = req.body;

    if (!short_name || !charge_name) {
      throw new ValidationError('Charge name and short name are required.');
    }

    const result = await query(
      `INSERT INTO other_charges (
        client_id, occ_id, short_name, charge_name, taxable, always_charge,
        reoccur_charge, reoccur_frequency, crs_charge, call_logging_charge,
        pos_charge, forecasting_revenue
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
      ) RETURNING *`,
      [
        clientId,
        occ_id || null,
        short_name,
        charge_name,
        taxable ?? true,
        always_charge ?? false,
        reoccur_charge ?? false,
        reoccur_frequency || null,
        crs_charge ?? false,
        call_logging_charge ?? false,
        pos_charge ?? false,
        forecasting_revenue ?? true,
      ]
    );

    sendCreated(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
});

otherChargesRouter.put('/:id', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const id = parseInt(req.params.id, 10);
    const {
      occ_id,
      short_name,
      charge_name,
      taxable,
      always_charge,
      reoccur_charge,
      reoccur_frequency,
      crs_charge,
      call_logging_charge,
      pos_charge,
      forecasting_revenue,
    } = req.body;

    const result = await query(
      `UPDATE other_charges SET
        occ_id = COALESCE($1, occ_id),
        short_name = COALESCE($2, short_name),
        charge_name = COALESCE($3, charge_name),
        taxable = COALESCE($4, taxable),
        always_charge = COALESCE($5, always_charge),
        reoccur_charge = COALESCE($6, reoccur_charge),
        reoccur_frequency = COALESCE($7, reoccur_frequency),
        crs_charge = COALESCE($8, crs_charge),
        call_logging_charge = COALESCE($9, call_logging_charge),
        pos_charge = COALESCE($10, pos_charge),
        forecasting_revenue = COALESCE($11, forecasting_revenue)
       WHERE client_id = $12 AND oc_id = $13
       RETURNING *`,
      [
        occ_id,
        short_name,
        charge_name,
        taxable,
        always_charge,
        reoccur_charge,
        reoccur_frequency,
        crs_charge,
        call_logging_charge,
        pos_charge,
        forecasting_revenue,
        clientId,
        id,
      ]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError(`Other charge #${id} not found.`);
    }

    sendSuccess(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
});

otherChargesRouter.delete('/:id', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const id = parseInt(req.params.id, 10);

    const result = await query(
      `DELETE FROM other_charges WHERE client_id = $1 AND oc_id = $2`,
      [clientId, id]
    );

    if (result.rowCount === 0) {
      throw new NotFoundError(`Other charge #${id} not found.`);
    }

    sendNoContent(res);
  } catch (err) {
    next(err);
  }
});
