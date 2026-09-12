import { query } from '../../../db/pool.js';
export class BuildingRepository {
    async findMany(clientId) {
        const text = `
      SELECT
        building_id,
        client_id,
        building_name,
        description,
        code,
        status,
        total_floors,
        total_rooms,
        has_active_rooms,
        created_at,
        updated_at
      FROM building
      WHERE client_id = $1
      ORDER BY building_name ASC;
    `;
        const res = await query(text, [clientId]);
        return res.rows;
    }
    async findById(clientId, buildingId) {
        const text = `
      SELECT
        building_id,
        client_id,
        building_name,
        description,
        code,
        status,
        total_floors,
        total_rooms,
        has_active_rooms,
        created_at,
        updated_at
      FROM building
      WHERE client_id = $1 AND building_id = $2
      LIMIT 1;
    `;
        const res = await query(text, [clientId, buildingId]);
        return res.rows[0] || null;
    }
    async create(clientId, data) {
        const text = `
      INSERT INTO building (
        client_id,
        building_name,
        description,
        code,
        status,
        total_floors,
        total_rooms,
        has_active_rooms
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING
        building_id,
        client_id,
        building_name,
        description,
        code,
        status,
        total_floors,
        total_rooms,
        has_active_rooms,
        created_at,
        updated_at;
    `;
        const values = [
            clientId,
            data.building_name.trim(),
            data.description ?? null,
            data.code ?? null,
            data.status ?? 'active',
            data.total_floors ?? 1,
            data.total_rooms ?? 0,
            data.has_active_rooms ?? true,
        ];
        const res = await query(text, values);
        return res.rows[0];
    }
    async update(clientId, buildingId, data) {
        const text = `
      UPDATE building
      SET
        building_name = COALESCE($3, building_name),
        description = CASE WHEN $4::boolean THEN $5 ELSE description END,
        code = COALESCE($6, code),
        status = COALESCE($7, status),
        total_floors = COALESCE($8, total_floors),
        total_rooms = COALESCE($9, total_rooms),
        updated_at = NOW()
      WHERE client_id = $1 AND building_id = $2
      RETURNING
        building_id,
        client_id,
        building_name,
        description,
        code,
        status,
        total_floors,
        total_rooms,
        has_active_rooms,
        created_at,
        updated_at;
    `;
        const descriptionProvided = data.description !== undefined;
        const values = [
            clientId,
            buildingId,
            data.building_name?.trim() ?? null,
            descriptionProvided,
            data.description ?? null,
            data.code ?? null,
            data.status ?? null,
            data.total_floors ?? null,
            data.total_rooms ?? null,
        ];
        const res = await query(text, values);
        return res.rows[0] || null;
    }
    async delete(clientId, buildingId) {
        const text = `
      DELETE FROM building
      WHERE client_id = $1 AND building_id = $2;
    `;
        const res = await query(text, [clientId, buildingId]);
        return (res.rowCount ?? 0) > 0;
    }
}
export const buildingRepository = new BuildingRepository();
