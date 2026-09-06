import { query } from '../../../db/pool.js';
export class FloorRepository {
    async findMany(clientId, buildingId) {
        let text = `
      SELECT
        floor_id,
        client_id,
        building_id,
        floor_name,
        description
      FROM floor
      WHERE client_id = $1
    `;
        const params = [clientId];
        if (buildingId !== undefined) {
            text += ` AND building_id = $2`;
            params.push(buildingId);
        }
        text += ` ORDER BY floor_name ASC;`;
        const res = await query(text, params);
        return res.rows;
    }
    async findById(clientId, floorId) {
        const text = `
      SELECT
        floor_id,
        client_id,
        building_id,
        floor_name,
        description
      FROM floor
      WHERE client_id = $1 AND floor_id = $2
      LIMIT 1;
    `;
        const res = await query(text, [clientId, floorId]);
        return res.rows[0] || null;
    }
    async create(clientId, data) {
        const text = `
      INSERT INTO floor (
        client_id,
        building_id,
        floor_name,
        description
      ) VALUES ($1, $2, $3, $4)
      RETURNING
        floor_id,
        client_id,
        building_id,
        floor_name,
        description;
    `;
        const values = [clientId, data.building_id, data.floor_name.trim(), data.description ?? null];
        const res = await query(text, values);
        return res.rows[0];
    }
    async update(clientId, floorId, data) {
        const text = `
      UPDATE floor
      SET
        building_id = COALESCE($3, building_id),
        floor_name = COALESCE($4, floor_name),
        description = CASE WHEN $5::boolean THEN $6 ELSE description END
      WHERE client_id = $1 AND floor_id = $2
      RETURNING
        floor_id,
        client_id,
        building_id,
        floor_name,
        description;
    `;
        const values = [
            clientId,
            floorId,
            data.building_id ?? null,
            data.floor_name ? data.floor_name.trim() : null,
            data.description !== undefined,
            data.description ?? null,
        ];
        const res = await query(text, values);
        return res.rows[0] || null;
    }
    async delete(clientId, floorId) {
        const text = `
      DELETE FROM floor
      WHERE client_id = $1 AND floor_id = $2;
    `;
        const res = await query(text, [clientId, floorId]);
        return (res.rowCount ?? 0) > 0;
    }
}
export const floorRepository = new FloorRepository();
