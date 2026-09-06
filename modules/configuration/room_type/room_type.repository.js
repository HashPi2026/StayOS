import { query } from '../../../db/pool.js';
export class RoomTypeRepository {
    async findMany(clientId) {
        const text = `
      SELECT
        room_type_id,
        client_id,
        floor_id,
        building_id,
        short_name,
        room_type_name,
        room_type_color,
        description,
        over_booking,
        allow_in_occupancy,
        is_crs
      FROM room_type
      WHERE client_id = $1
      ORDER BY room_type_name ASC;
    `;
        const res = await query(text, [clientId]);
        return res.rows;
    }
    async findById(clientId, roomTypeId) {
        const text = `
      SELECT
        room_type_id,
        client_id,
        floor_id,
        building_id,
        short_name,
        room_type_name,
        room_type_color,
        description,
        over_booking,
        allow_in_occupancy,
        is_crs
      FROM room_type
      WHERE client_id = $1 AND room_type_id = $2
      LIMIT 1;
    `;
        const res = await query(text, [clientId, roomTypeId]);
        return res.rows[0] || null;
    }
    async create(clientId, data) {
        const text = `
      INSERT INTO room_type (
        client_id,
        floor_id,
        building_id,
        short_name,
        room_type_name,
        room_type_color,
        description,
        over_booking,
        allow_in_occupancy,
        is_crs
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING
        room_type_id,
        client_id,
        floor_id,
        building_id,
        short_name,
        room_type_name,
        room_type_color,
        description,
        over_booking,
        allow_in_occupancy,
        is_crs;
    `;
        const values = [
            clientId,
            data.floor_id,
            data.building_id,
            data.short_name.trim(),
            data.room_type_name.trim(),
            data.room_type_color ?? null,
            data.description ?? null,
            data.over_booking ?? 0,
            data.allow_in_occupancy ?? true,
            data.is_crs ?? false,
        ];
        const res = await query(text, values);
        return res.rows[0];
    }
    async update(clientId, roomTypeId, data) {
        const text = `
      UPDATE room_type
      SET
        floor_id = COALESCE($3, floor_id),
        building_id = COALESCE($4, building_id),
        short_name = COALESCE($5, short_name),
        room_type_name = COALESCE($6, room_type_name),
        room_type_color = CASE WHEN $7::boolean THEN $8 ELSE room_type_color END,
        description = CASE WHEN $9::boolean THEN $10 ELSE description END,
        over_booking = COALESCE($11, over_booking),
        allow_in_occupancy = COALESCE($12, allow_in_occupancy),
        is_crs = COALESCE($13, is_crs)
      WHERE client_id = $1 AND room_type_id = $2
      RETURNING
        room_type_id,
        client_id,
        floor_id,
        building_id,
        short_name,
        room_type_name,
        room_type_color,
        description,
        over_booking,
        allow_in_occupancy,
        is_crs;
    `;
        const colorProvided = data.room_type_color !== undefined;
        const descProvided = data.description !== undefined;
        const values = [
            clientId,
            roomTypeId,
            data.floor_id ?? null,
            data.building_id ?? null,
            data.short_name?.trim() ?? null,
            data.room_type_name?.trim() ?? null,
            colorProvided,
            data.room_type_color ?? null,
            descProvided,
            data.description ?? null,
            data.over_booking ?? null,
            data.allow_in_occupancy ?? null,
            data.is_crs ?? null,
        ];
        const res = await query(text, values);
        return res.rows[0] || null;
    }
    async delete(clientId, roomTypeId) {
        const text = `
      DELETE FROM room_type
      WHERE client_id = $1 AND room_type_id = $2;
    `;
        const res = await query(text, [clientId, roomTypeId]);
        return (res.rowCount ?? 0) > 0;
    }
}
export const roomTypeRepository = new RoomTypeRepository();
