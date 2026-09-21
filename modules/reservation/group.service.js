import { pool } from '../../db/pool.js';
import { ConflictError, NotFoundError, ValidationError } from '../../utils/errors.js';
import { parseSafeIsoDate } from './reservation.service.js';

export class GroupService {
  async listGroups(clientId, filters = {}) {
    const { search, limit = 50, offset = 0 } = filters;
    const params = [clientId];
    let query = `
      SELECT 
        g.*,
        (SELECT COUNT(*)::int FROM reservation r WHERE r.group_id = g.group_id) as reservation_count,
        (SELECT COUNT(*)::int FROM group_contact gc WHERE gc.group_id = g.group_id) as contact_count,
        (SELECT COUNT(*)::int FROM group_document gd WHERE gd.group_id = g.group_id) as document_count,
        (
          SELECT json_build_object(
            'phone_number', gc.phone_number,
            'email_address', gc.email_address,
            'contact_type', gc.contact_type
          )
          FROM group_contact gc
          WHERE gc.group_id = g.group_id AND gc.is_primary = true
          LIMIT 1
        ) as primary_contact
      FROM "group" g
      WHERE g.client_id = $1
    `;

    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      query += ` AND (
        g.group_name ILIKE $${params.length} OR
        g.company ILIKE $${params.length} OR
        g.full_name ILIKE $${params.length}
      )`;
    }

    query += ` ORDER BY g.group_id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Math.min(100, Math.max(1, Number(limit))), Math.max(0, Number(offset)));

    const { rows } = await pool.query(query, params);
    return rows;
  }

  async searchGroups(clientId, term) {
    if (!term || !term.trim()) {
      return this.listGroups(clientId, { limit: 20 });
    }
    const cleanTerm = `%${term.trim()}%`;
    const { rows } = await pool.query(
      `SELECT 
        g.*,
        (SELECT COUNT(*)::int FROM reservation r WHERE r.group_id = g.group_id) as reservation_count,
        (
          SELECT json_build_object(
            'phone_number', gc.phone_number,
            'email_address', gc.email_address
          )
          FROM group_contact gc
          WHERE gc.group_id = g.group_id AND gc.is_primary = true
          LIMIT 1
        ) as primary_contact
       FROM "group" g
       WHERE g.client_id = $1
         AND (
           g.group_name ILIKE $2 OR
           g.company ILIKE $2 OR
           g.full_name ILIKE $2
         )
       ORDER BY g.group_name ASC
       LIMIT 20`,
      [clientId, cleanTerm]
    );
    return rows;
  }

  async getGroupById(clientId, id) {
    const { rows } = await pool.query(
      `SELECT 
        g.*,
        (SELECT COUNT(*)::int FROM reservation r WHERE r.group_id = g.group_id) as reservation_count
       FROM "group" g
       WHERE g.group_id = $1 AND g.client_id = $2`,
      [id, clientId]
    );

    if (rows.length === 0) {
      throw new NotFoundError('Group', id);
    }
    const group = rows[0];

    // Parallel fetch of contacts and documents
    const [contactsRes, docsRes, reservationsRes] = await Promise.all([
      pool.query(
        `SELECT * FROM group_contact WHERE group_id = $1 ORDER BY is_primary DESC, group_contact_id ASC`,
        [id]
      ),
      pool.query(
        `SELECT gd.*, COALESCE(dt.document_name, dt.short_name) as document_type_name, dt.document_name
         FROM group_document gd
         LEFT JOIN document_type dt ON dt.document_type_id = gd.document_type_id
         WHERE gd.group_id = $1
         ORDER BY gd.is_primary DESC, gd.group_document_id ASC`,
        [id]
      ),
      pool.query(
        `SELECT r.reservation_id, r.folio_number, r.booking_number, r.guest_name, r.status,
                r.check_in_date, r.check_out_date, r.room_number, r.balance, r.total_charges
         FROM reservation r
         WHERE r.group_id = $1
         ORDER BY r.reservation_id DESC`,
        [id]
      )
    ]);

    group.contacts = contactsRes.rows;
    group.primary_contact = contactsRes.rows.find(c => c.is_primary) || contactsRes.rows[0] || null;
    group.documents = docsRes.rows;
    group.reservations = reservationsRes.rows;

    return group;
  }

  async createGroup(clientId, data) {
    const groupName = data.group_name || data.groupName;
    if (!groupName || !groupName.trim()) {
      throw new ValidationError('group_name is required.');
    }

    const checkInDate = data.check_in_date ? parseSafeIsoDate(data.check_in_date) : null;
    const checkOutDate = data.check_out_date ? parseSafeIsoDate(data.check_out_date) : null;
    const expiryDate = data.expiry_date ? parseSafeIsoDate(data.expiry_date) : null;

    let noOfDays = data.no_of_days !== undefined ? Number(data.no_of_days) : null;
    if (checkInDate && checkOutDate) {
      const inD = new Date(checkInDate);
      const outD = new Date(checkOutDate);
      noOfDays = Math.max(1, Math.round((outD.getTime() - inD.getTime()) / (1000 * 60 * 60 * 24)));
    }

    const insertQuery = `
      INSERT INTO "group" (
        client_id, group_name, full_name, company, group_remark,
        check_in_date, check_in_time, check_out_date, check_out_time,
        no_of_days, business_source_category_id, expiry_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `;

    const values = [
      clientId,
      groupName.trim(),
      data.full_name?.trim() || null,
      data.company?.trim() || null,
      data.group_remark?.trim() || null,
      checkInDate,
      data.check_in_time || '14:00:00',
      checkOutDate,
      data.check_out_time || '11:00:00',
      noOfDays,
      data.business_source_category_id ? Number(data.business_source_category_id) : null,
      expiryDate
    ];

    const { rows } = await pool.query(insertQuery, values);
    const created = rows[0];

    // Inline contact creation if provided
    if (data.contact) {
      await this.createGroupContact(clientId, created.group_id, {
        ...data.contact,
        is_primary: true
      });
    }

    return await this.getGroupById(clientId, created.group_id);
  }

  async updateGroup(clientId, id, data) {
    const existing = await this.getGroupById(clientId, id);

    const groupName = data.group_name !== undefined ? data.group_name?.trim() : existing.group_name;
    if (!groupName) {
      throw new ValidationError('group_name cannot be empty.');
    }

    const checkInDate = data.check_in_date !== undefined ? parseSafeIsoDate(data.check_in_date) : existing.check_in_date;
    const checkOutDate = data.check_out_date !== undefined ? parseSafeIsoDate(data.check_out_date) : existing.check_out_date;
    const expiryDate = data.expiry_date !== undefined ? parseSafeIsoDate(data.expiry_date) : existing.expiry_date;

    let noOfDays = data.no_of_days !== undefined ? Number(data.no_of_days) : existing.no_of_days;
    if (checkInDate && checkOutDate) {
      const inD = new Date(checkInDate);
      const outD = new Date(checkOutDate);
      noOfDays = Math.max(1, Math.round((outD.getTime() - inD.getTime()) / (1000 * 60 * 60 * 24)));
    }

    const updateQuery = `
      UPDATE "group" SET
        group_name = $1,
        full_name = $2,
        company = $3,
        group_remark = $4,
        check_in_date = $5,
        check_in_time = $6,
        check_out_date = $7,
        check_out_time = $8,
        no_of_days = $9,
        business_source_category_id = $10,
        expiry_date = $11,
        updated_at = CURRENT_TIMESTAMP
      WHERE group_id = $12 AND client_id = $13
      RETURNING *;
    `;

    const values = [
      groupName,
      data.full_name !== undefined ? data.full_name?.trim() : existing.full_name,
      data.company !== undefined ? data.company?.trim() : existing.company,
      data.group_remark !== undefined ? data.group_remark?.trim() : existing.group_remark,
      checkInDate,
      data.check_in_time || existing.check_in_time,
      checkOutDate,
      data.check_out_time || existing.check_out_time,
      noOfDays,
      data.business_source_category_id ? Number(data.business_source_category_id) : existing.business_source_category_id,
      expiryDate,
      id,
      clientId
    ];

    const { rows } = await pool.query(updateQuery, values);
    return await this.getGroupById(clientId, id);
  }

  async deleteGroup(clientId, id) {
    const existing = await this.getGroupById(clientId, id);

    // Business check: blocked if any reservation references this group
    if (existing.reservation_count > 0) {
      throw new ConflictError(
        `Cannot delete Group '${existing.group_name}' because ${existing.reservation_count} active reservation(s) are attached to it. Reassign or cancel those reservations first.`
      );
    }

    const { rowCount } = await pool.query(
      `DELETE FROM "group" WHERE group_id = $1 AND client_id = $2`,
      [id, clientId]
    );

    if (rowCount === 0) {
      throw new NotFoundError('Group', id);
    }
    return true;
  }

  // ==================== GROUP CONTACTS ====================

  async listGroupContacts(clientId, groupId) {
    await this.getGroupById(clientId, groupId);
    const { rows } = await pool.query(
      `SELECT * FROM group_contact WHERE group_id = $1 ORDER BY is_primary DESC, group_contact_id ASC`,
      [groupId]
    );
    return rows;
  }

  async createGroupContact(clientId, groupId, data) {
    await this.getGroupById(clientId, groupId);

    const isPrimary = Boolean(data.is_primary ?? false);
    if (isPrimary) {
      await pool.query(`UPDATE group_contact SET is_primary = false WHERE group_id = $1`, [groupId]);
    }

    const insertQuery = `
      INSERT INTO group_contact (
        group_id, contact_type, is_primary, phone_number, email_address,
        address_type, address, city, state, zip_code, country
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;

    const values = [
      groupId,
      data.contact_type || 'Organizer',
      isPrimary,
      data.phone_number?.trim() || null,
      data.email_address?.trim() || null,
      data.address_type || 'Office',
      data.address?.trim() || null,
      data.city?.trim() || null,
      data.state?.trim() || null,
      data.zip_code?.trim() || null,
      data.country?.trim() || 'United States'
    ];

    const { rows } = await pool.query(insertQuery, values);
    return rows[0];
  }

  async updateGroupContact(clientId, contactId, data) {
    const { rows: cRows } = await pool.query(
      `SELECT gc.*, g.client_id
       FROM group_contact gc
       JOIN "group" g ON g.group_id = gc.group_id
       WHERE gc.group_contact_id = $1 AND g.client_id = $2`,
      [contactId, clientId]
    );

    if (cRows.length === 0) {
      throw new NotFoundError('GroupContact', contactId);
    }
    const current = cRows[0];

    if (data.is_primary) {
      await pool.query(`UPDATE group_contact SET is_primary = false WHERE group_id = $1`, [current.group_id]);
    }

    const updateQuery = `
      UPDATE group_contact SET
        contact_type = COALESCE($1, contact_type),
        is_primary = COALESCE($2, is_primary),
        phone_number = COALESCE($3, phone_number),
        email_address = COALESCE($4, email_address),
        address_type = COALESCE($5, address_type),
        address = COALESCE($6, address),
        city = COALESCE($7, city),
        state = COALESCE($8, state),
        zip_code = COALESCE($9, zip_code),
        country = COALESCE($10, country)
      WHERE group_contact_id = $11
      RETURNING *;
    `;

    const values = [
      data.contact_type || null,
      data.is_primary !== undefined ? Boolean(data.is_primary) : null,
      data.phone_number?.trim() || null,
      data.email_address?.trim() || null,
      data.address_type || null,
      data.address?.trim() || null,
      data.city?.trim() || null,
      data.state?.trim() || null,
      data.zip_code?.trim() || null,
      data.country?.trim() || null,
      contactId
    ];

    const { rows } = await pool.query(updateQuery, values);
    return rows[0];
  }

  async deleteGroupContact(clientId, contactId) {
    const { rows: cRows } = await pool.query(
      `SELECT gc.*, g.client_id
       FROM group_contact gc
       JOIN "group" g ON g.group_id = gc.group_id
       WHERE gc.group_contact_id = $1 AND g.client_id = $2`,
      [contactId, clientId]
    );

    if (cRows.length === 0) {
      throw new NotFoundError('GroupContact', contactId);
    }

    await pool.query(`DELETE FROM group_contact WHERE group_contact_id = $1`, [contactId]);
    return true;
  }

  // ==================== GROUP DOCUMENTS ====================

  async listGroupDocuments(clientId, groupId) {
    await this.getGroupById(clientId, groupId);
    const { rows } = await pool.query(
      `SELECT gd.*, COALESCE(dt.document_name, dt.short_name) as document_type_name, dt.document_name
       FROM group_document gd
       LEFT JOIN document_type dt ON dt.document_type_id = gd.document_type_id
       WHERE gd.group_id = $1
       ORDER BY gd.is_primary DESC, gd.group_document_id ASC`,
      [groupId]
    );
    return rows;
  }

  async createGroupDocument(clientId, groupId, data) {
    await this.getGroupById(clientId, groupId);

    const docTypeId = Number(data.document_type_id);
    if (!docTypeId) {
      throw new ValidationError('document_type_id is required.');
    }

    const isPrimary = Boolean(data.is_primary ?? false);
    if (isPrimary) {
      await pool.query(`UPDATE group_document SET is_primary = false WHERE group_id = $1`, [groupId]);
    }

    const insertQuery = `
      INSERT INTO group_document (
        group_id, document_type_id, document_number, valid_till, name_on_document,
        issued_by, issue_place, is_primary, address, city, state, zip_code, country,
        remark, front_image, back_image
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *;
    `;

    const values = [
      groupId,
      docTypeId,
      data.document_number?.trim() || `DOC-GRP-${Math.floor(100000 + Math.random() * 900000)}`,
      parseSafeIsoDate(data.valid_till, '2030-12-31'),
      data.name_on_document?.trim() || null,
      data.issued_by?.trim() || 'Corporate Entity / Registry',
      data.issue_place?.trim() || 'Official Registry',
      isPrimary,
      data.address?.trim() || null,
      data.city?.trim() || null,
      data.state?.trim() || null,
      data.zip_code?.trim() || null,
      data.country?.trim() || 'United States',
      data.remark || null,
      data.front_image || null,
      data.back_image || null
    ];

    const { rows } = await pool.query(insertQuery, values);
    return rows[0];
  }

  async updateGroupDocument(clientId, docId, data) {
    const { rows: dRows } = await pool.query(
      `SELECT gd.*, g.client_id
       FROM group_document gd
       JOIN "group" g ON g.group_id = gd.group_id
       WHERE gd.group_document_id = $1 AND g.client_id = $2`,
      [docId, clientId]
    );

    if (dRows.length === 0) {
      throw new NotFoundError('GroupDocument', docId);
    }
    const current = dRows[0];

    if (data.is_primary) {
      await pool.query(`UPDATE group_document SET is_primary = false WHERE group_id = $1`, [current.group_id]);
    }

    const updateQuery = `
      UPDATE group_document SET
        document_type_id = COALESCE($1, document_type_id),
        document_number = COALESCE($2, document_number),
        valid_till = COALESCE($3, valid_till),
        name_on_document = COALESCE($4, name_on_document),
        issued_by = COALESCE($5, issued_by),
        issue_place = COALESCE($6, issue_place),
        is_primary = COALESCE($7, is_primary),
        address = COALESCE($8, address),
        city = COALESCE($9, city),
        state = COALESCE($10, state),
        zip_code = COALESCE($11, zip_code),
        country = COALESCE($12, country),
        remark = COALESCE($13, remark),
        front_image = COALESCE($14, front_image),
        back_image = COALESCE($15, back_image)
      WHERE group_document_id = $16
      RETURNING *;
    `;

    const values = [
      data.document_type_id ? Number(data.document_type_id) : null,
      data.document_number?.trim() || null,
      data.valid_till ? parseSafeIsoDate(data.valid_till) : null,
      data.name_on_document?.trim() || null,
      data.issued_by?.trim() || null,
      data.issue_place?.trim() || null,
      data.is_primary !== undefined ? Boolean(data.is_primary) : null,
      data.address?.trim() || null,
      data.city?.trim() || null,
      data.state?.trim() || null,
      data.zip_code?.trim() || null,
      data.country?.trim() || null,
      data.remark || null,
      data.front_image || null,
      data.back_image || null,
      docId
    ];

    const { rows } = await pool.query(updateQuery, values);
    return rows[0];
  }

  async deleteGroupDocument(clientId, docId) {
    const { rows: dRows } = await pool.query(
      `SELECT gd.*, g.client_id
       FROM group_document gd
       JOIN "group" g ON g.group_id = gd.group_id
       WHERE gd.group_document_id = $1 AND g.client_id = $2`,
      [docId, clientId]
    );

    if (dRows.length === 0) {
      throw new NotFoundError('GroupDocument', docId);
    }

    await pool.query(`DELETE FROM group_document WHERE group_document_id = $1`, [docId]);
    return true;
  }
}

export const groupService = new GroupService();
