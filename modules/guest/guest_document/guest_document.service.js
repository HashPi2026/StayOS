import { pool } from '../../../db/pool.js';
import { NotFoundError, ValidationError } from '../../../utils/errors.js';

export class GuestDocumentService {
  /**
   * List documents for a guest
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
      SELECT gd.*, dt.document_name, dt.short_name AS document_type_short_name
      FROM guest_document gd
      JOIN guest g ON g.guest_id = gd.guest_id
      LEFT JOIN document_type dt ON dt.document_type_id = gd.document_type_id
      WHERE gd.guest_id = $1 AND g.client_id = $2
      ORDER BY gd.is_primary DESC, gd.guest_document_id ASC;
    `;
    const { rows } = await pool.query(query, [guestId, clientId]);
    return rows;
  }

  /**
   * Add a document entry for a guest
   * Validates document_type belongs to tenant
   * Handles atomic is_primary flipping
   */
  async createDocument(clientId, guestId, data) {
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

      // Verify document_type_id
      const docTypeId = parseInt(data.document_type_id, 10);
      if (isNaN(docTypeId) || docTypeId <= 0) {
        throw new ValidationError('Valid document_type_id is required.');
      }
      const docTypeRes = await client.query(
        'SELECT document_type_id FROM document_type WHERE document_type_id = $1 AND client_id = $2',
        [docTypeId, clientId]
      );
      if (docTypeRes.rows.length === 0) {
        throw new ValidationError(`Document type with ID ${docTypeId} does not exist for this property.`);
      }

      const isPrimary = Boolean(data.is_primary);

      // Atomically flip other documents for this guest to false
      if (isPrimary) {
        await client.query(
          'UPDATE guest_document SET is_primary = FALSE WHERE guest_id = $1',
          [guestId]
        );
      }

      const insertQuery = `
        INSERT INTO guest_document (
          guest_id, document_type_id, document_number, valid_till,
          name_on_document, issued_by, issue_place, is_primary,
          address, city, state, zip_code, country, remark,
          front_image, back_image
        ) VALUES (
          $1, $2, $3, $4,
          $5, $6, $7, $8,
          $9, $10, $11, $12, $13, $14,
          $15, $16
        )
        RETURNING *;
      `;
      const values = [
        guestId,
        docTypeId,
        data.document_number?.trim() || null,
        data.valid_till || null,
        data.name_on_document?.trim() || null,
        data.issued_by?.trim() || null,
        data.issue_place?.trim() || null,
        isPrimary,
        data.address?.trim() || null,
        data.city?.trim() || null,
        data.state?.trim() || null,
        data.zip_code?.trim() || null,
        data.country?.trim() || null,
        data.remark?.trim() || null,
        data.front_image || null,
        data.back_image || null,
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
   * Update a document entry by ID
   * Strictly verifies tenant isolation by joining parent guest!
   * Handles atomic is_primary flipping
   */
  async updateDocument(clientId, documentId, data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Verify document exists and parent guest belongs to clientId
      const checkQuery = `
        SELECT gd.*, g.client_id
        FROM guest_document gd
        JOIN guest g ON g.guest_id = gd.guest_id
        WHERE gd.guest_document_id = $1 AND g.client_id = $2
        FOR UPDATE;
      `;
      const { rows: existingRows } = await client.query(checkQuery, [documentId, clientId]);
      if (existingRows.length === 0) {
        throw new NotFoundError('Guest Document', documentId);
      }
      const current = existingRows[0];
      const guestId = current.guest_id;

      // If updating document_type_id, validate
      let docTypeId = current.document_type_id;
      if (data.document_type_id !== undefined) {
        docTypeId = parseInt(data.document_type_id, 10);
        if (isNaN(docTypeId) || docTypeId <= 0) {
          throw new ValidationError('Valid document_type_id is required.');
        }
        const docTypeRes = await client.query(
          'SELECT document_type_id FROM document_type WHERE document_type_id = $1 AND client_id = $2',
          [docTypeId, clientId]
        );
        if (docTypeRes.rows.length === 0) {
          throw new ValidationError(`Document type with ID ${docTypeId} does not exist for this property.`);
        }
      }

      const isPrimary = data.is_primary !== undefined ? Boolean(data.is_primary) : current.is_primary;

      if (isPrimary) {
        await client.query(
          'UPDATE guest_document SET is_primary = FALSE WHERE guest_id = $1 AND guest_document_id != $2',
          [guestId, documentId]
        );
      }

      const updateQuery = `
        UPDATE guest_document SET
          document_type_id = $1,
          document_number = $2,
          valid_till = $3,
          name_on_document = $4,
          issued_by = $5,
          issue_place = $6,
          is_primary = $7,
          address = $8,
          city = $9,
          state = $10,
          zip_code = $11,
          country = $12,
          remark = $13,
          front_image = $14,
          back_image = $15
        WHERE guest_document_id = $16
        RETURNING *;
      `;
      const values = [
        docTypeId,
        data.document_number !== undefined ? data.document_number?.trim() || null : current.document_number,
        data.valid_till !== undefined ? data.valid_till || null : current.valid_till,
        data.name_on_document !== undefined ? data.name_on_document?.trim() || null : current.name_on_document,
        data.issued_by !== undefined ? data.issued_by?.trim() || null : current.issued_by,
        data.issue_place !== undefined ? data.issue_place?.trim() || null : current.issue_place,
        isPrimary,
        data.address !== undefined ? data.address?.trim() || null : current.address,
        data.city !== undefined ? data.city?.trim() || null : current.city,
        data.state !== undefined ? data.state?.trim() || null : current.state,
        data.zip_code !== undefined ? data.zip_code?.trim() || null : current.zip_code,
        data.country !== undefined ? data.country?.trim() || null : current.country,
        data.remark !== undefined ? data.remark?.trim() || null : current.remark,
        data.front_image !== undefined ? data.front_image || null : current.front_image,
        data.back_image !== undefined ? data.back_image || null : current.back_image,
        documentId,
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
   * Delete document entry
   */
  async deleteDocument(clientId, documentId) {
    const checkQuery = `
      SELECT gd.guest_document_id
      FROM guest_document gd
      JOIN guest g ON g.guest_id = gd.guest_id
      WHERE gd.guest_document_id = $1 AND g.client_id = $2;
    `;
    const { rows } = await pool.query(checkQuery, [documentId, clientId]);
    if (rows.length === 0) {
      throw new NotFoundError('Guest Document', documentId);
    }

    await pool.query('DELETE FROM guest_document WHERE guest_document_id = $1', [documentId]);
    return true;
  }
}

export const guestDocumentService = new GuestDocumentService();
