import { pool } from '../../../db/pool.js';
import { NotFoundError, ValidationError } from '../../../utils/errors.js';

export class GuestContactService {
  /**
   * List contact entries for a guest
   * Strictly verifies parent guest belongs to clientId
   */
  async listByGuestId(clientId, guestId) {
    const parentQuery = `
      SELECT guest_id FROM guest
      WHERE guest_id = $1 AND client_id = $2;
    `;
    const { rows: parentRows } = await pool.query(parentQuery, [guestId, clientId]);
    if (parentRows.length === 0) {
      throw new NotFoundError('Guest', guestId);
    }

    const query = `
      SELECT gc.*
      FROM guest_contact gc
      JOIN guest g ON g.guest_id = gc.guest_id
      WHERE gc.guest_id = $1 AND g.client_id = $2
      ORDER BY gc.is_primary DESC, gc.guest_contact_id ASC;
    `;
    const { rows } = await pool.query(query, [guestId, clientId]);
    return rows;
  }

  /**
   * Add a contact entry for a guest
   * Scoped via parent guest. Handles atomic is_primary flipping.
   */
  async createContact(clientId, guestId, data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Verify parent guest belongs to clientId
      const parentRes = await client.query(
        'SELECT guest_id FROM guest WHERE guest_id = $1 AND client_id = $2',
        [guestId, clientId]
      );
      if (parentRes.rows.length === 0) {
        throw new NotFoundError('Guest', guestId);
      }

      const isPrimary = Boolean(data.is_primary);

      // If this contact is marked primary, flip all other contacts for this guest to false
      if (isPrimary) {
        await client.query(
          'UPDATE guest_contact SET is_primary = FALSE WHERE guest_id = $1',
          [guestId]
        );
      }

      const insertQuery = `
        INSERT INTO guest_contact (
          guest_id, contact_type, is_primary, phone_number, email_address,
          address_type, address, city, state, zip_code, country
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10, $11
        )
        RETURNING *;
      `;
      const values = [
        guestId,
        data.contact_type?.trim() || null,
        isPrimary,
        data.phone_number?.trim() || null,
        data.email_address?.trim() || null,
        data.address_type?.trim() || null,
        data.address?.trim() || null,
        data.city?.trim() || null,
        data.state?.trim() || null,
        data.zip_code?.trim() || null,
        data.country?.trim() || null,
      ];

      const { rows } = await client.query(insertQuery, values);
      await client.query('COMMIT');
      return rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Update a contact entry by its own ID
   * Strictly verifies tenant isolation by joining parent guest!
   * Handles atomic is_primary flipping.
   */
  async updateContact(clientId, contactId, data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Verify contact exists and parent guest belongs to caller's clientId
      const checkQuery = `
        SELECT gc.*, g.client_id
        FROM guest_contact gc
        JOIN guest g ON g.guest_id = gc.guest_id
        WHERE gc.guest_contact_id = $1 AND g.client_id = $2
        FOR UPDATE;
      `;
      const { rows: existingRows } = await client.query(checkQuery, [contactId, clientId]);
      if (existingRows.length === 0) {
        throw new NotFoundError('Guest Contact', contactId);
      }
      const current = existingRows[0];
      const guestId = current.guest_id;

      const isPrimary = data.is_primary !== undefined ? Boolean(data.is_primary) : current.is_primary;

      // Atomically flip other contacts to false if this one is primary
      if (isPrimary) {
        await client.query(
          'UPDATE guest_contact SET is_primary = FALSE WHERE guest_id = $1 AND guest_contact_id != $2',
          [guestId, contactId]
        );
      }

      const updateQuery = `
        UPDATE guest_contact SET
          contact_type = $1,
          is_primary = $2,
          phone_number = $3,
          email_address = $4,
          address_type = $5,
          address = $6,
          city = $7,
          state = $8,
          zip_code = $9,
          country = $10
        WHERE guest_contact_id = $11
        RETURNING *;
      `;
      const values = [
        data.contact_type !== undefined ? data.contact_type?.trim() || null : current.contact_type,
        isPrimary,
        data.phone_number !== undefined ? data.phone_number?.trim() || null : current.phone_number,
        data.email_address !== undefined ? data.email_address?.trim() || null : current.email_address,
        data.address_type !== undefined ? data.address_type?.trim() || null : current.address_type,
        data.address !== undefined ? data.address?.trim() || null : current.address,
        data.city !== undefined ? data.city?.trim() || null : current.city,
        data.state !== undefined ? data.state?.trim() || null : current.state,
        data.zip_code !== undefined ? data.zip_code?.trim() || null : current.zip_code,
        data.country !== undefined ? data.country?.trim() || null : current.country,
        contactId,
      ];

      const { rows } = await client.query(updateQuery, values);
      await client.query('COMMIT');
      return rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Delete contact entry
   * Scoped via parent guest JOIN
   */
  async deleteContact(clientId, contactId) {
    const checkQuery = `
      SELECT gc.guest_contact_id
      FROM guest_contact gc
      JOIN guest g ON g.guest_id = gc.guest_id
      WHERE gc.guest_contact_id = $1 AND g.client_id = $2;
    `;
    const { rows } = await pool.query(checkQuery, [contactId, clientId]);
    if (rows.length === 0) {
      throw new NotFoundError('Guest Contact', contactId);
    }

    await pool.query('DELETE FROM guest_contact WHERE guest_contact_id = $1', [contactId]);
    return true;
  }
}

export const guestContactService = new GuestContactService();
