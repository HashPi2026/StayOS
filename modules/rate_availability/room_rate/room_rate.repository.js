import { query } from '../../../db/pool.js';

export class RoomRateRepository {
  async findMany(clientId, filters = {}) {
    let text = `
      SELECT
        rr.room_rate_id,
        rr.client_id,
        rr.rate_type_id,
        rtp.rate_type_name,
        rr.room_type_id,
        rmt.room_type_name,
        rr.occupancy_type,
        rr.occupancy_count,
        TO_CHAR(rr.rate_date, 'YYYY-MM-DD') as rate_date,
        rr.rate_amount
      FROM room_rate rr
      INNER JOIN rate_type rtp ON rtp.rate_type_id = rr.rate_type_id AND rtp.client_id = rr.client_id
      INNER JOIN room_type rmt ON rmt.room_type_id = rr.room_type_id AND rmt.client_id = rr.client_id
      WHERE rr.client_id = $1
    `;
    const params = [clientId];
    let idx = 2;

    if (filters.from) {
      text += ` AND rr.rate_date >= $${idx++}::DATE`;
      params.push(filters.from);
    }
    if (filters.to) {
      text += ` AND rr.rate_date <= $${idx++}::DATE`;
      params.push(filters.to);
    }
    if (filters.roomTypeId) {
      text += ` AND rr.room_type_id = $${idx++}`;
      params.push(filters.roomTypeId);
    }
    if (filters.rateTypeId) {
      text += ` AND rr.rate_type_id = $${idx++}`;
      params.push(filters.rateTypeId);
    }
    if (filters.occupancyType) {
      text += ` AND rr.occupancy_type = $${idx++}`;
      params.push(filters.occupancyType);
    }

    text += ` ORDER BY rr.rate_date ASC, rr.room_type_id ASC, rr.occupancy_type ASC;`;
    const res = await query(text, params);
    return res.rows;
  }

  async findById(clientId, id) {
    const text = `
      SELECT
        rr.room_rate_id,
        rr.client_id,
        rr.rate_type_id,
        rtp.rate_type_name,
        rr.room_type_id,
        rmt.room_type_name,
        rr.occupancy_type,
        rr.occupancy_count,
        TO_CHAR(rr.rate_date, 'YYYY-MM-DD') as rate_date,
        rr.rate_amount
      FROM room_rate rr
      INNER JOIN rate_type rtp ON rtp.rate_type_id = rr.rate_type_id AND rtp.client_id = rr.client_id
      INNER JOIN room_type rmt ON rmt.room_type_id = rr.room_type_id AND rmt.client_id = rr.client_id
      WHERE rr.client_id = $1 AND rr.room_rate_id = $2
      LIMIT 1;
    `;
    const res = await query(text, [clientId, id]);
    return res.rows[0] || null;
  }

  async upsert(clientId, data) {
    const text = `
      INSERT INTO room_rate (
        client_id,
        rate_type_id,
        room_type_id,
        occupancy_type,
        occupancy_count,
        rate_date,
        rate_amount
      )
      VALUES ($1, $2, $3, $4, $5, $6::DATE, $7)
      ON CONFLICT (client_id, rate_type_id, room_type_id, occupancy_type, rate_date)
      DO UPDATE SET
        rate_amount = EXCLUDED.rate_amount,
        occupancy_count = COALESCE(EXCLUDED.occupancy_count, room_rate.occupancy_count)
      RETURNING
        room_rate_id,
        client_id,
        rate_type_id,
        room_type_id,
        occupancy_type,
        occupancy_count,
        TO_CHAR(rate_date, 'YYYY-MM-DD') as rate_date,
        rate_amount;
    `;
    const values = [
      clientId,
      data.rate_type_id,
      data.room_type_id,
      data.occupancy_type,
      data.occupancy_count ?? 1,
      data.rate_date,
      data.rate_amount,
    ];
    const res = await query(text, values);
    return res.rows[0];
  }

  async updateById(clientId, id, data) {
    const text = `
      UPDATE room_rate
      SET
        rate_amount = COALESCE($3, rate_amount),
        occupancy_count = COALESCE($4, occupancy_count)
      WHERE client_id = $1 AND room_rate_id = $2
      RETURNING
        room_rate_id,
        client_id,
        rate_type_id,
        room_type_id,
        occupancy_type,
        occupancy_count,
        TO_CHAR(rate_date, 'YYYY-MM-DD') as rate_date,
        rate_amount;
    `;
    const values = [
      clientId,
      id,
      data.rate_amount !== undefined ? data.rate_amount : null,
      data.occupancy_count !== undefined ? data.occupancy_count : null,
    ];
    const res = await query(text, values);
    return res.rows[0] || null;
  }

  async deleteById(clientId, id) {
    const text = `
      DELETE FROM room_rate
      WHERE client_id = $1 AND room_rate_id = $2;
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

  /**
   * Find existing rates for source room type to perform copy-from-room-type
   */
  async findSourceRatesForCopy(clientId, sourceRoomTypeId, fromDate, toDate, rateTypeId) {
    let text = `
      SELECT
        rate_type_id,
        occupancy_type,
        occupancy_count,
        TO_CHAR(rate_date, 'YYYY-MM-DD') as rate_date,
        rate_amount
      FROM room_rate
      WHERE client_id = $1
        AND room_type_id = $2
        AND rate_date >= $3::DATE
        AND rate_date <= $4::DATE
    `;
    const params = [clientId, sourceRoomTypeId, fromDate, toDate];
    if (rateTypeId) {
      text += ` AND rate_type_id = $5`;
      params.push(rateTypeId);
    }
    const res = await query(text, params);
    return res.rows;
  }
}

export const roomRateRepository = new RoomRateRepository();
