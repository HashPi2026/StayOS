import { query } from '../../../db/pool.js';

export class RestrictionRepository {
  async findMany(clientId, filters = {}) {
    let text = `
      SELECT
        rtr.room_type_restriction_id,
        rtr.client_id,
        rtr.rate_type_id,
        rtp.rate_type_name,
        rtr.room_type_id,
        rmt.room_type_name,
        TO_CHAR(rtr.restriction_date, 'YYYY-MM-DD') as restriction_date,
        rtr.close_to_arrival,
        rtr.close_to_departure,
        rtr.sold_out,
        rtr.minimum_nights,
        rtr.maximum_nights
      FROM room_type_restriction rtr
      INNER JOIN rate_type rtp ON rtp.rate_type_id = rtr.rate_type_id AND rtp.client_id = rtr.client_id
      INNER JOIN room_type rmt ON rmt.room_type_id = rtr.room_type_id AND rmt.client_id = rtr.client_id
      WHERE rtr.client_id = $1
    `;
    const params = [clientId];
    let idx = 2;

    if (filters.from) {
      text += ` AND rtr.restriction_date >= $${idx++}::DATE`;
      params.push(filters.from);
    }
    if (filters.to) {
      text += ` AND rtr.restriction_date <= $${idx++}::DATE`;
      params.push(filters.to);
    }
    if (filters.roomTypeId) {
      text += ` AND rtr.room_type_id = $${idx++}`;
      params.push(filters.roomTypeId);
    }
    if (filters.rateTypeId) {
      text += ` AND rtr.rate_type_id = $${idx++}`;
      params.push(filters.rateTypeId);
    }

    text += ` ORDER BY rtr.restriction_date ASC, rtr.room_type_id ASC;`;
    const res = await query(text, params);
    return res.rows;
  }

  async findById(clientId, id) {
    const text = `
      SELECT
        rtr.room_type_restriction_id,
        rtr.client_id,
        rtr.rate_type_id,
        rtp.rate_type_name,
        rtr.room_type_id,
        rmt.room_type_name,
        TO_CHAR(rtr.restriction_date, 'YYYY-MM-DD') as restriction_date,
        rtr.close_to_arrival,
        rtr.close_to_departure,
        rtr.sold_out,
        rtr.minimum_nights,
        rtr.maximum_nights
      FROM room_type_restriction rtr
      INNER JOIN rate_type rtp ON rtp.rate_type_id = rtr.rate_type_id AND rtp.client_id = rtr.client_id
      INNER JOIN room_type rmt ON rmt.room_type_id = rtr.room_type_id AND rmt.client_id = rtr.client_id
      WHERE rtr.client_id = $1 AND rtr.room_type_restriction_id = $2
      LIMIT 1;
    `;
    const res = await query(text, [clientId, id]);
    return res.rows[0] || null;
  }

  async upsert(clientId, data) {
    const text = `
      INSERT INTO room_type_restriction (
        client_id,
        rate_type_id,
        room_type_id,
        restriction_date,
        close_to_arrival,
        close_to_departure,
        sold_out,
        minimum_nights,
        maximum_nights
      )
      VALUES ($1, $2, $3, $4::DATE, $5, $6, $7, $8, $9)
      ON CONFLICT (client_id, rate_type_id, room_type_id, restriction_date)
      DO UPDATE SET
        close_to_arrival = EXCLUDED.close_to_arrival,
        close_to_departure = EXCLUDED.close_to_departure,
        sold_out = EXCLUDED.sold_out,
        minimum_nights = EXCLUDED.minimum_nights,
        maximum_nights = EXCLUDED.maximum_nights
      RETURNING
        room_type_restriction_id,
        client_id,
        rate_type_id,
        room_type_id,
        TO_CHAR(restriction_date, 'YYYY-MM-DD') as restriction_date,
        close_to_arrival,
        close_to_departure,
        sold_out,
        minimum_nights,
        maximum_nights;
    `;
    const values = [
      clientId,
      data.rate_type_id,
      data.room_type_id,
      data.restriction_date,
      data.close_to_arrival ?? false,
      data.close_to_departure ?? false,
      data.sold_out ?? false,
      data.minimum_nights ?? null,
      data.maximum_nights ?? null,
    ];
    const res = await query(text, values);
    return res.rows[0];
  }

  async updateById(clientId, id, data) {
    const text = `
      UPDATE room_type_restriction
      SET
        close_to_arrival = COALESCE($3, close_to_arrival),
        close_to_departure = COALESCE($4, close_to_departure),
        sold_out = COALESCE($5, sold_out),
        minimum_nights = CASE WHEN $6::BOOLEAN THEN $7 ELSE minimum_nights END,
        maximum_nights = CASE WHEN $8::BOOLEAN THEN $9 ELSE maximum_nights END
      WHERE client_id = $1 AND room_type_restriction_id = $2
      RETURNING
        room_type_restriction_id,
        client_id,
        rate_type_id,
        room_type_id,
        TO_CHAR(restriction_date, 'YYYY-MM-DD') as restriction_date,
        close_to_arrival,
        close_to_departure,
        sold_out,
        minimum_nights,
        maximum_nights;
    `;
    const minNightsProvided = data.minimum_nights !== undefined;
    const maxNightsProvided = data.maximum_nights !== undefined;
    const values = [
      clientId,
      id,
      data.close_to_arrival !== undefined ? data.close_to_arrival : null,
      data.close_to_departure !== undefined ? data.close_to_departure : null,
      data.sold_out !== undefined ? data.sold_out : null,
      minNightsProvided,
      data.minimum_nights ?? null,
      maxNightsProvided,
      data.maximum_nights ?? null,
    ];
    const res = await query(text, values);
    return res.rows[0] || null;
  }

  async deleteById(clientId, id) {
    const text = `
      DELETE FROM room_type_restriction
      WHERE client_id = $1 AND room_type_restriction_id = $2;
    `;
    const res = await query(text, [clientId, id]);
    return (res.rowCount ?? 0) > 0;
  }

  async verifyRateTypeBelongsToClient(clientId, rateTypeId) {
    const text = `SELECT 1 FROM rate_type WHERE client_id = $1 AND rate_type_id = $2 LIMIT 1;`;
    const res = await query(text, [clientId, rateTypeId]);
    return res.rows.length > 0;
  }

  async verifyRoomTypeBelongsToClient(clientId, roomTypeId) {
    const text = `SELECT 1 FROM room_type WHERE client_id = $1 AND room_type_id = $2 LIMIT 1;`;
    const res = await query(text, [clientId, roomTypeId]);
    return res.rows.length > 0;
  }
}

export const restrictionRepository = new RestrictionRepository();
