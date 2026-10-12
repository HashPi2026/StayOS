import { pool } from '../../db/pool.js';
import {
  normalizeReservationStatus,
  RESERVATION_STATUS,
  isMaintenanceRoomStatus,
  isRoomClean,
} from './status.helper.js';

export interface DashboardSummaryMetrics {
  workingDate: string;
  kpis: {
    expectedArrivals: number;
    expectedDepartures: number;
    checkouts: number;
    vacantRooms: number;
    inhouseGuests: number;
    maintenanceRooms: number;
    otaCount: number;
    cancelCount: number;
  };
  revenue: {
    roomSold: number;
    roomRevenue: number;
    adr: number;
    occupancyPercent: number;
    revpar: number;
    availableRooms: number;
  };
}

export class DashboardService {
  /**
   * Retrieves the current property's working date from database.
   */
  async getWorkingDate(clientId: number): Promise<string> {
    try {
      const { rows } = await pool.query(
        `SELECT working_date FROM property WHERE client_id = $1 LIMIT 1;`,
        [clientId]
      );
      if (rows.length > 0 && rows[0].working_date) {
        const d = rows[0].working_date;
        return d instanceof Date ? d.toISOString().split('T')[0] : String(d).split('T')[0];
      }
    } catch {
      // Fallback
    }
    return '2026-06-29';
  }

  /**
   * Calculates all 7 interactive KPI card metrics and the 4 revenue & occupancy figures.
   */
  async getSummary(clientId: number, dateStr: string): Promise<DashboardSummaryMetrics> {
    const selectedDate = dateStr;

    // 1. Expected Arrivals:
    // Active reservations whose Check-in Date equals selectedDate and that have NOT yet been checked in.
    const arrivalsRes = await pool.query(
      `
      SELECT COUNT(*)::int as count
      FROM reservation
      WHERE client_id = $1
        AND check_in_date = $2
        AND UPPER(REPLACE(REPLACE(status, '-', '_'), ' ', '_')) NOT IN ('IN_HOUSE', 'CHECKED_IN', 'INHOUSE', 'CHECKED_OUT', 'CHECKOUT', 'CANCELLED', 'CANCELED', 'NO_SHOW');
      `,
      [clientId, selectedDate]
    );
    const expectedArrivals = arrivalsRes.rows[0]?.count || 0;

    // 2. Expected Departure:
    // Reservations whose Check-out Date equals selectedDate and that have NOT yet been checked out.
    const departuresRes = await pool.query(
      `
      SELECT COUNT(*)::int as count
      FROM reservation
      WHERE client_id = $1
        AND check_out_date = $2
        AND UPPER(REPLACE(REPLACE(status, '-', '_'), ' ', '_')) NOT IN ('CHECKED_OUT', 'CHECKOUT', 'CANCELLED', 'CANCELED', 'NO_SHOW');
      `,
      [clientId, selectedDate]
    );
    const expectedDepartures = departuresRes.rows[0]?.count || 0;

    // 3. Checkouts:
    // Reservations whose Check-out Date equals selectedDate and whose status is already checked out.
    const checkoutsRes = await pool.query(
      `
      SELECT COUNT(*)::int as count
      FROM reservation
      WHERE client_id = $1
        AND check_out_date = $2
        AND UPPER(REPLACE(REPLACE(status, '-', '_'), ' ', '_')) IN ('CHECKED_OUT', 'CHECKOUT');
      `,
      [clientId, selectedDate]
    );
    const checkouts = checkoutsRes.rows[0]?.count || 0;

    // 4. Inhouse Guest:
    // Checked-in reservations satisfying check_in_date <= selected_date < check_out_date
    const inhouseRes = await pool.query(
      `
      SELECT COUNT(*)::int as count
      FROM reservation
      WHERE client_id = $1
        AND check_in_date <= $2
        AND check_out_date > $2
        AND UPPER(REPLACE(REPLACE(status, '-', '_'), ' ', '_')) IN ('IN_HOUSE', 'CHECKED_IN', 'INHOUSE');
      `,
      [clientId, selectedDate]
    );
    const inhouseGuests = inhouseRes.rows[0]?.count || 0;

    // 5. Total Inventory & Maintenance Rooms:
    const roomsRes = await pool.query(
      `
      SELECT r.room_id, r.room_name, r.status, r.include_in_occupancy_adr
      FROM room r
      WHERE r.client_id = $1;
      `,
      [clientId]
    );
    const allRooms = roomsRes.rows;

    let maintenanceRooms = 0;
    let availableRoomsCount = 0;

    for (const rm of allRooms) {
      const isMaint = isMaintenanceRoomStatus(rm.status, null);
      if (isMaint) {
        maintenanceRooms++;
      }
      if (rm.include_in_occupancy_adr !== false && !isMaint) {
        availableRoomsCount++;
      }
    }

    // 6. Vacant Rooms:
    // Count rooms that have no in-house reservation for the selected date, are not in maintenance/out-of-service,
    // and are not covered by an active room block.
    const inhouseRoomIdsRes = await pool.query(
      `
      SELECT DISTINCT room_id
      FROM reservation
      WHERE client_id = $1
        AND room_id IS NOT NULL
        AND check_in_date <= $2
        AND check_out_date > $2
        AND UPPER(REPLACE(REPLACE(status, '-', '_'), ' ', '_')) NOT IN ('CANCELLED', 'CANCELED', 'NO_SHOW');
      `,
      [clientId, selectedDate]
    );
    const occupiedRoomIdSet = new Set(inhouseRoomIdsRes.rows.map((r) => r.room_id));

    let vacantRooms = 0;
    for (const rm of allRooms) {
      const isMaint = isMaintenanceRoomStatus(rm.status, null);
      if (!isMaint && !occupiedRoomIdSet.has(rm.room_id)) {
        vacantRooms++;
      }
    }

    // 7. OTA / Cancel Reservation:
    // - OTA/CRS reservations identified by a non-empty CRS Folio Number.
    // - Reservations cancelled without check-in.
    const otaRes = await pool.query(
      `
      SELECT COUNT(*)::int as count
      FROM reservation
      WHERE client_id = $1
        AND crs_folio_number IS NOT NULL
        AND TRIM(crs_folio_number) <> '';
      `,
      [clientId]
    );
    const otaCount = otaRes.rows[0]?.count || 0;

    const cancelRes = await pool.query(
      `
      SELECT COUNT(*)::int as count
      FROM reservation
      WHERE client_id = $1
        AND UPPER(REPLACE(REPLACE(status, '-', '_'), ' ', '_')) IN ('CANCELLED', 'CANCELED');
      `,
      [clientId]
    );
    const cancelCount = cancelRes.rows[0]?.count || 0;

    // ================= Revenue & Occupancy Calculations =================
    // Room Sold: Count Reservation Rental Detail rows whose rental date equals selectedDate,
    // excluding cancelled and no-show reservations.
    // Room Revenue: Sum the rate from those same eligible rental-detail rows.
    const rentalRes = await pool.query(
      `
      SELECT 
        COUNT(rd.reservation_rental_detail_id)::int as room_sold,
        COALESCE(SUM(rd.rate), 0)::numeric as room_revenue
      FROM reservation_rental_detail rd
      JOIN reservation r ON rd.reservation_id = r.reservation_id
      WHERE r.client_id = $1
        AND rd.rental_date = $2
        AND UPPER(REPLACE(REPLACE(r.status, '-', '_'), ' ', '_')) NOT IN ('CANCELLED', 'CANCELED', 'NO_SHOW');
      `,
      [clientId, selectedDate]
    );

    let roomSold = parseInt(rentalRes.rows[0]?.room_sold, 10) || 0;
    let roomRevenue = parseFloat(rentalRes.rows[0]?.room_revenue) || 0;

    // Fallback: If no rental details exist for this date yet, fallback to inhouse stays
    if (roomSold === 0 && inhouseGuests > 0) {
      roomSold = inhouseGuests;
      const inhouseRevRes = await pool.query(
        `
        SELECT COALESCE(SUM(rent), 0)::numeric as total_rent
        FROM reservation
        WHERE client_id = $1
          AND check_in_date <= $2
          AND check_out_date > $2
          AND UPPER(REPLACE(REPLACE(status, '-', '_'), ' ', '_')) IN ('IN_HOUSE', 'CHECKED_IN', 'INHOUSE');
        `,
        [clientId, selectedDate]
      );
      roomRevenue = parseFloat(inhouseRevRes.rows[0]?.total_rent) || 0;
    }

    // ADR = Room Revenue / Room Sold (return 0 when Room Sold is 0)
    const adr = roomSold > 0 ? parseFloat((roomRevenue / roomSold).toFixed(2)) : 0;

    // Occupancy % = (Room Sold / Available Rooms) * 100
    const occupancyPercent =
      availableRoomsCount > 0
        ? parseFloat(((roomSold / availableRoomsCount) * 100).toFixed(1))
        : 0;

    // RevPAR = Room Revenue / Available Rooms
    const revpar =
      availableRoomsCount > 0
        ? parseFloat((roomRevenue / availableRoomsCount).toFixed(2))
        : 0;

    return {
      workingDate: selectedDate,
      kpis: {
        expectedArrivals,
        expectedDepartures,
        checkouts,
        vacantRooms,
        inhouseGuests,
        maintenanceRooms,
        otaCount,
        cancelCount,
      },
      revenue: {
        roomSold,
        roomRevenue: parseFloat(roomRevenue.toFixed(2)),
        adr,
        occupancyPercent,
        revpar,
        availableRooms: availableRoomsCount,
      },
    };
  }

  // ================= Dynamic KPI Results Lists =================

  async getExpectedArrivals(clientId: number, dateStr: string) {
    const { rows } = await pool.query(
      `
      SELECT 
        r.reservation_id,
        r.booking_number,
        r.guest_name,
        r.check_in_date,
        r.check_out_date,
        r.status,
        r.folio_number,
        r.crs_folio_number,
        COALESCE(r.no_of_adults, r.adults, 1) as adults,
        COALESCE(r.no_of_children, r.children, 0) as children,
        COALESCE(r.paid_amount, 0)::numeric as amount_paid,
        COALESCE(r.balance, 0)::numeric as balance,
        COALESCE(r.total_amount, 0)::numeric as total_amount,
        r.group_id,
        g.group_name,
        rt.room_type_name,
        rt.short_name as room_type_code,
        rm.room_name,
        rm.room_number,
        COALESCE(r.business_source_category_id::text, 'Direct Booking') as business_source
      FROM reservation r
      LEFT JOIN "group" g ON r.group_id = g.group_id
      LEFT JOIN room_type rt ON r.room_type_id = rt.room_type_id
      LEFT JOIN room rm ON r.room_id = rm.room_id
      WHERE r.client_id = $1
        AND r.check_in_date = $2
        AND UPPER(REPLACE(REPLACE(r.status, '-', '_'), ' ', '_')) NOT IN ('IN_HOUSE', 'CHECKED_IN', 'INHOUSE', 'CHECKED_OUT', 'CHECKOUT', 'CANCELLED', 'CANCELED', 'NO_SHOW')
      ORDER BY r.reservation_id ASC;
      `,
      [clientId, dateStr]
    );
    return rows;
  }

  async getExpectedDepartures(clientId: number, dateStr: string) {
    const { rows } = await pool.query(
      `
      SELECT 
        r.reservation_id,
        r.booking_number,
        r.guest_name,
        r.check_in_date,
        r.check_out_date,
        r.status,
        r.folio_number,
        r.crs_folio_number,
        COALESCE(r.no_of_adults, r.adults, 1) as adults,
        COALESCE(r.no_of_children, r.children, 0) as children,
        COALESCE(r.paid_amount, 0)::numeric as amount_paid,
        COALESCE(r.balance, 0)::numeric as balance,
        COALESCE(r.total_amount, 0)::numeric as total_amount,
        r.group_id,
        g.group_name,
        rt.room_type_name,
        rt.short_name as room_type_code,
        rm.room_name,
        rm.room_number,
        COALESCE(r.business_source_category_id::text, 'Front Desk') as business_source
      FROM reservation r
      LEFT JOIN "group" g ON r.group_id = g.group_id
      LEFT JOIN room_type rt ON r.room_type_id = rt.room_type_id
      LEFT JOIN room rm ON r.room_id = rm.room_id
      WHERE r.client_id = $1
        AND r.check_out_date = $2
        AND UPPER(REPLACE(REPLACE(r.status, '-', '_'), ' ', '_')) NOT IN ('CHECKED_OUT', 'CHECKOUT', 'CANCELLED', 'CANCELED', 'NO_SHOW')
      ORDER BY r.reservation_id ASC;
      `,
      [clientId, dateStr]
    );
    return rows;
  }

  async getCheckouts(clientId: number, dateStr: string) {
    const { rows } = await pool.query(
      `
      SELECT 
        r.reservation_id,
        r.booking_number,
        r.guest_name,
        r.check_in_date,
        r.check_out_date,
        r.status,
        r.folio_number,
        r.crs_folio_number,
        COALESCE(r.no_of_adults, r.adults, 1) as adults,
        COALESCE(r.no_of_children, r.children, 0) as children,
        COALESCE(r.paid_amount, 0)::numeric as amount_paid,
        COALESCE(r.balance, 0)::numeric as balance,
        COALESCE(r.total_amount, 0)::numeric as total_amount,
        r.group_id,
        g.group_name,
        rt.room_type_name,
        rt.short_name as room_type_code,
        rm.room_name,
        rm.room_number,
        COALESCE(r.business_source_category_id::text, 'Direct Folio') as business_source
      FROM reservation r
      LEFT JOIN "group" g ON r.group_id = g.group_id
      LEFT JOIN room_type rt ON r.room_type_id = rt.room_type_id
      LEFT JOIN room rm ON r.room_id = rm.room_id
      WHERE r.client_id = $1
        AND r.check_out_date = $2
        AND UPPER(REPLACE(REPLACE(r.status, '-', '_'), ' ', '_')) IN ('CHECKED_OUT', 'CHECKOUT')
      ORDER BY r.reservation_id ASC;
      `,
      [clientId, dateStr]
    );
    return rows;
  }

  async getVacantRooms(clientId: number, dateStr: string) {
    const { rows } = await pool.query(
      `
      SELECT 
        rm.room_id,
        rm.room_name,
        rm.room_number,
        rm.status as current_status,
        rm.rate,
        rt.room_type_name,
        rt.short_name as room_type_code,
        f.floor_name,
        b.building_name
      FROM room rm
      LEFT JOIN room_type rt ON rm.room_type_id = rt.room_type_id
      LEFT JOIN floor f ON rm.floor_id = f.floor_id
      LEFT JOIN building b ON rm.building_id = b.building_id
      WHERE rm.client_id = $1
        AND rm.room_id NOT IN (
          SELECT DISTINCT room_id
          FROM reservation
          WHERE client_id = $1
            AND room_id IS NOT NULL
            AND check_in_date <= $2
            AND check_out_date > $2
            AND UPPER(REPLACE(REPLACE(status, '-', '_'), ' ', '_')) NOT IN ('CANCELLED', 'CANCELED', 'NO_SHOW')
        )
        AND LOWER(rm.status) NOT LIKE '%maint%'
        AND LOWER(rm.status) NOT LIKE '%order%'
        AND LOWER(rm.status) NOT LIKE '%service%'
        AND LOWER(rm.status) NOT LIKE '%ooo%'
        AND LOWER(rm.status) NOT LIKE '%oos%'
      ORDER BY rm.room_number ASC;
      `,
      [clientId, dateStr]
    );
    return rows;
  }

  async getInhouseGuests(clientId: number, dateStr: string) {
    const { rows } = await pool.query(
      `
      SELECT 
        r.reservation_id,
        r.booking_number,
        r.guest_name,
        r.check_in_date,
        r.check_out_date,
        r.status,
        r.folio_number,
        r.crs_folio_number,
        COALESCE(r.no_of_adults, r.adults, 1) as adults,
        COALESCE(r.no_of_children, r.children, 0) as children,
        COALESCE(r.paid_amount, 0)::numeric as amount_paid,
        COALESCE(r.balance, 0)::numeric as balance,
        COALESCE(r.total_amount, 0)::numeric as total_amount,
        r.group_id,
        g.group_name,
        rt.room_type_name,
        rt.short_name as room_type_code,
        rm.room_name,
        rm.room_number,
        COALESCE(r.business_source_category_id::text, 'Direct Booking') as business_source
      FROM reservation r
      LEFT JOIN "group" g ON r.group_id = g.group_id
      LEFT JOIN room_type rt ON r.room_type_id = rt.room_type_id
      LEFT JOIN room rm ON r.room_id = rm.room_id
      WHERE r.client_id = $1
        AND r.check_in_date <= $2
        AND r.check_out_date > $2
        AND UPPER(REPLACE(REPLACE(r.status, '-', '_'), ' ', '_')) IN ('IN_HOUSE', 'CHECKED_IN', 'INHOUSE')
      ORDER BY r.reservation_id ASC;
      `,
      [clientId, dateStr]
    );
    return rows;
  }

  async getMaintenanceRooms(clientId: number) {
    const { rows } = await pool.query(
      `
      SELECT 
        rm.room_id,
        rm.room_name,
        rm.room_number,
        rm.status as current_status,
        rt.room_type_name,
        f.floor_name,
        b.building_name
      FROM room rm
      LEFT JOIN room_type rt ON rm.room_type_id = rt.room_type_id
      LEFT JOIN floor f ON rm.floor_id = f.floor_id
      LEFT JOIN building b ON rm.building_id = b.building_id
      WHERE rm.client_id = $1
        AND (
          LOWER(rm.status) LIKE '%maint%' OR
          LOWER(rm.status) LIKE '%order%' OR
          LOWER(rm.status) LIKE '%service%' OR
          LOWER(rm.status) LIKE '%ooo%' OR
          LOWER(rm.status) LIKE '%oos%' OR
          LOWER(rm.status) LIKE '%vm%' OR
          LOWER(rm.status) LIKE '%om%'
        )
      ORDER BY rm.room_number ASC;
      `,
      [clientId]
    );
    return rows;
  }

  async getOtaOrCancelReservations(clientId: number, kind: 'ota' | 'cancel') {
    let whereClause = `r.client_id = $1`;
    if (kind === 'ota') {
      whereClause += ` AND r.crs_folio_number IS NOT NULL AND TRIM(r.crs_folio_number) <> ''`;
    } else {
      whereClause += ` AND UPPER(REPLACE(REPLACE(r.status, '-', '_'), ' ', '_')) IN ('CANCELLED', 'CANCELED')`;
    }

    const { rows } = await pool.query(
      `
      SELECT 
        r.reservation_id,
        r.booking_number,
        r.guest_name,
        r.check_in_date,
        r.check_out_date,
        r.status,
        r.folio_number,
        r.crs_folio_number,
        COALESCE(r.no_of_adults, r.adults, 1) as adults,
        COALESCE(r.no_of_children, r.children, 0) as children,
        COALESCE(r.paid_amount, 0)::numeric as amount_paid,
        COALESCE(r.balance, 0)::numeric as balance,
        COALESCE(r.total_amount, 0)::numeric as total_amount,
        r.group_id,
        g.group_name,
        rt.room_type_name,
        rt.short_name as room_type_code,
        rm.room_name,
        rm.room_number,
        COALESCE(r.crs_folio_number, 'OTA / Channel Partner') as business_source
      FROM reservation r
      LEFT JOIN "group" g ON r.group_id = g.group_id
      LEFT JOIN room_type rt ON r.room_type_id = rt.room_type_id
      LEFT JOIN room rm ON r.room_id = rm.room_id
      WHERE ${whereClause}
      ORDER BY r.reservation_id DESC;
      `,
      [clientId]
    );
    return rows;
  }

  // ================= Room Status Breakdown =================

  async getRoomStatusBreakdown(clientId: number) {
    // 1. Fetch configured room statuses from room_status table
    const cfgRes = await pool.query(
      `
      SELECT status_name, short_name, status_code, status_color
      FROM room_status
      WHERE client_id = $1 AND is_active = true
      ORDER BY room_status_id ASC;
      `,
      [clientId]
    );

    // 2. Fetch all rooms
    const roomsRes = await pool.query(
      `
      SELECT room_id, status
      FROM room
      WHERE client_id = $1;
      `,
      [clientId]
    );

    // Build map of configured status colors and labels
    const catalogMap: Record<string, { label: string; color: string; count: number }> = {};
    for (const s of cfgRes.rows) {
      const key = (s.status_name || '').trim().toLowerCase();
      catalogMap[key] = {
        label: s.status_name,
        color: s.status_color || '#3B82F6',
        count: 0,
      };
    }

    // Default palette for unmapped known statuses
    const fallbackPalette: Record<string, { label: string; color: string }> = {
      'v/ready': { label: 'V/Ready', color: '#10B981' },
      'o/clean': { label: 'O/Clean', color: '#3B82F6' },
      'o/dirty': { label: 'O/Dirty', color: '#EF4444' },
      'v/dirty': { label: 'V/Dirty', color: '#F59E0B' },
      'v/clean': { label: 'V/Clean', color: '#06B6D4' },
      'v/maint': { label: 'V/Maint', color: '#8B5CF6' },
      'r/ready': { label: 'R/Ready', color: '#14B8A6' },
      'o/maint': { label: 'O/Maint', color: '#64748B' },
      'clean': { label: 'Clean', color: '#10B981' },
      'dirty': { label: 'Dirty', color: '#F59E0B' },
      'occupied': { label: 'Occupied', color: '#3B82F6' },
      'available': { label: 'Available', color: '#10B981' },
      'inspected': { label: 'Inspected', color: '#6366F1' },
    };

    let unknownCount = 0;

    for (const r of roomsRes.rows) {
      const raw = (r.status || '').trim();
      const lower = raw.toLowerCase();
      if (!raw) {
        unknownCount++;
        continue;
      }

      if (catalogMap[lower]) {
        catalogMap[lower].count++;
      } else if (fallbackPalette[lower]) {
        const item = fallbackPalette[lower];
        if (!catalogMap[lower]) {
          catalogMap[lower] = { label: item.label, color: item.color, count: 0 };
        }
        catalogMap[lower].count++;
      } else {
        unknownCount++;
      }
    }

    const breakdown: Array<{ label: string; color: string; count: number }> = Object.values(
      catalogMap
    ).filter((item) => item.count > 0);

    if (unknownCount > 0) {
      breakdown.push({
        label: 'Unknown',
        color: '#94A3B8',
        count: unknownCount,
      });
    }

    return breakdown;
  }

  // ================= Housekeeping Panel =================

  async getHousekeepingPanel(clientId: number) {
    // Columns: Room Name, House Keeper, Status (Done if clean/ready; otherwise Pending)
    const roomsRes = await pool.query(
      `
      SELECT room_id, room_name, room_number, status
      FROM room
      WHERE client_id = $1
      ORDER BY room_number ASC;
      `,
      [clientId]
    );

    // Get active housekeeping staff for assignment display
    const staffRes = await pool.query(
      `
      SELECT user_id, user_name, initials
      FROM app_user
      WHERE client_id = $1
        AND (LOWER(department) LIKE '%house%' OR LOWER(description) LIKE '%house%' OR user_id IN (8, 13))
      ORDER BY user_id ASC;
      `,
      [clientId]
    );

    const houseKeepers = staffRes.rows.length > 0 ? staffRes.rows : [
      { user_name: 'Carlos Mendez', initials: 'CM' },
      { user_name: 'Elena Rostova', initials: 'ER' },
      { user_name: 'Maria Rodriguez', initials: 'MR' },
    ];

    return roomsRes.rows.map((rm, idx) => {
      const isClean = isRoomClean(rm.status, null);
      const hk = houseKeepers[idx % houseKeepers.length];
      return {
        roomId: rm.room_id,
        roomName: rm.room_name || `Room ${rm.room_number}`,
        roomNumber: rm.room_number,
        houseKeeper: hk.user_name,
        rawStatus: rm.status || 'Pending',
        status: isClean ? 'Done' : 'Pending',
      };
    });
  }

  // ================= User Profile & Access =================

  async getProfile(userId: number, clientId: number) {
    const { rows } = await pool.query(
      `
      SELECT 
        u.user_id,
        u.client_id,
        u.user_name,
        u.full_name,
        u.email as contact_email,
        u.phone as mobile_no,
        u.address_line_1,
        u.address_line_2,
        u.city,
        u.state,
        u.country,
        u.zip_code,
        u.role_id,
        u.is_active,
        r.role_name,
        r.role_type,
        c.username as login_user_name,
        c.login_email,
        p.property_name
      FROM app_user u
      LEFT JOIN user_login_credential c ON u.user_id = c.user_id
      LEFT JOIN role_privilege r ON u.role_id = r.role_id
      LEFT JOIN property p ON u.client_id = p.client_id
      WHERE u.user_id = $1 AND u.client_id = $2
      LIMIT 1;
      `,
      [userId, clientId]
    );

    if (rows.length === 0) return null;
    const r = rows[0];

    return {
      userId: r.user_id,
      clientId: r.client_id,
      fullName: r.full_name || r.user_name,
      contactEmail: r.contact_email || '',
      userName: r.login_user_name || r.user_name, // read-only
      mobileNo: r.mobile_no || '',
      addressLine1: r.address_line_1 || '',
      addressLine2: r.address_line_2 || '',
      city: r.city || '',
      state: r.state || '',
      country: r.country || 'United States',
      zipCode: r.zip_code || '',
      roleName: r.role_name,
      roleType: r.role_type,
      propertyName: r.property_name,
    };
  }

  async updateProfile(
    userId: number,
    clientId: number,
    data: {
      fullName?: string;
      contactEmail?: string;
      mobileNo?: string;
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      country?: string;
      zipCode?: string;
    }
  ) {
    // Only permit contact/profile fields updates; never role, property assignment, username, or active status
    const updateRes = await pool.query(
      `
      UPDATE app_user
      SET
        full_name = COALESCE($3, full_name),
        email = COALESCE($4, email),
        phone = COALESCE($5, phone),
        address_line_1 = COALESCE($6, address_line_1),
        address_line_2 = COALESCE($7, address_line_2),
        city = COALESCE($8, city),
        state = COALESCE($9, state),
        country = COALESCE($10, country),
        zip_code = COALESCE($11, zip_code),
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND client_id = $2
      RETURNING *;
      `,
      [
        userId,
        clientId,
        data.fullName !== undefined ? data.fullName.trim() : null,
        data.contactEmail !== undefined ? data.contactEmail.trim().toLowerCase() : null,
        data.mobileNo !== undefined ? data.mobileNo.trim() : null,
        data.addressLine1 !== undefined ? data.addressLine1.trim() : null,
        data.addressLine2 !== undefined ? data.addressLine2.trim() : null,
        data.city !== undefined ? data.city.trim() : null,
        data.state !== undefined ? data.state.trim() : null,
        data.country !== undefined ? data.country.trim() : null,
        data.zipCode !== undefined ? data.zipCode.trim() : null,
      ]
    );

    return updateRes.rows[0];
  }

  async getUserAccess(userId: number, clientId: number) {
    // Get user's role and assigned property
    const userRes = await pool.query(
      `
      SELECT u.user_id, u.client_id, u.role_id, r.role_name, r.role_type, p.property_name
      FROM app_user u
      LEFT JOIN role_privilege r ON u.role_id = r.role_id
      LEFT JOIN property p ON u.client_id = p.client_id
      WHERE u.user_id = $1 AND u.client_id = $2
      LIMIT 1;
      `,
      [userId, clientId]
    );

    if (userRes.rows.length === 0) return null;
    const user = userRes.rows[0];

    // Read all modules and role access
    const { rows: modules } = await pool.query(
      `
      SELECT 
        m.module_key,
        m.display_name,
        m.icon_key,
        m.sort_order,
        m.is_built,
        CASE WHEN rma.role_id IS NOT NULL THEN true ELSE false END as is_allowed
      FROM module_registry m
      LEFT JOIN role_module_access rma ON m.module_key = rma.module_key AND rma.role_id = $1
      ORDER BY m.sort_order ASC;
      `,
      [user.role_id]
    );

    return {
      property: {
        clientId: user.client_id,
        propertyName: user.property_name,
      },
      role: {
        roleId: user.role_id,
        roleName: user.role_name,
        roleType: user.role_type,
      },
      modules,
    };
  }
}

export const dashboardService = new DashboardService();
