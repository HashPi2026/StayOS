import { query } from '../../../db/pool.js';
export class BuildingRepository {
    async findMany(clientId) {
        const text = `
      SELECT
        building_id,
        client_id,
        building_name,
        description
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
        description
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
        description
      ) VALUES ($1, $2, $3)
      RETURNING
        building_id,
        client_id,
        building_name,
        description;
    `;
        const values = [clientId, data.building_name.trim(), data.description ?? null];
        const res = await query(text, values);
        return res.rows[0];
    }
    async update(clientId, buildingId, data) {
        const text = `
      UPDATE building
      SET
        building_name = COALESCE($3, building_name),
        description = CASE WHEN $4::boolean THEN $5 ELSE description END
      WHERE client_id = $1 AND building_id = $2
      RETURNING
        building_id,
        client_id,
        building_name,
        description;
    `;
        const descriptionProvided = data.description !== undefined;
        const values = [
            clientId,
            buildingId,
            data.building_name?.trim() ?? null,
            descriptionProvided,
            data.description ?? null,
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
