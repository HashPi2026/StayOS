import { query } from '../../../db/pool';
import { BuildingEntity, CreateBuildingDTO, UpdateBuildingDTO } from './building.types';

export class BuildingRepository {
  async findMany(clientId: string): Promise<BuildingEntity[]> {
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
    const res = await query<BuildingEntity>(text, [clientId]);
    return res.rows;
  }

  async findById(clientId: string, buildingId: number): Promise<BuildingEntity | null> {
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
    const res = await query<BuildingEntity>(text, [clientId, buildingId]);
    return res.rows[0] || null;
  }

  async create(clientId: string, data: CreateBuildingDTO): Promise<BuildingEntity> {
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
    const res = await query<BuildingEntity>(text, values);
    return res.rows[0];
  }

  async update(clientId: string, buildingId: number, data: UpdateBuildingDTO): Promise<BuildingEntity | null> {
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
    const res = await query<BuildingEntity>(text, values);
    return res.rows[0] || null;
  }

  async delete(clientId: string, buildingId: number): Promise<boolean> {
    const text = `
      DELETE FROM building
      WHERE client_id = $1 AND building_id = $2;
    `;
    const res = await query(text, [clientId, buildingId]);
    return (res.rowCount ?? 0) > 0;
  }
}

export const buildingRepository = new BuildingRepository();
