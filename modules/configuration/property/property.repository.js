import { query } from '../../../db/pool.js';
export class PropertyRepository {
    async findByClientId(clientId) {
        const text = `
      SELECT
        client_id,
        property_name,
        region,
        address,
        city,
        state,
        url,
        latitude::float as latitude,
        longitude::float as longitude
      FROM property
      WHERE client_id = $1
      LIMIT 1;
    `;
        const res = await query(text, [clientId]);
        return res.rows[0] || null;
    }
    async upsert(clientId, data) {
        const text = `
      INSERT INTO property (
        client_id,
        property_name,
        region,
        address,
        city,
        state,
        url,
        latitude,
        longitude
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (client_id) DO UPDATE SET
        property_name = EXCLUDED.property_name,
        region        = EXCLUDED.region,
        address       = EXCLUDED.address,
        city          = EXCLUDED.city,
        state         = EXCLUDED.state,
        url           = EXCLUDED.url,
        latitude      = EXCLUDED.latitude,
        longitude     = EXCLUDED.longitude
      RETURNING
        client_id,
        property_name,
        region,
        address,
        city,
        state,
        url,
        latitude::float as latitude,
        longitude::float as longitude;
    `;
        const values = [
            clientId,
            data.property_name,
            data.region ?? null,
            data.address ?? null,
            data.city,
            data.state,
            data.url ?? null,
            data.latitude ?? null,
            data.longitude ?? null,
        ];
        const res = await query(text, values);
        return res.rows[0];
    }
}
export const propertyRepository = new PropertyRepository();
