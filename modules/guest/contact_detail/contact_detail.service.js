import { pool } from '../../../db/pool.js';
import { NotFoundError, ValidationError } from '../../../utils/errors.js';

export class ContactDetailService {
  async listByContactId(clientId, contactId) {
    const parentQuery = `
      SELECT contact_id FROM contact
      WHERE contact_id = $1 AND client_id = $2;
    `;
    const { rows: parentRows } = await pool.query(parentQuery, [contactId, clientId]);
    if (parentRows.length === 0) {
      throw new NotFoundError('Contact', contactId);
    }

    const query = `
      SELECT cd.*
      FROM contact_detail cd
      JOIN contact c ON c.contact_id = cd.contact_id
      WHERE cd.contact_id = $1 AND c.client_id = $2
      ORDER BY cd.is_primary DESC, cd.contact_detail_id ASC;
    `;
    const { rows } = await pool.query(query, [contactId, clientId]);
    return rows;
  }

  async createDetail(clientId, contactId, data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Verify parent contact belongs to clientId
      const parentRes = await client.query(
        'SELECT contact_id FROM contact WHERE contact_id = $1 AND client_id = $2',
        [contactId, clientId]
      );
      if (parentRes.rows.length === 0) {
        throw new NotFoundError('Contact', contactId);
      }

      const isPrimary = Boolean(data.is_primary);

      if (isPrimary) {
        await client.query(
          'UPDATE contact_detail SET is_primary = FALSE WHERE contact_id = $1',
          [contactId]
        );
      }

      const insertQuery = `
        INSERT INTO contact_detail (
          contact_id, contact_type, is_primary, phone_number, email_address,
          address_type, address, city, state, zip_code, country
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10, $11
        )
        RETURNING *;
      `;
      const values = [
        contactId,
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

  async updateDetail(clientId, detailId, data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Verify contact_detail exists and parent contact belongs to clientId
      const checkQuery = `
        SELECT cd.*, c.client_id
        FROM contact_detail cd
        JOIN contact c ON c.contact_id = cd.contact_id
        WHERE cd.contact_detail_id = $1 AND c.client_id = $2
        FOR UPDATE;
      `;
      const { rows: existingRows } = await client.query(checkQuery, [detailId, clientId]);
      if (existingRows.length === 0) {
        throw new NotFoundError('Contact Detail', detailId);
      }
      const current = existingRows[0];
      const contactId = current.contact_id;

      const isPrimary = data.is_primary !== undefined ? Boolean(data.is_primary) : current.is_primary;

      if (isPrimary) {
        await client.query(
          'UPDATE contact_detail SET is_primary = FALSE WHERE contact_id = $1 AND contact_detail_id != $2',
          [contactId, detailId]
        );
      }

      const updateQuery = `
        UPDATE contact_detail SET
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
        WHERE contact_detail_id = $11
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
        detailId,
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

  async deleteDetail(clientId, detailId) {
    const checkQuery = `
      SELECT cd.contact_detail_id
      FROM contact_detail cd
      JOIN contact c ON c.contact_id = cd.contact_id
      WHERE cd.contact_detail_id = $1 AND c.client_id = $2;
    `;
    const { rows } = await pool.query(checkQuery, [detailId, clientId]);
    if (rows.length === 0) {
      throw new NotFoundError('Contact Detail', detailId);
    }

    await pool.query('DELETE FROM contact_detail WHERE contact_detail_id = $1', [detailId]);
    return true;
  }
}

export const contactDetailService = new ContactDetailService();
