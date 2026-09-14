import { pool } from '../../../db/pool.js';
import { NotFoundError, ValidationError } from '../../../utils/errors.js';

export class ContactDocumentService {
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
      SELECT cdoc.*, dt.document_name, dt.short_name AS document_type_short_name
      FROM contact_document cdoc
      JOIN contact c ON c.contact_id = cdoc.contact_id
      LEFT JOIN document_type dt ON dt.document_type_id = cdoc.document_type_id
      WHERE cdoc.contact_id = $1 AND c.client_id = $2
      ORDER BY cdoc.contact_document_id ASC;
    `;
    const { rows } = await pool.query(query, [contactId, clientId]);
    return rows;
  }

  async createDocument(clientId, contactId, data) {
    // Verify parent contact belongs to clientId
    const { rows: parentRows } = await pool.query(
      'SELECT contact_id FROM contact WHERE contact_id = $1 AND client_id = $2',
      [contactId, clientId]
    );
    if (parentRows.length === 0) {
      throw new NotFoundError('Contact', contactId);
    }

    const docTypeId = parseInt(data.document_type_id, 10);
    if (isNaN(docTypeId) || docTypeId <= 0) {
      throw new ValidationError('Valid document_type_id is required.');
    }
    const { rows: docTypeRows } = await pool.query(
      'SELECT document_type_id FROM document_type WHERE document_type_id = $1 AND client_id = $2',
      [docTypeId, clientId]
    );
    if (docTypeRows.length === 0) {
      throw new ValidationError(`Document type with ID ${docTypeId} does not exist for this property.`);
    }

    const insertQuery = `
      INSERT INTO contact_document (contact_id, document_type_id, document_number)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [
      contactId,
      docTypeId,
      data.document_number?.trim() || null,
    ];

    const { rows } = await pool.query(insertQuery, values);
    return rows[0];
  }

  async updateDocument(clientId, documentId, data) {
    // Verify contact_document exists and parent contact belongs to clientId
    const checkQuery = `
      SELECT cdoc.*, c.client_id
      FROM contact_document cdoc
      JOIN contact c ON c.contact_id = cdoc.contact_id
      WHERE cdoc.contact_document_id = $1 AND c.client_id = $2;
    `;
    const { rows: existingRows } = await pool.query(checkQuery, [documentId, clientId]);
    if (existingRows.length === 0) {
      throw new NotFoundError('Contact Document', documentId);
    }
    const current = existingRows[0];

    let docTypeId = current.document_type_id;
    if (data.document_type_id !== undefined) {
      docTypeId = parseInt(data.document_type_id, 10);
      if (isNaN(docTypeId) || docTypeId <= 0) {
        throw new ValidationError('Valid document_type_id is required.');
      }
      const { rows: docTypeRows } = await pool.query(
        'SELECT document_type_id FROM document_type WHERE document_type_id = $1 AND client_id = $2',
        [docTypeId, clientId]
      );
      if (docTypeRows.length === 0) {
        throw new ValidationError(`Document type with ID ${docTypeId} does not exist for this property.`);
      }
    }

    const updateQuery = `
      UPDATE contact_document SET
        document_type_id = $1,
        document_number = $2
      WHERE contact_document_id = $3
      RETURNING *;
    `;
    const values = [
      docTypeId,
      data.document_number !== undefined ? data.document_number?.trim() || null : current.document_number,
      documentId,
    ];

    const { rows } = await pool.query(updateQuery, values);
    return rows[0];
  }

  async deleteDocument(clientId, documentId) {
    const checkQuery = `
      SELECT cdoc.contact_document_id
      FROM contact_document cdoc
      JOIN contact c ON c.contact_id = cdoc.contact_id
      WHERE cdoc.contact_document_id = $1 AND c.client_id = $2;
    `;
    const { rows } = await pool.query(checkQuery, [documentId, clientId]);
    if (rows.length === 0) {
      throw new NotFoundError('Contact Document', documentId);
    }

    await pool.query('DELETE FROM contact_document WHERE contact_document_id = $1', [documentId]);
    return true;
  }
}

export const contactDocumentService = new ContactDocumentService();
