import { pool } from '../../../db/pool.js';
import { NotFoundError, ValidationError } from '../../../utils/errors.js';

export class GuestService {
  /**
   * Validate DNR rules:
   * Setting dnr_status to anything other than 'No' requires a non-empty dnr_reason.
   */
  validateDnr(dnrStatus, dnrReason, existingStatus = 'No', existingReason = null) {
    const finalStatus = dnrStatus !== undefined ? dnrStatus : existingStatus;
    const finalReason = dnrReason !== undefined ? dnrReason : existingReason;

    if (finalStatus && finalStatus !== 'No') {
      if (!finalReason || typeof finalReason !== 'string' || !finalReason.trim()) {
        throw new ValidationError(
          `DNR status '${finalStatus}' requires a non-empty DNR reason.`,
          { dnr_status: finalStatus, dnr_reason: finalReason }
        );
      }
    }
  }

  /**
   * List guests for property with optional filtering & pagination
   */
  async listGuests(clientId, filters = {}) {
    const { dnr_status, search, limit = 50, offset = 0 } = filters;
    const params = [clientId];
    let query = `
      SELECT g.*,
        (SELECT COUNT(*)::int FROM guest_contact gc WHERE gc.guest_id = g.guest_id) AS contact_count,
        (SELECT COUNT(*)::int FROM guest_document gd WHERE gd.guest_id = g.guest_id) AS document_count
      FROM guest g
      WHERE g.client_id = $1
    `;

    if (dnr_status) {
      params.push(dnr_status);
      query += ` AND g.dnr_status = $${params.length}`;
    }

    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      query += ` AND (
        g.first_name ILIKE $${params.length} OR
        g.last_name ILIKE $${params.length} OR
        CONCAT(g.first_name, ' ', g.last_name) ILIKE $${params.length} OR
        g.company ILIKE $${params.length}
      )`;
    }

    query += ` ORDER BY g.guest_id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2};`;
    params.push(Number(limit) || 50, Number(offset) || 0);

    const { rows } = await pool.query(query, params);
    return rows;
  }

  /**
   * Get single guest by ID with nested contacts and documents
   */
  async getGuestById(clientId, guestId) {
    const guestQuery = `
      SELECT * FROM guest
      WHERE guest_id = $1 AND client_id = $2
      LIMIT 1;
    `;
    const { rows: guestRows } = await pool.query(guestQuery, [guestId, clientId]);
    if (guestRows.length === 0) {
      throw new NotFoundError('Guest', guestId);
    }
    const guest = guestRows[0];

    // Nested contacts
    const contactsQuery = `
      SELECT * FROM guest_contact
      WHERE guest_id = $1
      ORDER BY is_primary DESC, guest_contact_id ASC;
    `;
    const { rows: contacts } = await pool.query(contactsQuery, [guestId]);

    // Nested documents with document_type name
    const docsQuery = `
      SELECT gd.*, dt.document_name, dt.short_name AS document_type_short_name
      FROM guest_document gd
      LEFT JOIN document_type dt ON dt.document_type_id = gd.document_type_id
      WHERE gd.guest_id = $1
      ORDER BY gd.is_primary DESC, gd.guest_document_id ASC;
    `;
    const { rows: documents } = await pool.query(docsQuery, [guestId]);

    return {
      ...guest,
      contacts,
      documents,
    };
  }

  /**
   * Unified Guest Search:
   * Checks Guest + Guest Contact + Guest Document together.
   * Strictly tenant-isolated to caller's client_id.
   * Contact records (commercial) are NEVER included.
   */
  async searchGuests(clientId, term) {
    if (!term || !term.trim()) {
      return [];
    }
    const cleanTerm = term.trim();
    const pattern = `%${cleanTerm}%`;

    const query = `
      SELECT g.*,
        (SELECT COUNT(*)::int FROM guest_contact gc WHERE gc.guest_id = g.guest_id) AS contact_count,
        (SELECT COUNT(*)::int FROM guest_document gd WHERE gd.guest_id = g.guest_id) AS document_count,
        (
          SELECT json_agg(json_build_object('phone_number', gc.phone_number, 'email_address', gc.email_address, 'is_primary', gc.is_primary))
          FROM guest_contact gc
          WHERE gc.guest_id = g.guest_id
        ) AS contacts_summary,
        (
          SELECT json_agg(json_build_object('document_number', gd.document_number, 'document_type_id', gd.document_type_id))
          FROM guest_document gd
          WHERE gd.guest_id = g.guest_id
        ) AS documents_summary
      FROM guest g
      WHERE g.client_id = $1
        AND (
          g.first_name ILIKE $2 OR
          g.last_name ILIKE $2 OR
          CONCAT(g.first_name, ' ', g.last_name) ILIKE $2 OR
          g.company ILIKE $2 OR
          EXISTS (
            SELECT 1 FROM guest_contact gc
            WHERE gc.guest_id = g.guest_id
              AND (gc.phone_number ILIKE $2 OR gc.email_address ILIKE $2)
          ) OR
          EXISTS (
            SELECT 1 FROM guest_document gd
            WHERE gd.guest_id = g.guest_id
              AND gd.document_number ILIKE $2
          )
        )
      ORDER BY g.guest_id DESC
      LIMIT 100;
    `;

    const { rows } = await pool.query(query, [clientId, pattern]);
    return rows;
  }

  /**
   * Create new guest
   */
  async createGuest(clientId, data) {
    const {
      title,
      first_name,
      middle_name,
      last_name,
      suffix,
      birth_date,
      gender,
      nationality,
      company,
      designation,
      department,
      guest_remark,
      dnr_status = 'No',
      dnr_reason = null,
    } = data;

    if (!first_name || !first_name.trim()) {
      throw new ValidationError('First name is required.');
    }
    if (!last_name || !last_name.trim()) {
      throw new ValidationError('Last name is required.');
    }

    this.validateDnr(dnr_status, dnr_reason);

    const insertQuery = `
      INSERT INTO guest (
        client_id, title, first_name, middle_name, last_name, suffix,
        birth_date, gender, nationality, company, designation, department,
        guest_remark, dnr_status, dnr_reason
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12,
        $13, $14, $15
      )
      RETURNING *;
    `;

    const values = [
      clientId,
      title?.trim() || null,
      first_name.trim(),
      middle_name?.trim() || null,
      last_name.trim(),
      suffix?.trim() || null,
      birth_date || null,
      gender?.trim() || null,
      nationality?.trim() || null,
      company?.trim() || null,
      designation?.trim() || null,
      department?.trim() || null,
      guest_remark || null,
      dnr_status || 'No',
      dnr_status === 'No' ? null : (dnr_reason?.trim() || null),
    ];

    const { rows } = await pool.query(insertQuery, values);
    return rows[0];
  }

  /**
   * Update existing guest
   */
  async updateGuest(clientId, guestId, data) {
    // Check existence
    const { rows: existingRows } = await pool.query(
      'SELECT * FROM guest WHERE guest_id = $1 AND client_id = $2',
      [guestId, clientId]
    );
    if (existingRows.length === 0) {
      throw new NotFoundError('Guest', guestId);
    }
    const current = existingRows[0];

    const {
      title = current.title,
      first_name = current.first_name,
      middle_name = current.middle_name,
      last_name = current.last_name,
      suffix = current.suffix,
      birth_date = current.birth_date,
      gender = current.gender,
      nationality = current.nationality,
      company = current.company,
      designation = current.designation,
      department = current.department,
      guest_remark = current.guest_remark,
      dnr_status = current.dnr_status,
      dnr_reason = current.dnr_reason,
    } = data;

    if (!first_name || !first_name.trim()) {
      throw new ValidationError('First name is required.');
    }
    if (!last_name || !last_name.trim()) {
      throw new ValidationError('Last name is required.');
    }

    this.validateDnr(dnr_status, dnr_reason, current.dnr_status, current.dnr_reason);

    const updateQuery = `
      UPDATE guest SET
        title = $1,
        first_name = $2,
        middle_name = $3,
        last_name = $4,
        suffix = $5,
        birth_date = $6,
        gender = $7,
        nationality = $8,
        company = $9,
        designation = $10,
        department = $11,
        guest_remark = $12,
        dnr_status = $13,
        dnr_reason = $14
      WHERE guest_id = $15 AND client_id = $16
      RETURNING *;
    `;

    const values = [
      title?.trim() || null,
      first_name.trim(),
      middle_name?.trim() || null,
      last_name.trim(),
      suffix?.trim() || null,
      birth_date || null,
      gender?.trim() || null,
      nationality?.trim() || null,
      company?.trim() || null,
      designation?.trim() || null,
      department?.trim() || null,
      guest_remark ?? null,
      dnr_status || 'No',
      dnr_status === 'No' ? null : (dnr_reason?.trim() || null),
      guestId,
      clientId,
    ];

    const { rows } = await pool.query(updateQuery, values);
    return rows[0];
  }

  /**
   * Delete guest record (cascades contacts & documents)
   */
  async deleteGuest(clientId, guestId) {
    const { rows } = await pool.query(
      'SELECT guest_id FROM guest WHERE guest_id = $1 AND client_id = $2',
      [guestId, clientId]
    );
    if (rows.length === 0) {
      throw new NotFoundError('Guest', guestId);
    }

    await pool.query('DELETE FROM guest WHERE guest_id = $1 AND client_id = $2', [guestId, clientId]);
    return true;
  }
}

export const guestService = new GuestService();
