import { query } from '../../../db/pool.js';

export class ForecastRepository {
  /**
   * Read property-wide rows directly from the forecast table.
   */
  async findByDateRange(clientId, fromDate, toDate) {
    const text = `
      SELECT
        forecast_id,
        client_id,
        TO_CHAR(forecast_date, 'YYYY-MM-DD') as forecast_date,
        available_rooms,
        total_rooms,
        vacant_maint_rooms,
        stay_over_count,
        expected_checkin_count,
        expected_checkout_count,
        expected_inhouse_count,
        room_revenue,
        rooms_sold,
        occupancy_pct,
        adr
      FROM forecast
      WHERE client_id = $1
        AND forecast_date >= $2::DATE
        AND forecast_date <= $3::DATE
      ORDER BY forecast_date ASC;
    `;
    const res = await query(text, [clientId, fromDate, toDate]);
    return res.rows;
  }

  /**
   * Upsert a forecast row for a single date.
   */
  async upsert(clientId, row) {
    const text = `
      INSERT INTO forecast (
        client_id,
        forecast_date,
        available_rooms,
        total_rooms,
        vacant_maint_rooms,
        stay_over_count,
        expected_checkin_count,
        expected_checkout_count,
        expected_inhouse_count,
        room_revenue,
        rooms_sold,
        occupancy_pct,
        adr
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (client_id, forecast_date) DO UPDATE
      SET
        available_rooms = EXCLUDED.available_rooms,
        total_rooms = EXCLUDED.total_rooms,
        vacant_maint_rooms = EXCLUDED.vacant_maint_rooms,
        stay_over_count = EXCLUDED.stay_over_count,
        expected_checkin_count = EXCLUDED.expected_checkin_count,
        expected_checkout_count = EXCLUDED.expected_checkout_count,
        expected_inhouse_count = EXCLUDED.expected_inhouse_count,
        room_revenue = EXCLUDED.room_revenue,
        rooms_sold = EXCLUDED.rooms_sold,
        occupancy_pct = EXCLUDED.occupancy_pct,
        adr = EXCLUDED.adr
      RETURNING
        forecast_id,
        client_id,
        TO_CHAR(forecast_date, 'YYYY-MM-DD') as forecast_date,
        available_rooms,
        total_rooms,
        vacant_maint_rooms,
        stay_over_count,
        expected_checkin_count,
        expected_checkout_count,
        expected_inhouse_count,
        room_revenue,
        rooms_sold,
        occupancy_pct,
        adr;
    `;
    const values = [
      clientId,
      row.forecast_date,
      row.available_rooms ?? 0,
      row.total_rooms ?? 0,
      row.vacant_maint_rooms ?? 0,
      row.stay_over_count ?? 0,
      row.expected_checkin_count ?? 0,
      row.expected_checkout_count ?? 0,
      row.expected_inhouse_count ?? 0,
      row.room_revenue ?? 0.00,
      row.rooms_sold ?? 0,
      row.occupancy_pct ?? 0.00,
      row.adr ?? 0.00,
    ];
    const res = await query(text, values);
    return res.rows[0];
  }

  /**
   * Get property-wide room statistics and room rate baseline for recalculation.
   */
  async getPropertyInventoryStats(clientId) {
    const text = `
      SELECT
        COUNT(*)::INTEGER as total_rooms,
        COUNT(*) FILTER (
          WHERE LOWER(COALESCE(status, '')) IN ('maintenance', 'out_of_order', 'out_of_service', 'blocked', 'maint')
        )::INTEGER as maint_rooms,
        COUNT(*) FILTER (
          WHERE LOWER(COALESCE(status, '')) = 'occupied'
        )::INTEGER as occupied_rooms,
        AVG(COALESCE(rate, 0))::NUMERIC(10,2) as avg_base_rate
      FROM room
      WHERE client_id = $1;
    `;
    const res = await query(text, [clientId]);
    return res.rows[0];
  }

  /**
   * Get room rates across property for a date range.
   */
  async getRoomRatesForDates(clientId, fromDate, toDate, roomTypeId) {
    let text = `
      SELECT
        room_type_id,
        occupancy_type,
        TO_CHAR(rate_date, 'YYYY-MM-DD') as rate_date,
        rate_amount
      FROM room_rate
      WHERE client_id = $1
        AND rate_date >= $2::DATE
        AND rate_date <= $3::DATE
    `;
    const params = [clientId, fromDate, toDate];
    if (roomTypeId) {
      text += ` AND room_type_id = $4`;
      params.push(roomTypeId);
    }
    const res = await query(text, params);
    return res.rows;
  }

  /**
   * Get room stats for a specific Room Type.
   */
  async getRoomTypeStats(clientId, roomTypeId) {
    const text = `
      SELECT
        rt.room_type_id,
        rt.room_type_name,
        rt.base_rate,
        COUNT(r.room_id)::INTEGER as total_rooms,
        COUNT(r.room_id) FILTER (
          WHERE LOWER(COALESCE(r.status, '')) IN ('maintenance', 'out_of_order', 'out_of_service', 'blocked', 'maint')
        )::INTEGER as maint_rooms,
        COUNT(r.room_id) FILTER (
          WHERE LOWER(COALESCE(r.status, '')) = 'occupied'
        )::INTEGER as occupied_rooms,
        AVG(COALESCE(r.rate, rt.base_rate, 0))::NUMERIC(10,2) as avg_rate
      FROM room_type rt
      LEFT JOIN room r ON r.room_type_id = rt.room_type_id AND r.client_id = rt.client_id
      WHERE rt.client_id = $1 AND rt.room_type_id = $2
      GROUP BY rt.room_type_id, rt.room_type_name, rt.base_rate;
    `;
    const res = await query(text, [clientId, roomTypeId]);
    return res.rows[0] || null;
  }
}

export const forecastRepository = new ForecastRepository();
