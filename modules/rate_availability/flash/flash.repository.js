import { query } from '../../../db/pool.js';

export class FlashRepository {
  /**
   * Get Flash view settings for a client.
   * Auto-creates with default values if not present.
   */
  async getSettings(clientId) {
    const text = `
      INSERT INTO flash_view_settings (
        client_id, show_tooltip, show_rate, show_occupancy, show_crs_inventory, show_v_maint_room, show_chart
      )
      VALUES ($1, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE)
      ON CONFLICT (client_id) DO UPDATE
      SET client_id = EXCLUDED.client_id
      RETURNING
        flash_view_setting_id,
        client_id,
        show_tooltip,
        show_rate,
        show_occupancy,
        show_crs_inventory,
        show_v_maint_room,
        show_chart;
    `;
    const res = await query(text, [clientId]);
    return res.rows[0];
  }

  /**
   * Update Flash view settings for a client.
   */
  async updateSettings(clientId, data) {
    // Ensure row exists first
    await this.getSettings(clientId);

    const text = `
      UPDATE flash_view_settings
      SET
        show_tooltip = CASE WHEN $2::BOOLEAN IS NOT NULL THEN $2::BOOLEAN ELSE show_tooltip END,
        show_rate = CASE WHEN $3::BOOLEAN IS NOT NULL THEN $3::BOOLEAN ELSE show_rate END,
        show_occupancy = CASE WHEN $4::BOOLEAN IS NOT NULL THEN $4::BOOLEAN ELSE show_occupancy END,
        show_crs_inventory = CASE WHEN $5::BOOLEAN IS NOT NULL THEN $5::BOOLEAN ELSE show_crs_inventory END,
        show_v_maint_room = CASE WHEN $6::BOOLEAN IS NOT NULL THEN $6::BOOLEAN ELSE show_v_maint_room END,
        show_chart = CASE WHEN $7::BOOLEAN IS NOT NULL THEN $7::BOOLEAN ELSE show_chart END
      WHERE client_id = $1
      RETURNING
        flash_view_setting_id,
        client_id,
        show_tooltip,
        show_rate,
        show_occupancy,
        show_crs_inventory,
        show_v_maint_room,
        show_chart;
    `;
    const values = [
      clientId,
      data.show_tooltip !== undefined ? data.show_tooltip : null,
      data.show_rate !== undefined ? data.show_rate : null,
      data.show_occupancy !== undefined ? data.show_occupancy : null,
      data.show_crs_inventory !== undefined ? data.show_crs_inventory : null,
      data.show_v_maint_room !== undefined ? data.show_v_maint_room : null,
      data.show_chart !== undefined ? data.show_chart : null,
    ];
    const res = await query(text, values);
    return res.rows[0];
  }

  /**
   * Get Room Types for the property.
   */
  async getRoomTypes(clientId, roomTypeId) {
    let text = `
      SELECT
        rt.room_type_id,
        rt.room_type_name,
        rt.short_name as short_code,
        rt.category,
        COALESCE(rt.base_rate, 0.00) as base_rate,
        COALESCE(rt.capacity, 2) as capacity,
        COALESCE(rt.max_adults, 2) as max_adults,
        COALESCE(rt.max_children, 1) as max_children
      FROM room_type rt
      WHERE rt.client_id = $1
    `;
    const params = [clientId];
    if (roomTypeId) {
      text += ` AND rt.room_type_id = $2`;
      params.push(roomTypeId);
    }
    text += ` ORDER BY rt.room_type_name ASC;`;
    const res = await query(text, params);
    return res.rows;
  }

  /**
   * Get Rooms aggregated summary by Room Type.
   */
  async getRoomsSummary(clientId) {
    const text = `
      SELECT
        r.room_type_id,
        COUNT(*)::INTEGER as total_rooms,
        COUNT(*) FILTER (
          WHERE LOWER(COALESCE(r.status, '')) IN ('maintenance', 'out_of_order', 'out_of_service', 'blocked', 'maint')
        )::INTEGER as maint_rooms,
        COUNT(*) FILTER (
          WHERE LOWER(COALESCE(r.status, '')) = 'occupied'
        )::INTEGER as occupied_rooms,
        COUNT(*) FILTER (
          WHERE r.is_crs_inventory = TRUE
        )::INTEGER as crs_rooms,
        AVG(COALESCE(r.rate, 0))::NUMERIC(10,2) as avg_room_rate
      FROM room r
      WHERE r.client_id = $1
      GROUP BY r.room_type_id;
    `;
    const res = await query(text, [clientId]);
    return res.rows;
  }

  /**
   * Get Rates across a date range.
   */
  async getRates(clientId, fromDate, toDate, rateTypeId) {
    let text = `
      SELECT
        rr.room_type_id,
        rr.rate_type_id,
        rr.occupancy_type,
        TO_CHAR(rr.rate_date, 'YYYY-MM-DD') as rate_date,
        rr.rate_amount
      FROM room_rate rr
      WHERE rr.client_id = $1
        AND rr.rate_date >= $2::DATE
        AND rr.rate_date <= $3::DATE
    `;
    const params = [clientId, fromDate, toDate];
    if (rateTypeId) {
      text += ` AND rr.rate_type_id = $4`;
      params.push(rateTypeId);
    }
    text += ` ORDER BY rr.rate_date ASC;`;
    const res = await query(text, params);
    return res.rows;
  }

  /**
   * Get Restrictions across a date range.
   */
  async getRestrictions(clientId, fromDate, toDate, rateTypeId) {
    let text = `
      SELECT
        rtr.room_type_id,
        rtr.rate_type_id,
        TO_CHAR(rtr.restriction_date, 'YYYY-MM-DD') as restriction_date,
        rtr.close_to_arrival,
        rtr.close_to_departure,
        rtr.sold_out,
        rtr.minimum_nights,
        rtr.maximum_nights
      FROM room_type_restriction rtr
      WHERE rtr.client_id = $1
        AND rtr.restriction_date >= $2::DATE
        AND rtr.restriction_date <= $3::DATE
    `;
    const params = [clientId, fromDate, toDate];
    if (rateTypeId) {
      text += ` AND rtr.rate_type_id = $4`;
      params.push(rateTypeId);
    }
    text += ` ORDER BY rtr.restriction_date ASC;`;
    const res = await query(text, params);
    return res.rows;
  }
}

export const flashRepository = new FlashRepository();
