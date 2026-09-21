import { pool } from '../../../db/pool.js';
import { NotFoundError, ValidationError } from '../../../utils/errors.js';

/**
 * Safely parse date strings in YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY, or ISO format into YYYY-MM-DD
 * Prevents PostgreSQL DateTimeParseError or date/time field value out of range errors
 */
export function parseSafeIsoDate(val, defaultVal = null) {
  if (!val) return defaultVal;
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return defaultVal;
    return val.toISOString().split('T')[0];
  }
  if (typeof val !== 'string') return defaultVal;
  const str = val.trim();
  if (!str) return defaultVal;

  // Pattern 1: YYYY-MM-DD (or YYYY/MM/DD)
  const ymdMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (ymdMatch) {
    const [, y, m, d] = ymdMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // Pattern 2: DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // Pattern 3: Standard JS Date parse fallback
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return defaultVal;
}

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
        (SELECT COUNT(*)::int FROM guest_document gd WHERE gd.guest_id = g.guest_id) AS document_count,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'guest_contact_id', gc.guest_contact_id,
            'contact_type', gc.contact_type,
            'is_primary', gc.is_primary,
            'phone_number', gc.phone_number,
            'email_address', gc.email_address,
            'address_type', gc.address_type,
            'address', gc.address,
            'city', gc.city,
            'state', gc.state,
            'zip_code', gc.zip_code,
            'country', gc.country,
            'folio_dispatch', gc.folio_dispatch,
            'country_code', gc.country_code
          ) ORDER BY gc.is_primary DESC, gc.guest_contact_id ASC)
          FROM guest_contact gc WHERE gc.guest_id = g.guest_id),
          '[]'::json
        ) AS contacts,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'guest_document_id', gd.guest_document_id,
            'document_type_id', gd.document_type_id,
            'document_name', dt.document_name,
            'document_type_short_name', dt.short_name,
            'document_number', gd.document_number,
            'valid_till', gd.valid_till,
            'name_on_document', gd.name_on_document,
            'issued_by', gd.issued_by,
            'issue_place', gd.issue_place,
            'is_primary', gd.is_primary,
            'address', gd.address,
            'city', gd.city,
            'state', gd.state,
            'zip_code', gd.zip_code,
            'country', gd.country,
            'remark', gd.remark,
            'is_ocr_verified', gd.is_ocr_verified
          ) ORDER BY gd.is_primary DESC, gd.guest_document_id ASC)
          FROM guest_document gd
          LEFT JOIN document_type dt ON dt.document_type_id = gd.document_type_id
          WHERE gd.guest_id = g.guest_id),
          '[]'::json
        ) AS documents
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
   * Create new guest with optional contacts and documents
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
      guest_code,
      is_vip = false,
      vip_tier = null,
      total_stays = 0,
      total_nights = 0,
      total_spend = 0,
      last_visit = 'New Profile',
      last_room = '—',
      in_house = false,
      created_date = null,
      contacts = [],
      documents = [],
    } = data;

    if (!first_name || !first_name.trim()) {
      throw new ValidationError('First name is required.');
    }
    if (!last_name || !last_name.trim()) {
      throw new ValidationError('Last name is required.');
    }

    this.validateDnr(dnr_status, dnr_reason);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const generatedCode = guest_code?.trim() || `GST-${Math.floor(100000 + Math.random() * 900000)}`;
      const now = new Date();
      const defaultDateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const finalCreatedDate = created_date || defaultDateStr;

      const insertGuestQuery = `
        INSERT INTO guest (
          client_id, title, first_name, middle_name, last_name, suffix,
          birth_date, gender, nationality, company, designation, department,
          guest_remark, dnr_status, dnr_reason, guest_code, is_vip, vip_tier,
          total_stays, total_nights, total_spend, last_visit, last_room, in_house, created_date
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11, $12,
          $13, $14, $15, $16, $17, $18,
          $19, $20, $21, $22, $23, $24, $25
        )
        RETURNING *;
      `;

      const guestValues = [
        clientId,
        title?.trim() || null,
        first_name.trim(),
        middle_name?.trim() || null,
        last_name.trim(),
        suffix?.trim() || null,
        parseSafeIsoDate(birth_date),
        gender?.trim() || null,
        nationality?.trim() || null,
        company?.trim() || null,
        designation?.trim() || null,
        department?.trim() || null,
        guest_remark || null,
        dnr_status || 'No',
        dnr_status === 'No' ? null : (dnr_reason?.trim() || null),
        generatedCode,
        Boolean(is_vip),
        vip_tier?.trim() || null,
        Number(total_stays) || 0,
        Number(total_nights) || 0,
        Number(total_spend) || 0,
        last_visit?.trim() || 'New Profile',
        last_room?.trim() || '—',
        Boolean(in_house),
        finalCreatedDate,
      ];

      const { rows: guestRows } = await client.query(insertGuestQuery, guestValues);
      const createdGuest = guestRows[0];
      const guestId = createdGuest.guest_id;

      // Insert Contacts if provided
      const insertedContacts = [];
      if (Array.isArray(contacts) && contacts.length > 0) {
        for (const c of contacts) {
          const cRes = await client.query(`
            INSERT INTO guest_contact (
              guest_id, contact_type, is_primary, phone_number, email_address,
              address_type, address, city, state, zip_code, country, folio_dispatch, country_code
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *
          `, [
            guestId,
            c.contact_type || c.contactType || 'Mobile / Personal',
            Boolean(c.is_primary ?? c.isPrimary ?? false),
            c.phone_number || c.phone || '',
            c.email_address || c.email || '',
            c.address_type || c.addressType || 'Primary Residence',
            c.address || c.street || '',
            c.city || '',
            c.state || '',
            c.zip_code || c.zip || '',
            c.country || 'United States',
            Boolean(c.folio_dispatch ?? c.folioDispatch ?? true),
            c.country_code || c.countryCode || '+1',
          ]);
          insertedContacts.push(cRes.rows[0]);
        }
      }

      // Insert Documents if provided
      const insertedDocuments = [];
      if (Array.isArray(documents) && documents.length > 0) {
        // Fetch available document types for this tenant
        const { rows: dtRows } = await client.query(
          'SELECT document_type_id, document_name, short_name FROM document_type WHERE client_id = $1',
          [clientId]
        );

        for (const d of documents) {
          let docTypeId = d.document_type_id;
          if (!docTypeId && dtRows.length > 0) {
            const reqTypeName = (d.document_name || d.documentType || d.short_name || '').toLowerCase();
            const matched = dtRows.find(
              (dt) =>
                dt.document_name.toLowerCase().includes(reqTypeName) ||
                dt.short_name.toLowerCase().includes(reqTypeName) ||
                reqTypeName.includes(dt.short_name.toLowerCase())
            );
            docTypeId = matched ? matched.document_type_id : dtRows[0].document_type_id;
          }

          const regAddr = d.registeredAddress || {};
          const dRes = await client.query(`
            INSERT INTO guest_document (
              guest_id, document_type_id, document_number, valid_till, name_on_document,
              issued_by, issue_place, is_primary, address, city, state, zip_code, country,
              remark, is_ocr_verified
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING *
          `, [
            guestId,
            docTypeId || null,
            d.document_number || d.documentNumber || `DOC-${Math.floor(100000 + Math.random() * 900000)}`,
            parseSafeIsoDate(d.valid_till || d.validTill, '2030-12-31'),
            d.name_on_document || d.nameOnDocument || `${first_name.toUpperCase()} ${last_name.toUpperCase()}`,
            d.issued_by || d.issuedBy || 'Government Authority',
            d.issue_place || d.issuePlace || 'Official Registry',
            Boolean(d.is_primary ?? d.isPrimary ?? false),
            d.address || regAddr.street || '',
            d.city || regAddr.city || '',
            d.state || regAddr.state || '',
            d.zip_code || regAddr.zip || '',
            d.country || regAddr.country || 'United States',
            d.remark || d.remarks || null,
            Boolean(d.is_ocr_verified ?? d.isOcrVerified ?? true),
          ]);
          insertedDocuments.push(dRes.rows[0]);
        }
      }

      await client.query('COMMIT');

      return {
        ...createdGuest,
        contacts: insertedContacts,
        documents: insertedDocuments,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
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
      guest_code = current.guest_code,
      is_vip = current.is_vip,
      vip_tier = current.vip_tier,
      total_stays = current.total_stays,
      total_nights = current.total_nights,
      total_spend = current.total_spend,
      last_visit = current.last_visit,
      last_room = current.last_room,
      in_house = current.in_house,
      contacts,
      documents,
    } = data;

    if (!first_name || !first_name.trim()) {
      throw new ValidationError('First name is required.');
    }
    if (!last_name || !last_name.trim()) {
      throw new ValidationError('Last name is required.');
    }

    this.validateDnr(dnr_status, dnr_reason, current.dnr_status, current.dnr_reason);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

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
          dnr_reason = $14,
          guest_code = $15,
          is_vip = $16,
          vip_tier = $17,
          total_stays = $18,
          total_nights = $19,
          total_spend = $20,
          last_visit = $21,
          last_room = $22,
          in_house = $23
        WHERE guest_id = $24 AND client_id = $25
        RETURNING *;
      `;

      const values = [
        title?.trim() || null,
        first_name.trim(),
        middle_name?.trim() || null,
        last_name.trim(),
        suffix?.trim() || null,
        parseSafeIsoDate(birth_date),
        gender?.trim() || null,
        nationality?.trim() || null,
        company?.trim() || null,
        designation?.trim() || null,
        department?.trim() || null,
        guest_remark ?? null,
        dnr_status || 'No',
        dnr_status === 'No' ? null : (dnr_reason?.trim() || null),
        guest_code || current.guest_code,
        Boolean(is_vip),
        vip_tier || null,
        Number(total_stays) || 0,
        Number(total_nights) || 0,
        Number(total_spend) || 0,
        last_visit || current.last_visit,
        last_room || current.last_room,
        Boolean(in_house),
        guestId,
        clientId,
      ];

      const { rows } = await client.query(updateQuery, values);
      const updatedGuest = rows[0];

      // Update contacts if provided
      if (Array.isArray(contacts)) {
        await client.query('DELETE FROM guest_contact WHERE guest_id = $1', [guestId]);
        for (const c of contacts) {
          await client.query(`
            INSERT INTO guest_contact (
              guest_id, contact_type, is_primary, phone_number, email_address,
              address_type, address, city, state, zip_code, country, folio_dispatch, country_code
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          `, [
            guestId,
            c.contact_type || c.contactType || 'Mobile / Personal',
            Boolean(c.is_primary ?? c.isPrimary ?? false),
            c.phone_number || c.phone || '',
            c.email_address || c.email || '',
            c.address_type || c.addressType || 'Primary Residence',
            c.address || c.street || '',
            c.city || '',
            c.state || '',
            c.zip_code || c.zip || '',
            c.country || 'United States',
            Boolean(c.folio_dispatch ?? c.folioDispatch ?? true),
            c.country_code || c.countryCode || '+1',
          ]);
        }
      }

      // Update documents if provided
      if (Array.isArray(documents)) {
        const { rows: dtRows } = await client.query(
          'SELECT document_type_id, document_name, short_name FROM document_type WHERE client_id = $1',
          [clientId]
        );

        await client.query('DELETE FROM guest_document WHERE guest_id = $1', [guestId]);
        for (const d of documents) {
          let docTypeId = d.document_type_id;
          if (!docTypeId && dtRows.length > 0) {
            const reqTypeName = (d.document_name || d.documentType || d.short_name || '').toLowerCase();
            const matched = dtRows.find(
              (dt) =>
                dt.document_name.toLowerCase().includes(reqTypeName) ||
                dt.short_name.toLowerCase().includes(reqTypeName) ||
                reqTypeName.includes(dt.short_name.toLowerCase())
            );
            docTypeId = matched ? matched.document_type_id : dtRows[0].document_type_id;
          }

          const regAddr = d.registeredAddress || {};
          await client.query(`
            INSERT INTO guest_document (
              guest_id, document_type_id, document_number, valid_till, name_on_document,
              issued_by, issue_place, is_primary, address, city, state, zip_code, country,
              remark, is_ocr_verified
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          `, [
            guestId,
            docTypeId || null,
            d.document_number || d.documentNumber || `DOC-${Math.floor(100000 + Math.random() * 900000)}`,
            parseSafeIsoDate(d.valid_till || d.validTill, '2030-12-31'),
            d.name_on_document || d.nameOnDocument || `${first_name.toUpperCase()} ${last_name.toUpperCase()}`,
            d.issued_by || d.issuedBy || 'Government Authority',
            d.issue_place || d.issuePlace || 'Official Registry',
            Boolean(d.is_primary ?? d.isPrimary ?? false),
            d.address || regAddr.street || '',
            d.city || regAddr.city || '',
            d.state || regAddr.state || '',
            d.zip_code || regAddr.zip || '',
            d.country || regAddr.country || 'United States',
            d.remark || d.remarks || null,
            Boolean(d.is_ocr_verified ?? d.isOcrVerified ?? true),
          ]);
        }
      }

      await client.query('COMMIT');

      // Return full guest record
      return await this.getGuestById(clientId, guestId);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
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
