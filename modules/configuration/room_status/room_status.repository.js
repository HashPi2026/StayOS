import { query } from '../../../db/pool.js';
export class RoomStatusRepository {
    async findMany(clientId, isActive) {
        let text = `
      SELECT
        room_status_id,
        client_id,
        room_id,
        room_type_id,
        floor_id,
        building_id,
        status_name,
        short_name,
        status_code,
        status_color,
        text_color,
        is_active
      FROM room_status
      WHERE client_id = $1
    `;
        const params = [clientId];
        if (isActive !== undefined) {
            text += ` AND is_active = $2`;
            params.push(isActive);
        }
        text += ` ORDER BY status_name ASC;`;
        const res = await query(text, params);
        return res.rows;
    }
    async findById(clientId, statusId) {
        const text = `
      SELECT
        room_status_id,
        client_id,
        room_id,
        room_type_id,
        floor_id,
        building_id,
        status_name,
        short_name,
        status_code,
        status_color,
        text_color,
        is_active
      FROM room_status
      WHERE client_id = $1 AND room_status_id = $2
      LIMIT 1;
    `;
        const res = await query(text, [clientId, statusId]);
        return res.rows[0] || null;
    }
    async findByCode(clientId, statusCode) {
        const text = `
      SELECT
        room_status_id,
        client_id,
        room_id,
        room_type_id,
        floor_id,
        building_id,
        status_name,
        short_name,
        status_code,
        status_color,
        text_color,
        is_active
      FROM room_status
      WHERE client_id = $1 AND TRIM(status_code) = $2
      LIMIT 1;
    `;
        const res = await query(text, [clientId, statusCode.trim()]);
        return res.rows[0] || null;
    }
    async create(clientId, data) {
        const text = `
      INSERT INTO room_status (
        client_id,
        room_id,
        room_type_id,
        floor_id,
        building_id,
        status_name,
        short_name,
        status_code,
        status_color,
        text_color,
        is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING
        room_status_id,
        client_id,
        room_id,
        room_type_id,
        floor_id,
        building_id,
        status_name,
        short_name,
        status_code,
        status_color,
        text_color,
        is_active;
    `;
        const values = [
            clientId,
            data.room_id ?? null,
            data.room_type_id ?? null,
            data.floor_id ?? null,
            data.building_id ?? null,
            data.status_name.trim(),
            data.short_name ? data.short_name.trim() : null,
            data.status_code.trim(),
            data.status_color ? data.status_color.trim() : null,
            data.text_color ? data.text_color.trim() : null,
            data.is_active ?? true,
        ];
        const res = await query(text, values);
        return res.rows[0];
    }
    async update(clientId, statusId, data) {
        const text = `
      UPDATE room_status
      SET
        room_id = CASE WHEN $3::boolean THEN $4 ELSE room_id END,
        room_type_id = CASE WHEN $5::boolean THEN $6 ELSE room_type_id END,
        floor_id = CASE WHEN $7::boolean THEN $8 ELSE floor_id END,
        building_id = CASE WHEN $9::boolean THEN $10 ELSE building_id END,
        status_name = COALESCE($11, status_name),
        short_name = CASE WHEN $12::boolean THEN $13 ELSE short_name END,
        status_code = COALESCE($14, status_code),
        status_color = CASE WHEN $15::boolean THEN $16 ELSE status_color END,
        text_color = CASE WHEN $17::boolean THEN $18 ELSE text_color END,
        is_active = COALESCE($19, is_active)
      WHERE client_id = $1 AND room_status_id = $2
      RETURNING
        room_status_id,
        client_id,
        room_id,
        room_type_id,
        floor_id,
        building_id,
        status_name,
        short_name,
        status_code,
        status_color,
        text_color,
        is_active;
    `;
        const values = [
            clientId,
            statusId,
            data.room_id !== undefined,
            data.room_id ?? null,
            data.room_type_id !== undefined,
            data.room_type_id ?? null,
            data.floor_id !== undefined,
            data.floor_id ?? null,
            data.building_id !== undefined,
            data.building_id ?? null,
            data.status_name ? data.status_name.trim() : null,
            data.short_name !== undefined,
            data.short_name ? data.short_name.trim() : null,
            data.status_code ? data.status_code.trim() : null,
            data.status_color !== undefined,
            data.status_color ? data.status_color.trim() : null,
            data.text_color !== undefined,
            data.text_color ? data.text_color.trim() : null,
            data.is_active ?? null,
        ];
        const res = await query(text, values);
        return res.rows[0] || null;
    }
    async softDelete(clientId, statusId) {
        const text = `
      UPDATE room_status
      SET is_active = FALSE
      WHERE client_id = $1 AND room_status_id = $2;
    `;
        const res = await query(text, [clientId, statusId]);
        return (res.rowCount ?? 0) > 0;
    }
}
export const roomStatusRepository = new RoomStatusRepository();
