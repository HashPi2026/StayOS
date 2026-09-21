import { pool } from '../../../db/pool.js';
import { NotFoundError, ValidationError } from '../../../utils/errors.js';
import { parseSafeIsoDate } from '../guest/guest.service.js';

export class ContactService {
  async listContacts(clientId, filters = {}) {
    const { category_id, search, limit = 50, offset = 0 } = filters;
    const params = [clientId];
    let query = `
      SELECT c.*, cc.category_name,
        (SELECT COUNT(*)::int FROM contact_detail cd WHERE cd.contact_id = c.contact_id) AS detail_count,
        (SELECT COUNT(*)::int FROM contact_document cdoc WHERE cdoc.contact_id = c.contact_id) AS document_count
      FROM contact c
      JOIN contact_category cc ON cc.contact_category_id = c.contact_category_id
      WHERE c.client_id = $1
    `;

    if (category_id) {
      params.push(Number(category_id));
      query += ` AND c.contact_category_id = $${params.length}`;
    }

    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      query += ` AND (
        c.full_name ILIKE $${params.length} OR
        c.company ILIKE $${params.length}
      )`;
    }

    query += ` ORDER BY c.contact_id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2};`;
    params.push(Number(limit) || 50, Number(offset) || 0);

    const { rows } = await pool.query(query, params);
    return rows;
  }

  async getContactById(clientId, contactId) {
    const query = `
      SELECT c.*, cc.category_name
      FROM contact c
      JOIN contact_category cc ON cc.contact_category_id = c.contact_category_id
      WHERE c.contact_id = $1 AND c.client_id = $2
      LIMIT 1;
    `;
    const { rows: contactRows } = await pool.query(query, [contactId, clientId]);
    if (contactRows.length === 0) {
      throw new NotFoundError('Contact', contactId);
    }
    const contact = contactRows[0];

    // Nested details
    const detailsQuery = `
      SELECT cd.*
      FROM contact_detail cd
      WHERE cd.contact_id = $1
      ORDER BY cd.is_primary DESC, cd.contact_detail_id ASC;
    `;
    const { rows: details } = await pool.query(detailsQuery, [contactId]);

    // Nested documents
    const docsQuery = `
      SELECT cdoc.*, dt.document_name, dt.short_name AS document_type_short_name
      FROM contact_document cdoc
      LEFT JOIN document_type dt ON dt.document_type_id = cdoc.document_type_id
      WHERE cdoc.contact_id = $1
      ORDER BY cdoc.contact_document_id ASC;
    `;
    const { rows: documents } = await pool.query(docsQuery, [contactId]);

    return {
      ...contact,
      details,
      documents,
    };
  }

  async createContact(clientId, data) {
    const { full_name, contact_category_id, birth_date, company } = data;

    if (!full_name || !full_name.trim()) {
      throw new ValidationError('Full name is required.');
    }

    const catId = parseInt(contact_category_id, 10);
    if (isNaN(catId) || catId <= 0) {
      throw new ValidationError('Valid contact_category_id is required.');
    }

    // Verify category belongs to caller's property
    const { rows: catRows } = await pool.query(
      'SELECT contact_category_id FROM contact_category WHERE contact_category_id = $1 AND client_id = $2',
      [catId, clientId]
    );
    if (catRows.length === 0) {
      throw new ValidationError(`Contact category with ID ${catId} does not exist for this property.`);
    }

    const insertQuery = `
      INSERT INTO contact (client_id, contact_category_id, full_name, birth_date, company)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [
      clientId,
      catId,
      full_name.trim(),
      parseSafeIsoDate(birth_date),
      company?.trim() || null,
    ];

    const { rows } = await pool.query(insertQuery, values);
    return rows[0];
  }

  async updateContact(clientId, contactId, data) {
    const { rows: existingRows } = await pool.query(
      'SELECT * FROM contact WHERE contact_id = $1 AND client_id = $2',
      [contactId, clientId]
    );
    if (existingRows.length === 0) {
      throw new NotFoundError('Contact', contactId);
    }
    const current = existingRows[0];

    const fullName = data.full_name !== undefined ? data.full_name?.trim() : current.full_name;
    if (!fullName) {
      throw new ValidationError('Full name cannot be empty.');
    }

    let catId = current.contact_category_id;
    if (data.contact_category_id !== undefined) {
      catId = parseInt(data.contact_category_id, 10);
      if (isNaN(catId) || catId <= 0) {
        throw new ValidationError('Valid contact_category_id is required.');
      }
      const { rows: catRows } = await pool.query(
        'SELECT contact_category_id FROM contact_category WHERE contact_category_id = $1 AND client_id = $2',
        [catId, clientId]
      );
      if (catRows.length === 0) {
        throw new ValidationError(`Contact category with ID ${catId} does not exist for this property.`);
      }
    }

    const updateQuery = `
      UPDATE contact SET
        contact_category_id = $1,
        full_name = $2,
        birth_date = $3,
        company = $4
      WHERE contact_id = $5 AND client_id = $6
      RETURNING *;
    `;
    const values = [
      catId,
      fullName,
      data.birth_date !== undefined ? parseSafeIsoDate(data.birth_date) : current.birth_date,
      data.company !== undefined ? data.company?.trim() || null : current.company,
      contactId,
      clientId,
    ];

    const { rows } = await pool.query(updateQuery, values);
    return rows[0];
  }

  async deleteContact(clientId, contactId) {
    const { rows } = await pool.query(
      'SELECT contact_id FROM contact WHERE contact_id = $1 AND client_id = $2',
      [contactId, clientId]
    );
    if (rows.length === 0) {
      throw new NotFoundError('Contact', contactId);
    }

    await pool.query('DELETE FROM contact WHERE contact_id = $1 AND client_id = $2', [contactId, clientId]);
    return true;
  }
}

export const contactService = new ContactService();
