import { Router } from 'express';
import { query } from '../../../db/pool.js';
import { sendSuccess, sendCreated, sendNoContent } from '../../../utils/response.js';
import { NotFoundError, ValidationError } from '../../../utils/errors.js';

export const emailTemplateRouter = Router();

emailTemplateRouter.get('/', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const result = await query(
      `SELECT * FROM email_template WHERE client_id = $1 ORDER BY template_id ASC`,
      [clientId]
    );
    sendSuccess(res, result.rows);
  } catch (err) {
    next(err);
  }
});

emailTemplateRouter.post('/', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const {
      template_name,
      trigger_reservation,
      trigger_reservation_update,
      trigger_reservation_cancel,
      trigger_after_reservation_cancel,
      trigger_before_check_in,
      trigger_check_in,
      trigger_after_check_in,
      trigger_before_check_out,
      trigger_check_out,
      trigger_after_check_out,
      trigger_date_of_birth,
    } = req.body;

    if (!template_name) {
      throw new ValidationError('Template name is required.');
    }

    const result = await query(
      `INSERT INTO email_template (
        client_id, template_name, trigger_reservation, trigger_reservation_update,
        trigger_reservation_cancel, trigger_after_reservation_cancel, trigger_before_check_in,
        trigger_check_in, trigger_after_check_in, trigger_before_check_out,
        trigger_check_out, trigger_after_check_out, trigger_date_of_birth
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
      ) RETURNING *`,
      [
        clientId,
        template_name,
        trigger_reservation ?? false,
        trigger_reservation_update ?? false,
        trigger_reservation_cancel ?? false,
        trigger_after_reservation_cancel ?? false,
        trigger_before_check_in ?? false,
        trigger_check_in ?? false,
        trigger_after_check_in ?? false,
        trigger_before_check_out ?? false,
        trigger_check_out ?? false,
        trigger_after_check_out ?? false,
        trigger_date_of_birth ?? false,
      ]
    );

    sendCreated(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
});

emailTemplateRouter.put('/:id', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const id = parseInt(req.params.id, 10);
    const {
      template_name,
      trigger_reservation,
      trigger_reservation_update,
      trigger_reservation_cancel,
      trigger_after_reservation_cancel,
      trigger_before_check_in,
      trigger_check_in,
      trigger_after_check_in,
      trigger_before_check_out,
      trigger_check_out,
      trigger_after_check_out,
      trigger_date_of_birth,
    } = req.body;

    const result = await query(
      `UPDATE email_template SET
        template_name = COALESCE($1, template_name),
        trigger_reservation = COALESCE($2, trigger_reservation),
        trigger_reservation_update = COALESCE($3, trigger_reservation_update),
        trigger_reservation_cancel = COALESCE($4, trigger_reservation_cancel),
        trigger_after_reservation_cancel = COALESCE($5, trigger_after_reservation_cancel),
        trigger_before_check_in = COALESCE($6, trigger_before_check_in),
        trigger_check_in = COALESCE($7, trigger_check_in),
        trigger_after_check_in = COALESCE($8, trigger_after_check_in),
        trigger_before_check_out = COALESCE($9, trigger_before_check_out),
        trigger_check_out = COALESCE($10, trigger_check_out),
        trigger_after_check_out = COALESCE($11, trigger_after_check_out),
        trigger_date_of_birth = COALESCE($12, trigger_date_of_birth)
       WHERE client_id = $13 AND template_id = $14
       RETURNING *`,
      [
        template_name,
        trigger_reservation,
        trigger_reservation_update,
        trigger_reservation_cancel,
        trigger_after_reservation_cancel,
        trigger_before_check_in,
        trigger_check_in,
        trigger_after_check_in,
        trigger_before_check_out,
        trigger_check_out,
        trigger_after_check_out,
        trigger_date_of_birth,
        clientId,
        id,
      ]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError(`Email template #${id} not found.`);
    }

    sendSuccess(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
});

emailTemplateRouter.delete('/:id', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const id = parseInt(req.params.id, 10);

    const result = await query(
      `DELETE FROM email_template WHERE client_id = $1 AND template_id = $2`,
      [clientId, id]
    );

    if (result.rowCount === 0) {
      throw new NotFoundError(`Email template #${id} not found.`);
    }

    sendNoContent(res);
  } catch (err) {
    next(err);
  }
});
