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
        longitude::float as longitude,
        country,
        postal_code,
        email,
        phone,
        currency,
        currency_symbol,
        star_rating::float as star_rating,
        status,
        subscription_plan,
        subscription_status,
        billing_cycle,
        max_rooms,
        cap_theorem_model,
        isolation_level,
        active_cluster_node,
        created_at,
        updated_at
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
        longitude,
        country,
        postal_code,
        email,
        phone,
        currency,
        currency_symbol,
        star_rating,
        status,
        subscription_plan,
        subscription_status,
        billing_cycle,
        max_rooms,
        cap_theorem_model,
        isolation_level,
        active_cluster_node,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, NOW())
      ON CONFLICT (client_id) DO UPDATE SET
        property_name       = EXCLUDED.property_name,
        region              = EXCLUDED.region,
        address             = EXCLUDED.address,
        city                = EXCLUDED.city,
        state               = EXCLUDED.state,
        url                 = EXCLUDED.url,
        latitude            = EXCLUDED.latitude,
        longitude           = EXCLUDED.longitude,
        country             = EXCLUDED.country,
        postal_code         = EXCLUDED.postal_code,
        email               = EXCLUDED.email,
        phone               = EXCLUDED.phone,
        currency            = EXCLUDED.currency,
        currency_symbol     = EXCLUDED.currency_symbol,
        star_rating         = EXCLUDED.star_rating,
        status              = EXCLUDED.status,
        subscription_plan   = EXCLUDED.subscription_plan,
        subscription_status = EXCLUDED.subscription_status,
        billing_cycle       = EXCLUDED.billing_cycle,
        max_rooms           = EXCLUDED.max_rooms,
        cap_theorem_model   = EXCLUDED.cap_theorem_model,
        isolation_level     = EXCLUDED.isolation_level,
        active_cluster_node = EXCLUDED.active_cluster_node,
        updated_at          = NOW()
      RETURNING
        client_id,
        property_name,
        region,
        address,
        city,
        state,
        url,
        latitude::float as latitude,
        longitude::float as longitude,
        country,
        postal_code,
        email,
        phone,
        currency,
        currency_symbol,
        star_rating::float as star_rating,
        status,
        subscription_plan,
        subscription_status,
        billing_cycle,
        max_rooms,
        cap_theorem_model,
        isolation_level,
        active_cluster_node,
        updated_at;
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
            data.country ?? 'United States',
            data.postal_code ?? null,
            data.email ?? null,
            data.phone ?? null,
            data.currency ?? 'USD',
            data.currency_symbol ?? '$',
            data.star_rating ?? 4.5,
            data.status ?? 'operational',
            data.subscription_plan ?? 'Pro',
            data.subscription_status ?? 'active',
            data.billing_cycle ?? 'monthly',
            data.max_rooms ?? 150,
            data.cap_theorem_model ?? 'CP',
            data.isolation_level ?? 'database_and_storage_partition',
            data.active_cluster_node ?? 'cluster-node-partition-01',
        ];
        const res = await query(text, values);
        return res.rows[0];
    }
}
export const propertyRepository = new PropertyRepository();
