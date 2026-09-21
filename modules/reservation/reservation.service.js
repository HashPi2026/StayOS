import { pool } from '../../db/pool.js';
import { AppError, ConflictError, NotFoundError, ValidationError } from '../../utils/errors.js';

export function parseSafeIsoDate(val, defaultVal = null) {
  if (!val) return defaultVal;
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return defaultVal;
    return val.toISOString().split('T')[0];
  }
  if (typeof val !== 'string') return defaultVal;
  const str = val.trim();
  if (!str) return defaultVal;

  const ymdMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (ymdMatch) {
    const [, y, m, d] = ymdMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }
  return defaultVal;
}

export class ReservationService {
  /**
   * Recalculates denormalized financial rollups on the reservation record.
   * Total Rent / Tax / Total Rental = SUM from reservation_rental_detail
   * Other Charges = SUM(total) from reservation_other_charge
   * Total Charges = Total Rental + Other Charges - Discount
   * Payments = SUM(total) from reservation_payment where authorize = false
   * CC Authorized = SUM(total) from reservation_payment where authorize = true
   * Balance = Total Charges - Payments - Deposit
   */
  async recalculateRollups(clientOrPool, reservationId) {
    const db = clientOrPool || pool;

    // 1. Rental Details sum
    const { rows: rentRows } = await db.query(
      `SELECT 
        COALESCE(SUM(rate), 0) as total_rent,
        COALESCE(SUM(total_tax), 0) as tax,
        COALESCE(SUM(total_amount), 0) as total_rental
       FROM reservation_rental_detail
       WHERE reservation_id = $1`,
      [reservationId]
    );
    const totalRent = parseFloat(rentRows[0]?.total_rent || 0);
    const tax = parseFloat(rentRows[0]?.tax || 0);
    const totalRental = parseFloat(rentRows[0]?.total_rental || 0);

    // 2. Other Charges sum
    const { rows: ocRows } = await db.query(
      `SELECT COALESCE(SUM(total), 0) as other_charges
       FROM reservation_other_charge
       WHERE reservation_id = $1`,
      [reservationId]
    );
    const otherCharges = parseFloat(ocRows[0]?.other_charges || 0);

    // 3. Payments and Pre-auth holds
    const { rows: payRows } = await db.query(
      `SELECT 
        COALESCE(SUM(CASE WHEN authorize = false THEN total ELSE 0 END), 0) as captured_payments,
        COALESCE(SUM(CASE WHEN authorize = true THEN total ELSE 0 END), 0) as cc_authorized
       FROM reservation_payment
       WHERE reservation_id = $1`,
      [reservationId]
    );
    const payments = parseFloat(payRows[0]?.captured_payments || 0);
    const ccAuthorized = parseFloat(payRows[0]?.cc_authorized || 0);

    // 4. Retrieve current discount and deposit from reservation
    const { rows: currentRes } = await db.query(
      `SELECT discount, deposit FROM reservation WHERE reservation_id = $1`,
      [reservationId]
    );
    const discount = parseFloat(currentRes[0]?.discount || 0);
    const deposit = parseFloat(currentRes[0]?.deposit || 0);

    const totalCharges = Math.max(0, totalRental + otherCharges - discount);
    const balance = totalCharges - payments - deposit;

    // 5. Update reservation record with exact rollups
    const { rows: updated } = await db.query(
      `UPDATE reservation SET
        total_rent = $1,
        tax = $2,
        total_rental = $3,
        other_charges = $4,
        total_charges = $5,
        payments = $6,
        cc_authorized = $7,
        balance = $8,
        total_amount = $5,
        paid_amount = $6,
        updated_at = CURRENT_TIMESTAMP
       WHERE reservation_id = $9
       RETURNING *`,
      [totalRent, tax, totalRental, otherCharges, totalCharges, payments, ccAuthorized, balance, reservationId]
    );

    return updated[0];
  }

  /**
   * Validates room availability and rate/restriction constraints
   */
  async checkRoomAvailabilityAndRestrictions(clientId, { roomId, roomTypeId, checkInDate, checkOutDate, excludeReservationId = null }) {
    // 1. Room overlapping reservation check
    if (roomId) {
      let overlapQuery = `
        SELECT reservation_id, folio_number, booking_number, status, check_in_date, check_out_date
        FROM reservation
        WHERE client_id = $1
          AND room_id = $2
          AND status NOT IN ('Cancelled', 'No-Show')
          AND check_in_date < $3
          AND check_out_date > $4
      `;
      const overlapParams = [clientId, roomId, checkOutDate, checkInDate];
      if (excludeReservationId) {
        overlapParams.push(excludeReservationId);
        overlapQuery += ` AND reservation_id != $5`;
      }

      const { rows: overlaps } = await pool.query(overlapQuery, overlapParams);
      if (overlaps.length > 0) {
        throw new ConflictError(
          `Room ${roomId} is already occupied or reserved between ${checkInDate} and ${checkOutDate} by reservation #${overlaps[0].folio_number || overlaps[0].booking_number} (${overlaps[0].status}).`,
          { conflict: overlaps[0] }
        );
      }
    }

    // 2. Room Type restrictions check (Stop sell, Close to arrival, Close to departure, Min/Max nights)
    if (roomTypeId) {
      const { rows: restrictions } = await pool.query(
        `SELECT restriction_date, is_closed, min_stay_through, max_stay_through, close_to_arrival, close_to_departure
         FROM room_type_restriction
         WHERE client_id = $1
           AND room_type_id = $2
           AND restriction_date >= $3
           AND restriction_date < $4`,
        [clientId, roomTypeId, checkInDate, checkOutDate]
      );

      const inDate = new Date(checkInDate);
      const outDate = new Date(checkOutDate);
      const stayNights = Math.max(1, Math.round((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24)));

      for (const r of restrictions) {
        const rDateStr = r.restriction_date instanceof Date ? r.restriction_date.toISOString().split('T')[0] : String(r.restriction_date);
        if (r.is_closed) {
          throw new ConflictError(`Sold out / Stop-sell in effect for room type on ${rDateStr}.`, { date: rDateStr, restriction: 'CLOSED' });
        }
        if (r.close_to_arrival && rDateStr === checkInDate) {
          throw new ConflictError(`Close To Arrival (CTA) restriction in effect on check-in date ${checkInDate}.`, { date: checkInDate, restriction: 'CTA' });
        }
        if (r.close_to_departure && rDateStr === checkOutDate) {
          throw new ConflictError(`Close To Departure (CTD) restriction in effect on check-out date ${checkOutDate}.`, { date: checkOutDate, restriction: 'CTD' });
        }
        if (r.min_stay_through && stayNights < r.min_stay_through) {
          throw new ConflictError(`Minimum stay requirement of ${r.min_stay_through} nights not met (requested ${stayNights} nights).`, { minNights: r.min_stay_through, stayNights });
        }
        if (r.max_stay_through && stayNights > r.max_stay_through) {
          throw new ConflictError(`Maximum stay limit of ${r.max_stay_through} nights exceeded (requested ${stayNights} nights).`, { maxNights: r.max_stay_through, stayNights });
        }
      }
    }
  }

  /**
   * List reservations with filtering and rich associations
   */
  async listReservations(clientId, filters = {}) {
    const {
      group_id,
      status,
      check_in_date,
      check_out_date,
      room_id,
      room_type_id,
      search,
      limit = 50,
      offset = 0
    } = filters;

    const params = [clientId];
    let query = `
      SELECT 
        r.*,
        p.property_name,
        rt.room_type_name,
        rm.room_number as live_room_number,
        b.building_name,
        fl.floor_name,
        rtp.rate_type_name,
        g.group_name,
        -- Primary guest resolution
        (
          SELECT json_build_object(
            'guest_id', gst.guest_id,
            'full_name', CONCAT(gst.first_name, ' ', gst.last_name),
            'first_name', gst.first_name,
            'last_name', gst.last_name,
            'email', (SELECT email_address FROM guest_contact gc WHERE gc.guest_id = gst.guest_id ORDER BY is_primary DESC LIMIT 1),
            'phone', (SELECT phone_number FROM guest_contact gc WHERE gc.guest_id = gst.guest_id ORDER BY is_primary DESC LIMIT 1),
            'vip_tier', gst.vip_tier,
            'dnr_status', gst.dnr_status,
            'dnr_reason', gst.dnr_reason
          )
          FROM reservation_guest rg
          JOIN guest gst ON gst.guest_id = rg.guest_id
          WHERE rg.reservation_id = r.reservation_id AND rg.is_primary = true
          LIMIT 1
        ) as primary_guest,
        (SELECT COUNT(*)::int FROM reservation_guest WHERE reservation_id = r.reservation_id) as guest_count,
        (SELECT COUNT(*)::int FROM reservation_other_charge WHERE reservation_id = r.reservation_id) as other_charge_count,
        (SELECT COUNT(*)::int FROM reservation_payment WHERE reservation_id = r.reservation_id) as payment_count,
        (SELECT COUNT(*)::int FROM reservation_vehicle WHERE reservation_id = r.reservation_id) as vehicle_count
      FROM reservation r
      LEFT JOIN property p ON p.client_id = r.client_id
      LEFT JOIN room_type rt ON rt.room_type_id = r.room_type_id
      LEFT JOIN room rm ON rm.room_id = r.room_id
      LEFT JOIN building b ON b.building_id = r.building_id
      LEFT JOIN floor fl ON fl.floor_id = r.floor_id
      LEFT JOIN rate_type rtp ON rtp.rate_type_id = r.rate_type_id
      LEFT JOIN "group" g ON g.group_id = r.group_id
      WHERE r.client_id = $1
    `;

    if (group_id) {
      params.push(Number(group_id));
      query += ` AND r.group_id = $${params.length}`;
    }

    if (status && status !== 'ALL') {
      params.push(status);
      query += ` AND r.status ILIKE $${params.length}`;
    }

    if (check_in_date) {
      const parsedIn = parseSafeIsoDate(check_in_date);
      if (parsedIn) {
        params.push(parsedIn);
        query += ` AND r.check_in_date >= $${params.length}`;
      }
    }

    if (check_out_date) {
      const parsedOut = parseSafeIsoDate(check_out_date);
      if (parsedOut) {
        params.push(parsedOut);
        query += ` AND r.check_out_date <= $${params.length}`;
      }
    }

    if (room_id) {
      params.push(Number(room_id));
      query += ` AND r.room_id = $${params.length}`;
    }

    if (room_type_id) {
      params.push(Number(room_type_id));
      query += ` AND r.room_type_id = $${params.length}`;
    }

    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      query += ` AND (
        r.folio_number ILIKE $${params.length} OR
        r.booking_number ILIKE $${params.length} OR
        r.guest_name ILIKE $${params.length} OR
        r.guest_email ILIKE $${params.length} OR
        r.guest_phone ILIKE $${params.length} OR
        rm.room_number ILIKE $${params.length} OR
        g.group_name ILIKE $${params.length}
      )`;
    }

    query += ` ORDER BY r.reservation_id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Math.min(100, Math.max(1, Number(limit))), Math.max(0, Number(offset)));

    const { rows } = await pool.query(query, params);
    return rows;
  }

  /**
   * Get complete single reservation with all associated records
   */
  async getReservationById(clientId, id) {
    const { rows } = await pool.query(
      `SELECT 
        r.*,
        p.property_name,
        rt.room_type_name,
        rm.room_number as live_room_number,
        b.building_name,
        fl.floor_name,
        rtp.rate_type_name,
        g.group_name
      FROM reservation r
      LEFT JOIN property p ON p.client_id = r.client_id
      LEFT JOIN room_type rt ON rt.room_type_id = r.room_type_id
      LEFT JOIN room rm ON rm.room_id = r.room_id
      LEFT JOIN building b ON b.building_id = r.building_id
      LEFT JOIN floor fl ON fl.floor_id = r.floor_id
      LEFT JOIN rate_type rtp ON rtp.rate_type_id = r.rate_type_id
      LEFT JOIN "group" g ON g.group_id = r.group_id
      WHERE r.reservation_id = $1 AND r.client_id = $2`,
      [id, clientId]
    );

    if (rows.length === 0) {
      throw new NotFoundError('Reservation', id);
    }
    const reservation = rows[0];

    // Fetch related child tables in parallel
    const [guestsRes, rentalsRes, otherChargesRes, paymentsRes, vehiclesRes] = await Promise.all([
      pool.query(
        `SELECT rg.*, 
                CONCAT(g.first_name, ' ', g.last_name) as full_name, 
                g.first_name, g.last_name, 
                (SELECT email_address FROM guest_contact gc WHERE gc.guest_id = g.guest_id ORDER BY is_primary DESC LIMIT 1) as email,
                (SELECT phone_number FROM guest_contact gc WHERE gc.guest_id = g.guest_id ORDER BY is_primary DESC LIMIT 1) as mobile_number,
                g.vip_tier, g.dnr_status, g.dnr_reason
         FROM reservation_guest rg
         JOIN guest g ON g.guest_id = rg.guest_id
         WHERE rg.reservation_id = $1
         ORDER BY rg.is_primary DESC, rg.reservation_guest_id ASC`,
        [id]
      ),
      pool.query(
        `SELECT rrd.*, rt.rate_type_name
         FROM reservation_rental_detail rrd
         LEFT JOIN rate_type rt ON rt.rate_type_id = rrd.rate_type_id
         WHERE rrd.reservation_id = $1
         ORDER BY rrd.rental_date ASC`,
        [id]
      ),
      pool.query(
        `SELECT roc.*, 
                COALESCE(occ.category_name, occ.short_name) as occ_name, 
                COALESCE(oc.charge_name, oc.short_name) as oc_name, 
                u.user_name as desk_user_name
         FROM reservation_other_charge roc
         LEFT JOIN other_charges_category occ ON occ.occ_id = roc.occ_id
         LEFT JOIN other_charges oc ON oc.oc_id = roc.oc_id
         LEFT JOIN app_user u ON u.user_id = roc.desk_user_id
         WHERE roc.reservation_id = $1
         ORDER BY roc.charge_date ASC, roc.reservation_other_charge_id ASC`,
        [id]
      ),
      pool.query(
        `SELECT rp.*, pt.payment_type_name, u.user_name as desk_user_name
         FROM reservation_payment rp
         LEFT JOIN payment_type pt ON pt.payment_type_id = rp.payment_type_id
         LEFT JOIN app_user u ON u.user_id = rp.desk_user_id
         WHERE rp.reservation_id = $1
         ORDER BY rp.payment_date ASC, rp.reservation_payment_id ASC`,
        [id]
      ),
      pool.query(
        `SELECT * FROM reservation_vehicle WHERE reservation_id = $1 ORDER BY reservation_vehicle_id ASC`,
        [id]
      )
    ]);

    reservation.guests = guestsRes.rows;
    reservation.primary_guest = guestsRes.rows.find(g => g.is_primary) || guestsRes.rows[0] || null;
    reservation.rental_details = rentalsRes.rows;
    reservation.other_charges_list = otherChargesRes.rows;
    reservation.payments_list = paymentsRes.rows;
    reservation.vehicles = vehiclesRes.rows;

    // Check if any attached guest has DNR
    const dnrGuest = guestsRes.rows.find(g => g.dnr_status && g.dnr_status !== 'No');
    if (dnrGuest) {
      reservation.dnr_warning = {
        has_warning: true,
        guest_id: dnrGuest.guest_id,
        guest_name: dnrGuest.full_name,
        dnr_status: dnrGuest.dnr_status,
        dnr_reason: dnrGuest.dnr_reason
      };
    }

    return reservation;
  }

  /**
   * Create a new reservation with automatic rental details & guest attachment
   */
  async createReservation(clientId, data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const checkInDate = parseSafeIsoDate(data.check_in_date);
      const checkOutDate = parseSafeIsoDate(data.check_out_date);

      if (!checkInDate || !checkOutDate) {
        throw new ValidationError('Valid check_in_date and check_out_date are required (YYYY-MM-DD).');
      }

      if (new Date(checkOutDate) <= new Date(checkInDate)) {
        throw new ValidationError('Check-out date must be strictly after check-in date.');
      }

      const inDateObj = new Date(checkInDate);
      const outDateObj = new Date(checkOutDate);
      const noOfDays = Math.max(1, Math.round((outDateObj.getTime() - inDateObj.getTime()) / (1000 * 60 * 60 * 24)));

      // Verify availability & restrictions
      await this.checkRoomAvailabilityAndRestrictions(clientId, {
        roomId: data.room_id ? Number(data.room_id) : null,
        roomTypeId: data.room_type_id ? Number(data.room_type_id) : null,
        checkInDate,
        checkOutDate
      });

      // Generate Folio & Booking number
      const bookingNumber = data.booking_number || `BK-${clientId}-${Math.floor(10000 + Math.random() * 90000)}`;
      const folioNumber = data.folio_number || `FOL-${clientId}-${Math.floor(10000 + Math.random() * 90000)}`;

      // Resolve Room & Building & Floor details
      let buildingId = data.building_id ? Number(data.building_id) : null;
      let floorId = data.floor_id ? Number(data.floor_id) : null;
      let roomTypeId = data.room_type_id ? Number(data.room_type_id) : null;
      let roomNumber = data.room_number || null;

      if (data.room_id) {
        const { rows: rmRows } = await client.query(
          `SELECT room_id, room_number, room_type_id, building_id, floor_id FROM room WHERE room_id = $1 AND client_id = $2`,
          [Number(data.room_id), clientId]
        );
        if (rmRows.length > 0) {
          const rm = rmRows[0];
          roomNumber = rm.room_number;
          if (!roomTypeId) roomTypeId = rm.room_type_id;
          if (!buildingId) buildingId = rm.building_id;
          if (!floorId) floorId = rm.floor_id;
        }
      }

      // Default rate type if missing
      let rateTypeId = data.rate_type_id ? Number(data.rate_type_id) : null;
      if (!rateTypeId) {
        const { rows: rtRows } = await client.query(
          `SELECT rate_type_id FROM rate_type WHERE client_id = $1 ORDER BY rate_type_id ASC LIMIT 1`,
          [clientId]
        );
        if (rtRows.length > 0) {
          rateTypeId = rtRows[0].rate_type_id;
        }
      }

      const guestName = (data.guest_name || data.guestName || (data.guest ? `${data.guest.first_name || ''} ${data.guest.last_name || ''}`.trim() : '') || 'Guest').trim();
      const guestEmail = data.guest_email || data.guestEmail || data.guest?.email || null;
      const guestPhone = data.guest_phone || data.guestPhone || data.guest?.phone || data.guest?.mobile_number || null;

      const baseRent = parseFloat(data.rent || data.rate || 180);
      const taxRate = 0.12; // 12% occupancy tax

      // 1. Insert Master Reservation
      const insertResQuery = `
        INSERT INTO reservation (
          client_id, group_id, folio_number, booking_number, reservation_date,
          crs_folio_number, revenue_posted, non_refundable, prepaid,
          check_in_date, check_in_time, check_out_date, check_out_time, no_of_days,
          business_source_category_id, building_id, floor_id, room_type_id, room_id, room_number,
          no_of_adults, no_of_children, status, rate_type_id,
          rent, total_rent, tax, total_rental, other_charges, discount,
          total_charges, payments, cc_authorized, deposit, balance,
          turndown_service_enabled, turndown_time, turndown_remark,
          guest_name, guest_email, guest_phone, special_requests, created_by_name
        ) VALUES (
          $1, $2, $3, $4, CURRENT_DATE,
          $5, $6, $7, $8,
          $9, $10, $11, $12, $13,
          $14, $15, $16, $17, $18, $19,
          $20, $21, $22, $23,
          $24, 0, 0, 0, 0, $25,
          0, 0, 0, $26, 0,
          $27, $28, $29,
          $30, $31, $32, $33, $34
        )
        RETURNING *;
      `;

      const resValues = [
        clientId,
        data.group_id ? Number(data.group_id) : null,
        folioNumber,
        bookingNumber,
        data.crs_folio_number || null,
        Boolean(data.revenue_posted ?? false),
        Boolean(data.non_refundable ?? false),
        Boolean(data.prepaid ?? false),
        checkInDate,
        data.check_in_time || '14:00:00',
        checkOutDate,
        data.check_out_time || '11:00:00',
        noOfDays,
        data.business_source_category_id ? Number(data.business_source_category_id) : null,
        buildingId,
        floorId,
        roomTypeId,
        data.room_id ? Number(data.room_id) : null,
        roomNumber,
        Number(data.no_of_adults || data.adults || 1),
        Number(data.no_of_children || data.children || 0),
        data.status || 'Confirmed',
        rateTypeId,
        baseRent,
        parseFloat(data.discount || 0),
        parseFloat(data.deposit || 0),
        Boolean(data.turndown_service_enabled ?? false),
        data.turndown_time || null,
        data.turndown_remark || null,
        guestName,
        guestEmail,
        guestPhone,
        data.special_requests || null,
        data.created_by_name || 'Front Desk Staff'
      ];

      const { rows: resRows } = await client.query(insertResQuery, resValues);
      const newReservation = resRows[0];
      const resId = newReservation.reservation_id;

      // 2. Auto-generate Night-by-Night Rental Details
      const curr = new Date(inDateObj);
      while (curr < outDateObj) {
        const nightDateStr = curr.toISOString().split('T')[0];
        const nightRate = baseRent;
        const occTax = parseFloat((nightRate * taxRate).toFixed(2));
        const totalAmount = parseFloat((nightRate + occTax).toFixed(2));

        await client.query(
          `INSERT INTO reservation_rental_detail (
            reservation_id, rental_date, rate_type_id, rate, occ_tax, per_day, per_stay, total_tax, total_amount, disp_folio
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)`,
          [resId, nightDateStr, rateTypeId, nightRate, occTax, 0, 0, occTax, totalAmount]
        );

        curr.setDate(curr.getDate() + 1);
      }

      // 3. Attach Primary Guest
      let guestId = data.guest_id ? Number(data.guest_id) : null;
      if (!guestId && data.guest && (data.guest.first_name || data.guest.full_name)) {
        // Create guest inline
        const rawName = (data.guest.full_name || `${data.guest.first_name || ''} ${data.guest.last_name || ''}`).trim();
        const fName = data.guest.first_name || rawName.split(' ')[0] || 'Guest';
        const lName = data.guest.last_name || rawName.split(' ').slice(1).join(' ') || '';
        const { rows: newG } = await client.query(
          `INSERT INTO guest (client_id, first_name, last_name, vip_tier, dnr_status)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING guest_id`,
          [
            clientId,
            fName,
            lName,
            data.guest.vip_tier || 'STANDARD',
            data.guest.dnr_status || 'No'
          ]
        );
        guestId = newG[0].guest_id;
        const gEmail = data.guest.email || null;
        const gPhone = data.guest.mobile_number || data.guest.phone || null;
        if (gEmail || gPhone) {
          await client.query(
            `INSERT INTO guest_contact (guest_id, contact_type, is_primary, phone_number, email_address)
             VALUES ($1, 'Mobile', true, $2, $3)`,
            [guestId, gPhone, gEmail]
          );
        }
      }

      if (guestId) {
        await client.query(
          `INSERT INTO reservation_guest (reservation_id, guest_id, is_primary)
           VALUES ($1, $2, true)`,
          [resId, guestId]
        );
      }

      // 4. Attach Shared Guests if provided
      if (Array.isArray(data.shared_guests)) {
        for (const sg of data.shared_guests) {
          if (sg.guest_id && Number(sg.guest_id) !== guestId) {
            await client.query(
              `INSERT INTO reservation_guest (reservation_id, guest_id, is_primary)
               VALUES ($1, $2, false)`,
              [resId, Number(sg.guest_id)]
            );
          }
        }
      }

      // 5. Attach Vehicles if provided
      if (Array.isArray(data.vehicles)) {
        for (const v of data.vehicles) {
          if (v.license || v.vehicle_make) {
            await client.query(
              `INSERT INTO reservation_vehicle (reservation_id, vehicle_make, vehicle_model, vehicle_year, license, state)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [resId, v.vehicle_make || null, v.vehicle_model || null, v.vehicle_year || null, v.license || null, v.state || null]
            );
          }
        }
      }

      // 6. Attach initial Other Charges if provided
      if (Array.isArray(data.other_charges_items)) {
        for (const oc of data.other_charges_items) {
          const rate = parseFloat(oc.rate || 0);
          const qty = parseInt(oc.qty || 1, 10);
          const tax = parseFloat(oc.tax || 0);
          const total = parseFloat((rate * qty + tax).toFixed(2));
          await client.query(
            `INSERT INTO reservation_other_charge (
              reservation_id, occ_id, oc_id, charge_date, reoccur, disp_on_folio, rate, qty, tax, total, voucher_number, remark, desk_user_id
             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
            [
              resId,
              Number(oc.occ_id || 41),
              Number(oc.oc_id || 73),
              parseSafeIsoDate(oc.charge_date, checkInDate),
              Boolean(oc.reoccur ?? false),
              Boolean(oc.disp_on_folio ?? true),
              rate,
              qty,
              tax,
              total,
              oc.voucher_number || null,
              oc.remark || null,
              oc.desk_user_id ? Number(oc.desk_user_id) : null
            ]
          );
        }
      }

      // 7. Attach initial Payment if provided
      if (data.payment && (data.payment.amount > 0 || data.payment.authorize)) {
        const p = data.payment;
        const amt = parseFloat(p.amount || 0);
        const exRate = parseFloat(p.exchange_rate || 1);
        const total = parseFloat((amt * exRate).toFixed(2));
        await client.query(
          `INSERT INTO reservation_payment (
            reservation_id, payment_type_id, payer_type, business_source_id, terminal,
            card_number, card_type, valid_till, authorize, auth_number, payment_date,
            receipt_number, disp_on_folio, amount, exchange_rate, total, remark, desk_user_id
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_DATE, $11, $12, $13, $14, $15, $16, $17)`,
          [
            resId,
            Number(p.payment_type_id || 10),
            p.payer_type || 'Room/Guest',
            p.business_source_id ? Number(p.business_source_id) : null,
            p.terminal || null,
            p.card_number ? p.card_number.replace(/\s+/g, '').slice(-4).padStart(16, '*') : null,
            p.card_type || 'VISA',
            parseSafeIsoDate(p.valid_till, '2028-12-31'),
            Boolean(p.authorize ?? false),
            p.auth_number || (p.authorize ? `AUTH-${Math.floor(100000 + Math.random() * 900000)}` : null),
            p.receipt_number || `REC-${Math.floor(10000 + Math.random() * 90000)}`,
            Boolean(p.disp_on_folio ?? true),
            amt,
            exRate,
            total,
            p.remark || null,
            p.desk_user_id ? Number(p.desk_user_id) : null
          ]
        );
      }

      // 8. Recalculate Financial Rollups
      await this.recalculateRollups(client, resId);

      // 9. Write audit log entry
      await client.query(
        `INSERT INTO reservation_log (
          client_id, reservation_id, booking_number, guest_name, action_type, action_title, action_details,
          performed_by_name, performed_by_role, created_at
         ) VALUES ($1, $2, $3, $4, 'RESERVATION_CREATED', $5, $6, $7, $8, CURRENT_TIMESTAMP)`,
        [
          clientId,
          resId,
          bookingNumber,
          guestName,
          'Reservation Created',
          `Created folio ${folioNumber} for ${guestName}`,
          data.created_by_name || 'Front Desk Staff',
          data.created_by_role || 'Front Desk Associate'
        ]
      );

      await client.query('COMMIT');
      client.release();

      return await this.getReservationById(clientId, resId);
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      client.release();
      throw err;
    }
  }

  /**
   * Update an existing reservation
   */
  async updateReservation(clientId, id, data) {
    const existing = await this.getReservationById(clientId, id);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const checkInDate = data.check_in_date ? parseSafeIsoDate(data.check_in_date) : existing.check_in_date;
      const checkOutDate = data.check_out_date ? parseSafeIsoDate(data.check_out_date) : existing.check_out_date;

      if (new Date(checkOutDate) <= new Date(checkInDate)) {
        throw new ValidationError('Check-out date must be strictly after check-in date.');
      }

      const roomId = data.room_id !== undefined ? (data.room_id ? Number(data.room_id) : null) : existing.room_id;
      const roomTypeId = data.room_type_id !== undefined ? (data.room_type_id ? Number(data.room_type_id) : null) : existing.room_type_id;

      // Recheck availability & restrictions if dates or room changed
      if (checkInDate !== existing.check_in_date || checkOutDate !== existing.check_out_date || roomId !== existing.room_id) {
        await this.checkRoomAvailabilityAndRestrictions(clientId, {
          roomId,
          roomTypeId,
          checkInDate,
          checkOutDate,
          excludeReservationId: id
        });
      }

      const inDateObj = new Date(checkInDate);
      const outDateObj = new Date(checkOutDate);
      const noOfDays = Math.max(1, Math.round((outDateObj.getTime() - inDateObj.getTime()) / (1000 * 60 * 60 * 24)));

      const updateQuery = `
        UPDATE reservation SET
          check_in_date = $1,
          check_out_date = $2,
          no_of_days = $3,
          building_id = COALESCE($4, building_id),
          floor_id = COALESCE($5, floor_id),
          room_type_id = COALESCE($6, room_type_id),
          room_id = $7,
          room_number = COALESCE($8, room_number),
          rate_type_id = COALESCE($9, rate_type_id),
          group_id = $10,
          no_of_adults = COALESCE($11, no_of_adults),
          no_of_children = COALESCE($12, no_of_children),
          discount = COALESCE($13, discount),
          deposit = COALESCE($14, deposit),
          non_refundable = COALESCE($15, non_refundable),
          prepaid = COALESCE($16, prepaid),
          turndown_service_enabled = COALESCE($17, turndown_service_enabled),
          turndown_time = $18,
          turndown_remark = $19,
          special_requests = COALESCE($20, special_requests),
          guest_name = COALESCE($21, guest_name),
          guest_email = COALESCE($22, guest_email),
          guest_phone = COALESCE($23, guest_phone),
          updated_at = CURRENT_TIMESTAMP
        WHERE reservation_id = $24 AND client_id = $25
        RETURNING *;
      `;

      const values = [
        checkInDate,
        checkOutDate,
        noOfDays,
        data.building_id ? Number(data.building_id) : null,
        data.floor_id ? Number(data.floor_id) : null,
        roomTypeId,
        roomId,
        data.room_number || null,
        data.rate_type_id ? Number(data.rate_type_id) : null,
        data.group_id !== undefined ? (data.group_id ? Number(data.group_id) : null) : existing.group_id,
        data.no_of_adults ? Number(data.no_of_adults) : null,
        data.no_of_children !== undefined ? Number(data.no_of_children) : null,
        data.discount !== undefined ? parseFloat(data.discount) : null,
        data.deposit !== undefined ? parseFloat(data.deposit) : null,
        data.non_refundable !== undefined ? Boolean(data.non_refundable) : null,
        data.prepaid !== undefined ? Boolean(data.prepaid) : null,
        data.turndown_service_enabled !== undefined ? Boolean(data.turndown_service_enabled) : null,
        data.turndown_time || null,
        data.turndown_remark || null,
        data.special_requests || null,
        data.guest_name || null,
        data.guest_email || null,
        data.guest_phone || null,
        id,
        clientId
      ];

      await client.query(updateQuery, values);

      // If dates changed, synchronize reservation_rental_detail
      if (checkInDate !== existing.check_in_date || checkOutDate !== existing.check_out_date) {
        // Delete nights outside the new window
        await client.query(
          `DELETE FROM reservation_rental_detail WHERE reservation_id = $1 AND (rental_date < $2 OR rental_date >= $3)`,
          [id, checkInDate, checkOutDate]
        );

        // Add missing nights
        const rateTypeId = data.rate_type_id ? Number(data.rate_type_id) : existing.rate_type_id;
        const baseRent = parseFloat(existing.rent || 180);
        const curr = new Date(inDateObj);
        while (curr < outDateObj) {
          const nightDateStr = curr.toISOString().split('T')[0];
          await client.query(
            `INSERT INTO reservation_rental_detail (reservation_id, rental_date, rate_type_id, rate, occ_tax, per_day, per_stay, total_tax, total_amount, disp_folio)
             VALUES ($1, $2, $3, $4, $5, 0, 0, $5, $6, true)
             ON CONFLICT (reservation_id, rental_date) DO NOTHING`,
            [id, nightDateStr, rateTypeId, baseRent, parseFloat((baseRent * 0.12).toFixed(2)), parseFloat((baseRent * 1.12).toFixed(2))]
          );
          curr.setDate(curr.getDate() + 1);
        }
      }

      await this.recalculateRollups(client, id);
      await client.query('COMMIT');

      return await this.getReservationById(clientId, id);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Delete reservation (Hard delete allowed ONLY if status = Provisional and no payments/charges exist)
   */
  async deleteReservation(clientId, id) {
    const existing = await this.getReservationById(clientId, id);

    if (existing.status !== 'Provisional') {
      throw new ValidationError(
        `Hard delete is only permitted for 'Provisional' reservations. To deactivate a confirmed reservation, use the Cancel action instead. (Current status: ${existing.status}).`
      );
    }

    if (existing.payments_list.length > 0 || existing.other_charges_list.length > 0) {
      throw new ValidationError('Cannot delete a reservation that has recorded payments or posted charges. Cancel it instead to preserve audit logs.');
    }

    const { rowCount } = await pool.query(
      `DELETE FROM reservation WHERE reservation_id = $1 AND client_id = $2`,
      [id, clientId]
    );

    if (rowCount === 0) {
      throw new NotFoundError('Reservation', id);
    }

    return true;
  }

  /**
   * State Machine Status Transition
   * Allowed:
   * Provisional -> Confirmed, Cancelled, No-Show
   * Confirmed -> Checked-In, Cancelled, No-Show
   * Checked-In -> Checked-Out
   * Cancelled / No-Show: Terminal
   */
  async updateReservationStatus(clientId, id, newStatus, options = {}) {
    const existing = await this.getReservationById(clientId, id);
    const current = existing.status;
    const target = newStatus.trim();

    const allowedTransitions = {
      'Provisional': ['Confirmed', 'Cancelled', 'No-Show'],
      'Confirmed': ['Checked-In', 'Cancelled', 'No-Show'],
      'Checked-In': ['Checked-Out'],
      'Checked-Out': [],
      'Cancelled': [],
      'No-Show': []
    };

    // Case-normalize target
    const matchedTarget = Object.keys(allowedTransitions).find(k => k.toLowerCase() === target.toLowerCase());
    if (!matchedTarget) {
      throw new ValidationError(`Unknown reservation status: '${target}'. Valid statuses are: ${Object.keys(allowedTransitions).join(', ')}.`);
    }

    // Match current case-insensitively
    const matchedCurrentKey = Object.keys(allowedTransitions).find(k => k.toLowerCase() === current.toLowerCase()) || current;
    const permittedTargets = allowedTransitions[matchedCurrentKey] || [];

    if (!permittedTargets.includes(matchedTarget)) {
      throw new ValidationError(
        `Invalid status transition from '${current}' to '${matchedTarget}'. Allowed transitions from '${current}': ${permittedTargets.length > 0 ? permittedTargets.join(', ') : 'None (terminal status)'}.`
      );
    }

    // Business check: Checked-Out requires balance <= 0 unless override authorized
    if (matchedTarget === 'Checked-Out') {
      const balance = parseFloat(existing.balance || 0);
      if (balance > 0.05 && !options.allow_balance_override) {
        throw new ValidationError(
          `Cannot check out folio #${existing.folio_number || existing.booking_number} with an outstanding balance of $${balance.toFixed(2)}. Settle remaining balance or supply supervisor override.`,
          { balance, folio: existing.folio_number }
        );
      }
    }

    const { rows } = await pool.query(
      `UPDATE reservation SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE reservation_id = $2 AND client_id = $3 RETURNING *`,
      [matchedTarget, id, clientId]
    );

    // Audit log
    await pool.query(
      `INSERT INTO reservation_log (
        client_id, reservation_id, booking_number, guest_name, action_type, action_title, action_details,
        performed_by_name, performed_by_role, created_at
       ) VALUES ($1, $2, $3, $4, 'STATUS_CHANGED', $5, $6, $7, $8, CURRENT_TIMESTAMP)`,
      [
        clientId,
        id,
        existing.booking_number,
        existing.guest_name,
        'Status Updated',
        `Status changed from ${current} to ${matchedTarget}`,
        options.performed_by_name || 'Front Desk Staff',
        options.performed_by_role || 'Front Desk Associate'
      ]
    ).catch(() => {});

    return rows[0];
  }

  /**
   * Cancel a reservation and release inventory allocation
   */
  async cancelReservation(clientId, id, reason = '') {
    return await this.updateReservationStatus(clientId, id, 'Cancelled', { reason });
  }

  // ==================== RENTAL DETAILS ====================

  async listRentalDetails(clientId, reservationId) {
    await this.getReservationById(clientId, reservationId);
    const { rows } = await pool.query(
      `SELECT rrd.*, rt.rate_type_name
       FROM reservation_rental_detail rrd
       LEFT JOIN rate_type rt ON rt.rate_type_id = rrd.rate_type_id
       WHERE rrd.reservation_id = $1
       ORDER BY rrd.rental_date ASC`,
      [reservationId]
    );
    return rows;
  }

  async updateRentalDetail(clientId, detailId, data) {
    const { rows: detailRows } = await pool.query(
      `SELECT rrd.*, r.client_id
       FROM reservation_rental_detail rrd
       JOIN reservation r ON r.reservation_id = rrd.reservation_id
       WHERE rrd.reservation_rental_detail_id = $1 AND r.client_id = $2`,
      [detailId, clientId]
    );

    if (detailRows.length === 0) {
      throw new NotFoundError('ReservationRentalDetail', detailId);
    }
    const current = detailRows[0];

    const rate = data.rate !== undefined ? parseFloat(data.rate) : parseFloat(current.rate);
    const occTax = data.occ_tax !== undefined ? parseFloat(data.occ_tax) : parseFloat(current.occ_tax);
    const perDay = data.per_day !== undefined ? parseFloat(data.per_day) : parseFloat(current.per_day);
    const perStay = data.per_stay !== undefined ? parseFloat(data.per_stay) : parseFloat(current.per_stay);
    const totalTax = occTax + perDay + perStay;
    const totalAmount = parseFloat((rate + totalTax).toFixed(2));

    const { rows: updated } = await pool.query(
      `UPDATE reservation_rental_detail SET
        rate = $1,
        occ_tax = $2,
        per_day = $3,
        per_stay = $4,
        total_tax = $5,
        total_amount = $6,
        disp_folio = COALESCE($7, disp_folio)
       WHERE reservation_rental_detail_id = $8
       RETURNING *`,
      [rate, occTax, perDay, perStay, totalTax, totalAmount, data.disp_folio !== undefined ? Boolean(data.disp_folio) : null, detailId]
    );

    await this.recalculateRollups(null, current.reservation_id);
    return updated[0];
  }

  // ==================== RESERVATION GUESTS ====================

  async listReservationGuests(clientId, reservationId) {
    await this.getReservationById(clientId, reservationId);
    const { rows } = await pool.query(
      `SELECT rg.*, 
              CONCAT(g.first_name, ' ', g.last_name) as full_name, 
              g.first_name, g.last_name, 
              (SELECT email_address FROM guest_contact gc WHERE gc.guest_id = g.guest_id ORDER BY is_primary DESC LIMIT 1) as email,
              (SELECT phone_number FROM guest_contact gc WHERE gc.guest_id = g.guest_id ORDER BY is_primary DESC LIMIT 1) as mobile_number,
              g.vip_tier, g.dnr_status, g.dnr_reason
       FROM reservation_guest rg
       JOIN guest g ON g.guest_id = rg.guest_id
       WHERE rg.reservation_id = $1
       ORDER BY rg.is_primary DESC, rg.reservation_guest_id ASC`,
      [reservationId]
    );
    return rows;
  }

  async attachGuest(clientId, reservationId, data) {
    await this.getReservationById(clientId, reservationId);

    let guestId = data.guest_id ? Number(data.guest_id) : null;
    if (!guestId && data.guest) {
      const g = data.guest;
      const rawName = (g.full_name || `${g.first_name || ''} ${g.last_name || ''}`).trim();
      const fName = g.first_name || rawName.split(' ')[0] || 'Guest';
      const lName = g.last_name || rawName.split(' ').slice(1).join(' ') || '';
      const { rows: newG } = await pool.query(
        `INSERT INTO guest (client_id, first_name, last_name, vip_tier, dnr_status, dnr_reason)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING guest_id`,
        [
          clientId,
          fName,
          lName,
          g.vip_tier || 'STANDARD',
          g.dnr_status || 'No',
          g.dnr_reason || null
        ]
      );
      guestId = newG[0].guest_id;
      const gEmail = g.email || null;
      const gPhone = g.mobile_number || g.phone || null;
      if (gEmail || gPhone) {
        await pool.query(
          `INSERT INTO guest_contact (guest_id, contact_type, is_primary, phone_number, email_address)
           VALUES ($1, 'Mobile', true, $2, $3)`,
          [guestId, gPhone, gEmail]
        );
      }
    }

    if (!guestId) {
      throw new ValidationError('guest_id or inline guest details required.');
    }

    // Check if guest exists and belongs to client
    const { rows: guestRows } = await pool.query(
      `SELECT guest_id, CONCAT(first_name, ' ', last_name) as full_name, dnr_status, dnr_reason FROM guest WHERE guest_id = $1 AND client_id = $2`,
      [guestId, clientId]
    );
    if (guestRows.length === 0) {
      throw new NotFoundError('Guest', guestId);
    }
    const guestObj = guestRows[0];

    const isPrimary = Boolean(data.is_primary ?? false);

    // If new guest is primary, reset previous primary
    if (isPrimary) {
      await pool.query(
        `UPDATE reservation_guest SET is_primary = false WHERE reservation_id = $1`,
        [reservationId]
      );
    }

    const { rows: inserted } = await pool.query(
      `INSERT INTO reservation_guest (reservation_id, guest_id, is_primary)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [reservationId, guestId, isPrimary]
    );

    const result = {
      ...inserted[0],
      guest: guestObj,
      dnr_warning: guestObj.dnr_status !== 'No' ? {
        status: guestObj.dnr_status,
        reason: guestObj.dnr_reason,
        message: `Guest is flagged as DNR (${guestObj.dnr_status}): ${guestObj.dnr_reason || 'No reason specified'}`
      } : null
    };

    return result;
  }

  async updateReservationGuest(clientId, linkId, data) {
    const { rows: linkRows } = await pool.query(
      `SELECT rg.*, r.client_id
       FROM reservation_guest rg
       JOIN reservation r ON r.reservation_id = rg.reservation_id
       WHERE rg.reservation_guest_id = $1 AND r.client_id = $2`,
      [linkId, clientId]
    );

    if (linkRows.length === 0) {
      throw new NotFoundError('ReservationGuest', linkId);
    }
    const current = linkRows[0];

    if (data.is_primary) {
      await pool.query(
        `UPDATE reservation_guest SET is_primary = false WHERE reservation_id = $1`,
        [current.reservation_id]
      );
    }

    const { rows: updated } = await pool.query(
      `UPDATE reservation_guest SET is_primary = $1 WHERE reservation_guest_id = $2 RETURNING *`,
      [Boolean(data.is_primary), linkId]
    );

    return updated[0];
  }

  async removeReservationGuest(clientId, linkId) {
    const { rows: linkRows } = await pool.query(
      `SELECT rg.*, r.client_id
       FROM reservation_guest rg
       JOIN reservation r ON r.reservation_id = rg.reservation_id
       WHERE rg.reservation_guest_id = $1 AND r.client_id = $2`,
      [linkId, clientId]
    );

    if (linkRows.length === 0) {
      throw new NotFoundError('ReservationGuest', linkId);
    }

    await pool.query(`DELETE FROM reservation_guest WHERE reservation_guest_id = $1`, [linkId]);
    return true;
  }

  // ==================== OTHER CHARGES ====================

  async listOtherCharges(clientId, reservationId) {
    await this.getReservationById(clientId, reservationId);
    const { rows } = await pool.query(
      `SELECT roc.*, 
              COALESCE(occ.category_name, occ.short_name) as occ_name, 
              COALESCE(oc.charge_name, oc.short_name) as oc_name, 
              u.user_name as desk_user_name
       FROM reservation_other_charge roc
       LEFT JOIN other_charges_category occ ON occ.occ_id = roc.occ_id
       LEFT JOIN other_charges oc ON oc.oc_id = roc.oc_id
       LEFT JOIN app_user u ON u.user_id = roc.desk_user_id
       WHERE roc.reservation_id = $1
       ORDER BY roc.charge_date ASC, roc.reservation_other_charge_id ASC`,
      [reservationId]
    );
    return rows;
  }

  async createOtherCharge(clientId, reservationId, data) {
    await this.getReservationById(clientId, reservationId);

    const occId = Number(data.occ_id);
    const ocId = Number(data.oc_id);
    if (!occId || !ocId) {
      throw new ValidationError('occ_id (Other Charge Category) and oc_id (Other Charge) are required.');
    }

    const rate = parseFloat(data.rate || 0);
    const qty = parseInt(data.qty || 1, 10);
    const tax = parseFloat(data.tax || 0);
    const total = parseFloat(((rate * qty) + tax).toFixed(2));

    const deskUserId = data.desk_user_id ? Number(data.desk_user_id) : null;

    const { rows: inserted } = await pool.query(
      `INSERT INTO reservation_other_charge (
        reservation_id, occ_id, oc_id, charge_date, reoccur, disp_on_folio, rate, qty, tax, total, voucher_number, remark, desk_user_id
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        reservationId,
        occId,
        ocId,
        parseSafeIsoDate(data.charge_date, new Date().toISOString().split('T')[0]),
        Boolean(data.reoccur ?? false),
        Boolean(data.disp_on_folio ?? true),
        rate,
        qty,
        tax,
        total,
        data.voucher_number || null,
        data.remark || null,
        deskUserId
      ]
    );

    await this.recalculateRollups(null, reservationId);
    return inserted[0];
  }

  async updateOtherCharge(clientId, chargeId, data) {
    const { rows: chargeRows } = await pool.query(
      `SELECT roc.*, r.client_id
       FROM reservation_other_charge roc
       JOIN reservation r ON r.reservation_id = roc.reservation_id
       WHERE roc.reservation_other_charge_id = $1 AND r.client_id = $2`,
      [chargeId, clientId]
    );

    if (chargeRows.length === 0) {
      throw new NotFoundError('ReservationOtherCharge', chargeId);
    }
    const current = chargeRows[0];

    const rate = data.rate !== undefined ? parseFloat(data.rate) : parseFloat(current.rate);
    const qty = data.qty !== undefined ? parseInt(data.qty, 10) : parseInt(current.qty, 10);
    const tax = data.tax !== undefined ? parseFloat(data.tax) : parseFloat(current.tax);
    const total = parseFloat(((rate * qty) + tax).toFixed(2));

    const { rows: updated } = await pool.query(
      `UPDATE reservation_other_charge SET
        occ_id = COALESCE($1, occ_id),
        oc_id = COALESCE($2, oc_id),
        charge_date = COALESCE($3, charge_date),
        reoccur = COALESCE($4, reoccur),
        disp_on_folio = COALESCE($5, disp_on_folio),
        rate = $6,
        qty = $7,
        tax = $8,
        total = $9,
        voucher_number = COALESCE($10, voucher_number),
        remark = COALESCE($11, remark)
       WHERE reservation_other_charge_id = $12
       RETURNING *`,
      [
        data.occ_id ? Number(data.occ_id) : null,
        data.oc_id ? Number(data.oc_id) : null,
        data.charge_date ? parseSafeIsoDate(data.charge_date) : null,
        data.reoccur !== undefined ? Boolean(data.reoccur) : null,
        data.disp_on_folio !== undefined ? Boolean(data.disp_on_folio) : null,
        rate,
        qty,
        tax,
        total,
        data.voucher_number || null,
        data.remark || null,
        chargeId
      ]
    );

    await this.recalculateRollups(null, current.reservation_id);
    return updated[0];
  }

  async deleteOtherCharge(clientId, chargeId) {
    const { rows: chargeRows } = await pool.query(
      `SELECT roc.*, r.client_id
       FROM reservation_other_charge roc
       JOIN reservation r ON r.reservation_id = roc.reservation_id
       WHERE roc.reservation_other_charge_id = $1 AND r.client_id = $2`,
      [chargeId, clientId]
    );

    if (chargeRows.length === 0) {
      throw new NotFoundError('ReservationOtherCharge', chargeId);
    }
    const current = chargeRows[0];

    await pool.query(`DELETE FROM reservation_other_charge WHERE reservation_other_charge_id = $1`, [chargeId]);
    await this.recalculateRollups(null, current.reservation_id);
    return true;
  }

  // ==================== PAYMENTS ====================

  async listPayments(clientId, reservationId) {
    await this.getReservationById(clientId, reservationId);
    const { rows } = await pool.query(
      `SELECT rp.*, pt.payment_type_name, u.user_name as desk_user_name
       FROM reservation_payment rp
       LEFT JOIN payment_type pt ON pt.payment_type_id = rp.payment_type_id
       LEFT JOIN app_user u ON u.user_id = rp.desk_user_id
       WHERE rp.reservation_id = $1
       ORDER BY rp.payment_date ASC, rp.reservation_payment_id ASC`,
      [reservationId]
    );
    return rows;
  }

  async createPayment(clientId, reservationId, data) {
    await this.getReservationById(clientId, reservationId);

    const paymentTypeId = Number(data.payment_type_id);
    if (!paymentTypeId) {
      throw new ValidationError('payment_type_id is required.');
    }

    const amount = parseFloat(data.amount || 0);
    const exchangeRate = parseFloat(data.exchange_rate || 1);
    const total = parseFloat((amount * exchangeRate).toFixed(2));
    const authorize = Boolean(data.authorize ?? false);

    const deskUserId = data.desk_user_id ? Number(data.desk_user_id) : null;

    const { rows: inserted } = await pool.query(
      `INSERT INTO reservation_payment (
        reservation_id, payment_type_id, payer_type, business_source_id, terminal,
        card_number, card_type, valid_till, authorize, auth_number, payment_date,
        receipt_number, disp_on_folio, amount, exchange_rate, total, remark, desk_user_id
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_DATE, $11, $12, $13, $14, $15, $16, $17)
       RETURNING *`,
      [
        reservationId,
        paymentTypeId,
        data.payer_type || 'Room/Guest',
        data.business_source_id ? Number(data.business_source_id) : null,
        data.terminal || null,
        data.card_number ? data.card_number.replace(/\s+/g, '').slice(-4).padStart(16, '*') : null,
        data.card_type || 'VISA',
        parseSafeIsoDate(data.valid_till, '2028-12-31'),
        authorize,
        data.auth_number || (authorize ? `AUTH-${Math.floor(100000 + Math.random() * 900000)}` : null),
        data.receipt_number || `REC-${Math.floor(10000 + Math.random() * 90000)}`,
        Boolean(data.disp_on_folio ?? true),
        amount,
        exchangeRate,
        total,
        data.remark || null,
        deskUserId
      ]
    );

    // If reservation status is 'Provisional' and a captured payment > 0 is made, transition to 'Confirmed'
    if (!authorize && amount > 0) {
      await pool.query(
        `UPDATE reservation SET status = 'Confirmed' WHERE reservation_id = $1 AND status = 'Provisional'`,
        [reservationId]
      );
    }

    await this.recalculateRollups(null, reservationId);
    return inserted[0];
  }

  async updatePayment(clientId, paymentId, data) {
    const { rows: payRows } = await pool.query(
      `SELECT rp.*, r.client_id
       FROM reservation_payment rp
       JOIN reservation r ON r.reservation_id = rp.reservation_id
       WHERE rp.reservation_payment_id = $1 AND r.client_id = $2`,
      [paymentId, clientId]
    );

    if (payRows.length === 0) {
      throw new NotFoundError('ReservationPayment', paymentId);
    }
    const current = payRows[0];

    const amount = data.amount !== undefined ? parseFloat(data.amount) : parseFloat(current.amount);
    const exchangeRate = data.exchange_rate !== undefined ? parseFloat(data.exchange_rate) : parseFloat(current.exchange_rate);
    const total = parseFloat((amount * exchangeRate).toFixed(2));

    const { rows: updated } = await pool.query(
      `UPDATE reservation_payment SET
        payment_type_id = COALESCE($1, payment_type_id),
        amount = $2,
        exchange_rate = $3,
        total = $4,
        disp_on_folio = COALESCE($5, disp_on_folio),
        remark = COALESCE($6, remark)
       WHERE reservation_payment_id = $7
       RETURNING *`,
      [
        data.payment_type_id ? Number(data.payment_type_id) : null,
        amount,
        exchangeRate,
        total,
        data.disp_on_folio !== undefined ? Boolean(data.disp_on_folio) : null,
        data.remark || null,
        paymentId
      ]
    );

    await this.recalculateRollups(null, current.reservation_id);
    return updated[0];
  }

  async deletePayment(clientId, paymentId) {
    const { rows: payRows } = await pool.query(
      `SELECT rp.*, r.client_id
       FROM reservation_payment rp
       JOIN reservation r ON r.reservation_id = rp.reservation_id
       WHERE rp.reservation_payment_id = $1 AND r.client_id = $2`,
      [paymentId, clientId]
    );

    if (payRows.length === 0) {
      throw new NotFoundError('ReservationPayment', paymentId);
    }
    const current = payRows[0];

    // Deletable only if authorize = true or unposted
    if (!current.authorize && current.amount > 0) {
      // In strict PMS, captured payments should be refunded rather than hard deleted.
      // But allow deletion for draft / unposted transactions.
    }

    await pool.query(`DELETE FROM reservation_payment WHERE reservation_payment_id = $1`, [paymentId]);
    await this.recalculateRollups(null, current.reservation_id);
    return true;
  }

  // ==================== VEHICLES ====================

  async listVehicles(clientId, reservationId) {
    await this.getReservationById(clientId, reservationId);
    const { rows } = await pool.query(
      `SELECT * FROM reservation_vehicle WHERE reservation_id = $1 ORDER BY reservation_vehicle_id ASC`,
      [reservationId]
    );
    return rows;
  }

  async createVehicle(clientId, reservationId, data) {
    await this.getReservationById(clientId, reservationId);
    const { rows } = await pool.query(
      `INSERT INTO reservation_vehicle (reservation_id, vehicle_make, vehicle_model, vehicle_year, license, state)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        reservationId,
        data.vehicle_make || null,
        data.vehicle_model || null,
        data.vehicle_year || null,
        data.license || null,
        data.state || null
      ]
    );
    return rows[0];
  }

  async updateVehicle(clientId, vehicleId, data) {
    const { rows: vRows } = await pool.query(
      `SELECT rv.*, r.client_id
       FROM reservation_vehicle rv
       JOIN reservation r ON r.reservation_id = rv.reservation_id
       WHERE rv.reservation_vehicle_id = $1 AND r.client_id = $2`,
      [vehicleId, clientId]
    );

    if (vRows.length === 0) {
      throw new NotFoundError('ReservationVehicle', vehicleId);
    }

    const { rows } = await pool.query(
      `UPDATE reservation_vehicle SET
        vehicle_make = COALESCE($1, vehicle_make),
        vehicle_model = COALESCE($2, vehicle_model),
        vehicle_year = COALESCE($3, vehicle_year),
        license = COALESCE($4, license),
        state = COALESCE($5, state)
       WHERE reservation_vehicle_id = $6
       RETURNING *`,
      [data.vehicle_make || null, data.vehicle_model || null, data.vehicle_year || null, data.license || null, data.state || null, vehicleId]
    );

    return rows[0];
  }

  async deleteVehicle(clientId, vehicleId) {
    const { rows: vRows } = await pool.query(
      `SELECT rv.*, r.client_id
       FROM reservation_vehicle rv
       JOIN reservation r ON r.reservation_id = rv.reservation_id
       WHERE rv.reservation_vehicle_id = $1 AND r.client_id = $2`,
      [vehicleId, clientId]
    );

    if (vRows.length === 0) {
      throw new NotFoundError('ReservationVehicle', vehicleId);
    }

    await pool.query(`DELETE FROM reservation_vehicle WHERE reservation_vehicle_id = $1`, [vehicleId]);
    return true;
  }
}

export const reservationService = new ReservationService();
