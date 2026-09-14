import { pool } from '../../../db/pool.js';
import { NotFoundError, ValidationError } from '../../../utils/errors.js';

export class LostFoundService {
  /**
   * Validate resolution rules:
   * - resolution_type is NULL: resolved_by must be NULL
   * - resolution_type is 'Returned': resolved_by and return_date are required
   * - resolution_type is 'Discarded': resolved_by and discard_date are required
   */
  validateResolution(resolutionType, resolvedBy, returnDate, discardDate) {
    if (!resolutionType) {
      return {
        resolution_type: null,
        resolved_by: null,
        return_date: null,
        discard_date: null,
      };
    }

    const normType = resolutionType.trim();
    if (!['Returned', 'Discarded'].includes(normType)) {
      throw new ValidationError(
        `Invalid resolution_type '${resolutionType}'. Allowed values are 'Returned', 'Discarded', or null.`,
        { resolution_type: resolutionType }
      );
    }

    if (!resolvedBy || !resolvedBy.trim()) {
      throw new ValidationError(
        `Resolution type '${normType}' requires a non-empty 'resolved_by' name.`,
        { resolution_type: normType, resolved_by: resolvedBy }
      );
    }

    if (normType === 'Returned') {
      if (!returnDate) {
        throw new ValidationError(
          "Resolution type 'Returned' requires a valid 'return_date'.",
          { resolution_type: normType, return_date: returnDate }
        );
      }
      return {
        resolution_type: 'Returned',
        resolved_by: resolvedBy.trim(),
        return_date: returnDate,
        discard_date: null,
      };
    }

    if (normType === 'Discarded') {
      if (!discardDate) {
        throw new ValidationError(
          "Resolution type 'Discarded' requires a valid 'discard_date'.",
          { resolution_type: normType, discard_date: discardDate }
        );
      }
      return {
        resolution_type: 'Discarded',
        resolved_by: resolvedBy.trim(),
        return_date: null,
        discard_date: discardDate,
      };
    }
  }

  /**
   * Validate hierarchy references (building, floor, room) belong to this property
   */
  async validateHierarchy(clientId, buildingId, floorId, roomId) {
    if (buildingId) {
      const { rows } = await pool.query(
        'SELECT building_id FROM building WHERE building_id = $1 AND client_id = $2',
        [buildingId, clientId]
      );
      if (rows.length === 0) {
        throw new ValidationError(`Building with ID ${buildingId} does not exist for this property.`);
      }
    }
    if (floorId) {
      const { rows } = await pool.query(
        'SELECT floor_id FROM floor WHERE floor_id = $1 AND client_id = $2',
        [floorId, clientId]
      );
      if (rows.length === 0) {
        throw new ValidationError(`Floor with ID ${floorId} does not exist for this property.`);
      }
    }
    if (roomId) {
      const { rows } = await pool.query(
        'SELECT room_id FROM room WHERE room_id = $1 AND client_id = $2',
        [roomId, clientId]
      );
      if (rows.length === 0) {
        throw new ValidationError(`Room with ID ${roomId} does not exist for this property.`);
      }
    }
  }

  async listItems(clientId, filters = {}) {
    const { status, record_type, search, limit = 100, offset = 0 } = filters;
    const params = [clientId];
    let query = `
      SELECT lf.*,
        b.building_name,
        f.floor_name,
        r.room_number,
        CASE
          WHEN lf.resolution_type = 'Returned' THEN 'returned'
          WHEN lf.resolution_type = 'Discarded' THEN 'discarded'
          ELSE 'open'
        END AS derived_status
      FROM lost_found_item lf
      LEFT JOIN building b ON b.building_id = lf.building_id
      LEFT JOIN floor f ON f.floor_id = lf.floor_id
      LEFT JOIN room r ON r.room_id = lf.room_id
      WHERE lf.client_id = $1
    `;

    if (status) {
      const normStatus = status.toLowerCase();
      if (normStatus === 'open') {
        query += ' AND lf.resolution_type IS NULL';
      } else if (normStatus === 'returned') {
        query += " AND lf.resolution_type = 'Returned'";
      } else if (normStatus === 'discarded') {
        query += " AND lf.resolution_type = 'Discarded'";
      }
    }

    if (record_type) {
      params.push(record_type);
      query += ` AND lf.record_type = $${params.length}`;
    }

    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      query += ` AND (
        lf.item_name ILIKE $${params.length} OR
        lf.color ILIKE $${params.length} OR
        lf.location_description ILIKE $${params.length} OR
        lf.current_location ILIKE $${params.length} OR
        lf.who_found ILIKE $${params.length} OR
        lf.reported_by_name ILIKE $${params.length}
      )`;
    }

    query += ` ORDER BY lf.lost_found_id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2};`;
    params.push(Number(limit) || 100, Number(offset) || 0);

    const { rows } = await pool.query(query, params);
    return rows;
  }

  async getItemById(clientId, itemId) {
    const query = `
      SELECT lf.*,
        b.building_name,
        f.floor_name,
        r.room_number,
        CASE
          WHEN lf.resolution_type = 'Returned' THEN 'returned'
          WHEN lf.resolution_type = 'Discarded' THEN 'discarded'
          ELSE 'open'
        END AS derived_status
      FROM lost_found_item lf
      LEFT JOIN building b ON b.building_id = lf.building_id
      LEFT JOIN floor f ON f.floor_id = lf.floor_id
      LEFT JOIN room r ON r.room_id = lf.room_id
      WHERE lf.lost_found_id = $1 AND lf.client_id = $2
      LIMIT 1;
    `;
    const { rows } = await pool.query(query, [itemId, clientId]);
    if (rows.length === 0) {
      throw new NotFoundError('Lost & Found item', itemId);
    }
    return rows[0];
  }

  async createItem(clientId, data) {
    const {
      record_type,
      item_name,
      color,
      location_description,
      item_value,
      building_id,
      floor_id,
      room_id,
      current_location,
      who_found,
      reported_by_name,
      reported_by_address,
      reported_by_city,
      reported_by_state,
      reported_by_zip,
      reported_by_country,
      reported_by_phone,
      resolution_type,
      resolved_by,
      return_date,
      discard_date,
      date_entry,
    } = data;

    if (!record_type || !['Lost', 'Found'].includes(record_type)) {
      throw new ValidationError("record_type is required and must be either 'Lost' or 'Found'.");
    }

    if (!item_name || !item_name.trim()) {
      throw new ValidationError('item_name is required.');
    }

    await this.validateHierarchy(clientId, building_id, floor_id, room_id);

    const resObj = this.validateResolution(
      resolution_type,
      resolved_by,
      return_date,
      discard_date
    );

    const insertQuery = `
      INSERT INTO lost_found_item (
        client_id, record_type, item_name, color, location_description,
        item_value, building_id, floor_id, room_id, current_location,
        who_found, reported_by_name, reported_by_address, reported_by_city,
        reported_by_state, reported_by_zip, reported_by_country, reported_by_phone,
        resolution_type, resolved_by, return_date, discard_date, date_entry
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, $14,
        $15, $16, $17, $18,
        $19, $20, $21, $22, COALESCE($23, CURRENT_DATE)
      )
      RETURNING *;
    `;

    const values = [
      clientId,
      record_type,
      item_name.trim(),
      color?.trim() || null,
      location_description?.trim() || null,
      item_value !== undefined && item_value !== null && item_value !== '' ? Number(item_value) : null,
      building_id ? Number(building_id) : null,
      floor_id ? Number(floor_id) : null,
      room_id ? Number(room_id) : null,
      current_location?.trim() || null,
      who_found?.trim() || null,
      reported_by_name?.trim() || null,
      reported_by_address?.trim() || null,
      reported_by_city?.trim() || null,
      reported_by_state?.trim() || null,
      reported_by_zip?.trim() || null,
      reported_by_country?.trim() || null,
      reported_by_phone?.trim() || null,
      resObj.resolution_type,
      resObj.resolved_by,
      resObj.return_date,
      resObj.discard_date,
      date_entry || null,
    ];

    const { rows } = await pool.query(insertQuery, values);
    return rows[0];
  }

  async updateItem(clientId, itemId, data) {
    const { rows: existingRows } = await pool.query(
      'SELECT * FROM lost_found_item WHERE lost_found_id = $1 AND client_id = $2',
      [itemId, clientId]
    );
    if (existingRows.length === 0) {
      throw new NotFoundError('Lost & Found item', itemId);
    }
    const current = existingRows[0];

    const recordType = data.record_type !== undefined ? data.record_type : current.record_type;
    if (!recordType || !['Lost', 'Found'].includes(recordType)) {
      throw new ValidationError("record_type must be either 'Lost' or 'Found'.");
    }

    const itemName = data.item_name !== undefined ? data.item_name?.trim() : current.item_name;
    if (!itemName) {
      throw new ValidationError('item_name cannot be empty.');
    }

    const buildingId = data.building_id !== undefined ? (data.building_id ? Number(data.building_id) : null) : current.building_id;
    const floorId = data.floor_id !== undefined ? (data.floor_id ? Number(data.floor_id) : null) : current.floor_id;
    const roomId = data.room_id !== undefined ? (data.room_id ? Number(data.room_id) : null) : current.room_id;

    await this.validateHierarchy(clientId, buildingId, floorId, roomId);

    // Compute target resolution fields
    const targetResType = data.resolution_type !== undefined ? data.resolution_type : current.resolution_type;
    const targetResolvedBy = data.resolved_by !== undefined ? data.resolved_by : current.resolved_by;
    const targetReturnDate = data.return_date !== undefined ? data.return_date : current.return_date;
    const targetDiscardDate = data.discard_date !== undefined ? data.discard_date : current.discard_date;

    const resObj = this.validateResolution(
      targetResType,
      targetResolvedBy,
      targetReturnDate,
      targetDiscardDate
    );

    const updateQuery = `
      UPDATE lost_found_item SET
        record_type = $1,
        item_name = $2,
        color = $3,
        location_description = $4,
        item_value = $5,
        building_id = $6,
        floor_id = $7,
        room_id = $8,
        current_location = $9,
        who_found = $10,
        reported_by_name = $11,
        reported_by_address = $12,
        reported_by_city = $13,
        reported_by_state = $14,
        reported_by_zip = $15,
        reported_by_country = $16,
        reported_by_phone = $17,
        resolution_type = $18,
        resolved_by = $19,
        return_date = $20,
        discard_date = $21,
        date_entry = COALESCE($22, date_entry)
      WHERE lost_found_id = $23 AND client_id = $24
      RETURNING *;
    `;

    const values = [
      recordType,
      itemName,
      data.color !== undefined ? data.color?.trim() || null : current.color,
      data.location_description !== undefined ? data.location_description?.trim() || null : current.location_description,
      data.item_value !== undefined && data.item_value !== null && data.item_value !== '' ? Number(data.item_value) : (data.item_value === null || data.item_value === '' ? null : current.item_value),
      buildingId,
      floorId,
      roomId,
      data.current_location !== undefined ? data.current_location?.trim() || null : current.current_location,
      data.who_found !== undefined ? data.who_found?.trim() || null : current.who_found,
      data.reported_by_name !== undefined ? data.reported_by_name?.trim() || null : current.reported_by_name,
      data.reported_by_address !== undefined ? data.reported_by_address?.trim() || null : current.reported_by_address,
      data.reported_by_city !== undefined ? data.reported_by_city?.trim() || null : current.reported_by_city,
      data.reported_by_state !== undefined ? data.reported_by_state?.trim() || null : current.reported_by_state,
      data.reported_by_zip !== undefined ? data.reported_by_zip?.trim() || null : current.reported_by_zip,
      data.reported_by_country !== undefined ? data.reported_by_country?.trim() || null : current.reported_by_country,
      data.reported_by_phone !== undefined ? data.reported_by_phone?.trim() || null : current.reported_by_phone,
      resObj.resolution_type,
      resObj.resolved_by,
      resObj.return_date,
      resObj.discard_date,
      data.date_entry || null,
      itemId,
      clientId,
    ];

    const { rows } = await pool.query(updateQuery, values);
    return rows[0];
  }

  async deleteItem(clientId, itemId) {
    const { rows } = await pool.query(
      'SELECT lost_found_id FROM lost_found_item WHERE lost_found_id = $1 AND client_id = $2',
      [itemId, clientId]
    );
    if (rows.length === 0) {
      throw new NotFoundError('Lost & Found item', itemId);
    }

    await pool.query('DELETE FROM lost_found_item WHERE lost_found_id = $1 AND client_id = $2', [itemId, clientId]);
    return true;
  }
}

export const lostFoundService = new LostFoundService();
