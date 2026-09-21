import { Router } from 'express';
import { query } from '../../../db/pool.js';
import { sendSuccess, sendCreated } from '../../../utils/response.js';
import { NotFoundError, ValidationError } from '../../../utils/errors.js';

export const reservationLogRouter = Router();

// GET all reservation logs for active property
reservationLogRouter.get('/', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const { action_type, booking_number, search, limit = 100 } = req.query;

    let sql = `
      SELECT 
        log_id,
        client_id,
        reservation_id,
        booking_number,
        guest_name,
        action_type,
        action_title,
        action_details,
        performed_by_user_id,
        performed_by_name,
        performed_by_role,
        witnessed_by_name,
        witnessed_by_role,
        workstation_or_terminal,
        ip_address,
        previous_values,
        new_values,
        notes,
        created_at
      FROM reservation_log
      WHERE client_id = $1
    `;
    const params = [clientId];
    let paramIndex = 2;

    if (action_type) {
      sql += ` AND action_type = $${paramIndex}`;
      params.push(String(action_type));
      paramIndex++;
    }

    if (booking_number) {
      sql += ` AND booking_number ILIKE $${paramIndex}`;
      params.push(`%${booking_number}%`);
      paramIndex++;
    }

    if (search) {
      sql += ` AND (booking_number ILIKE $${paramIndex} OR guest_name ILIKE $${paramIndex} OR performed_by_name ILIKE $${paramIndex} OR action_details ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex}`;
    params.push(parseInt(String(limit), 10) || 100);

    const result = await query(sql, params);
    sendSuccess(res, result.rows);
  } catch (err) {
    next(err);
  }
});

// GET single reservation log by ID
reservationLogRouter.get('/:id', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const logId = parseInt(req.params.id, 10);
    if (isNaN(logId)) {
      throw new ValidationError('Invalid log ID');
    }

    const result = await query(
      `SELECT * FROM reservation_log WHERE client_id = $1 AND log_id = $2`,
      [clientId, logId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError(`Reservation log #${logId} not found`);
    }

    sendSuccess(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST create a new reservation log
reservationLogRouter.post('/', async (req, res, next) => {
  try {
    const clientId = parseInt(req.clientId, 10);
    const {
      reservation_id,
      booking_number,
      guest_name,
      action_type,
      action_title,
      action_details,
      performed_by_user_id,
      performed_by_name,
      performed_by_role,
      witnessed_by_name,
      witnessed_by_role,
      workstation_or_terminal,
      ip_address,
      previous_values,
      new_values,
      notes
    } = req.body;

    if (!booking_number || !guest_name || !action_type || !action_details) {
      throw new ValidationError('booking_number, guest_name, action_type, and action_details are required.');
    }

    const result = await query(
      `INSERT INTO reservation_log (
        client_id, reservation_id, booking_number, guest_name, action_type,
        action_title, action_details, performed_by_user_id, performed_by_name,
        performed_by_role, witnessed_by_name, witnessed_by_role,
        workstation_or_terminal, ip_address, previous_values, new_values, notes, created_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9,
        $10, $11, $12,
        $13, $14, $15, $16, $17, CURRENT_TIMESTAMP
      ) RETURNING *`,
      [
        clientId,
        reservation_id || null,
        booking_number,
        guest_name,
        action_type,
        action_title || action_type.replace(/_/g, ' '),
        action_details,
        performed_by_user_id || null,
        performed_by_name || 'Staff User',
        performed_by_role || 'Front Desk',
        witnessed_by_name || null,
        witnessed_by_role || null,
        workstation_or_terminal || 'FrontDesk-WS-01',
        ip_address || '192.168.1.101',
        previous_values ? JSON.stringify(previous_values) : null,
        new_values ? JSON.stringify(new_values) : null,
        notes || null
      ]
    );

    sendCreated(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
});
