import { query } from '../../../db/pool.js';
export class RoomRepository {
    async findMany(clientId, filters) {
        let text = `
      SELECT
        room_id,
        client_id,
        room_type_id,
        floor_id,
        building_id,
        room_name,
        short_name,
        is_hourly_rental,
        is_smoking,
        is_handicap,
        is_pet_allowed,
        include_in_occupancy_adr,
        is_crs_inventory
      FROM room
      WHERE client_id = $1
    `;
        const params = [clientId];
        let paramIdx = 2;
        if (filters?.building_id !== undefined) {
            text += ` AND building_id = $${paramIdx++}`;
            params.push(filters.building_id);
        }
        if (filters?.floor_id !== undefined) {
            text += ` AND floor_id = $${paramIdx++}`;
            params.push(filters.floor_id);
        }
        if (filters?.room_type_id !== undefined) {
            text += ` AND room_type_id = $${paramIdx++}`;
            params.push(filters.room_type_id);
        }
        text += ` ORDER BY room_name ASC;`;
        const res = await query(text, params);
        return res.rows;
    }
    async findById(clientId, roomId) {
        const text = `
      SELECT
        room_id,
        client_id,
        room_type_id,
        floor_id,
        building_id,
        room_name,
        short_name,
        is_hourly_rental,
        is_smoking,
        is_handicap,
        is_pet_allowed,
        include_in_occupancy_adr,
        is_crs_inventory
      FROM room
      WHERE client_id = $1 AND room_id = $2
      LIMIT 1;
    `;
        const res = await query(text, [clientId, roomId]);
        return res.rows[0] || null;
    }
    async create(clientId, data) {
        const text = `
      INSERT INTO room (
        client_id,
        room_type_id,
        floor_id,
        building_id,
        room_name,
        short_name,
        is_hourly_rental,
        is_smoking,
        is_handicap,
        is_pet_allowed,
        include_in_occupancy_adr,
        is_crs_inventory
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING
        room_id,
        client_id,
        room_type_id,
        floor_id,
        building_id,
        room_name,
        short_name,
        is_hourly_rental,
        is_smoking,
        is_handicap,
        is_pet_allowed,
        include_in_occupancy_adr,
        is_crs_inventory;
    `;
        const values = [
            clientId,
            data.room_type_id,
            data.floor_id,
            data.building_id,
            data.room_name.trim(),
            data.short_name.trim(),
            data.is_hourly_rental ?? false,
            data.is_smoking ?? false,
            data.is_handicap ?? false,
            data.is_pet_allowed ?? false,
            data.include_in_occupancy_adr ?? true,
            data.is_crs_inventory ?? false,
        ];
        const res = await query(text, values);
        return res.rows[0];
    }
    async update(clientId, roomId, data) {
        const text = `
      UPDATE room
      SET
        room_type_id = COALESCE($3, room_type_id),
        floor_id = COALESCE($4, floor_id),
        building_id = COALESCE($5, building_id),
        room_name = COALESCE($6, room_name),
        short_name = COALESCE($7, short_name),
        is_hourly_rental = COALESCE($8, is_hourly_rental),
        is_smoking = COALESCE($9, is_smoking),
        is_handicap = COALESCE($10, is_handicap),
        is_pet_allowed = COALESCE($11, is_pet_allowed),
        include_in_occupancy_adr = COALESCE($12, include_in_occupancy_adr),
        is_crs_inventory = COALESCE($13, is_crs_inventory)
      WHERE client_id = $1 AND room_id = $2
      RETURNING
        room_id,
        client_id,
        room_type_id,
        floor_id,
        building_id,
        room_name,
        short_name,
        is_hourly_rental,
        is_smoking,
        is_handicap,
        is_pet_allowed,
        include_in_occupancy_adr,
        is_crs_inventory;
    `;
        const values = [
            clientId,
            roomId,
            data.room_type_id ?? null,
            data.floor_id ?? null,
            data.building_id ?? null,
            data.room_name ? data.room_name.trim() : null,
            data.short_name ? data.short_name.trim() : null,
            data.is_hourly_rental ?? null,
            data.is_smoking ?? null,
            data.is_handicap ?? null,
            data.is_pet_allowed ?? null,
            data.include_in_occupancy_adr ?? null,
            data.is_crs_inventory ?? null,
        ];
        const res = await query(text, values);
        return res.rows[0] || null;
    }
    async delete(clientId, roomId) {
        const text = `
      DELETE FROM room
      WHERE client_id = $1 AND room_id = $2;
    `;
        const res = await query(text, [clientId, roomId]);
        return (res.rowCount ?? 0) > 0;
    }
}
export const roomRepository = new RoomRepository();
