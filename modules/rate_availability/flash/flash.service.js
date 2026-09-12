import { flashRepository } from './flash.repository.js';
import { ValidationError } from '../../../utils/errors.js';

export class FlashService {
  constructor(repo = flashRepository) {
    this.repo = repo;
  }

  async getSettings(clientId) {
    return this.repo.getSettings(clientId);
  }

  async updateSettings(clientId, data) {
    return this.repo.updateSettings(clientId, data);
  }

  /**
   * Helper to format Date to YYYY-MM-DD
   */
  formatDate(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Generate an array of date strings from start to end (inclusive).
   */
  generateDateList(fromStr, toStr) {
    const dates = [];
    const current = new Date(fromStr + 'T00:00:00');
    const end = new Date(toStr + 'T00:00:00');

    while (current <= end) {
      dates.push(this.formatDate(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }

  /**
   * Compute live Flash Grid for a date range.
   * Total Room, CRS(n), Rate, V/Maint Room, Occupancy % + chart series.
   */
  async getFlashGrid(clientId, filters = {}) {
    const today = new Date();
    const defaultFrom = this.formatDate(today);
    const defaultToEnd = new Date(today);
    defaultToEnd.setDate(defaultToEnd.getDate() + 13);
    const defaultTo = this.formatDate(defaultToEnd);

    const fromDate = filters.from || defaultFrom;
    const toDate = filters.to || defaultTo;

    if (new Date(fromDate) > new Date(toDate)) {
      throw new ValidationError("Parameter 'from' date cannot be after 'to' date.");
    }

    const roomTypeId = filters.roomTypeId ? parseInt(filters.roomTypeId, 10) : undefined;
    const rateTypeId = filters.rateTypeId ? parseInt(filters.rateTypeId, 10) : undefined;

    // Fetch live data elements concurrently
    const [roomTypes, roomsSummary, rates, restrictions] = await Promise.all([
      this.repo.getRoomTypes(clientId, roomTypeId),
      this.repo.getRoomsSummary(clientId),
      this.repo.getRates(clientId, fromDate, toDate, rateTypeId),
      this.repo.getRestrictions(clientId, fromDate, toDate, rateTypeId),
    ]);

    // Build lookup maps
    const summaryByRoomType = new Map();
    for (const s of roomsSummary) {
      summaryByRoomType.set(s.room_type_id, s);
    }

    // Rate map: `roomTypeId_date` -> Base rate
    const rateMap = new Map();
    for (const r of rates) {
      if (r.occupancy_type === 'Base' || !rateMap.has(`${r.room_type_id}_${r.rate_date}`)) {
        rateMap.set(`${r.room_type_id}_${r.rate_date}`, parseFloat(r.rate_amount));
      }
    }

    // Restriction map: `roomTypeId_date` -> restriction object
    const restMap = new Map();
    for (const rest of restrictions) {
      restMap.set(`${rest.room_type_id}_${rest.restriction_date}`, rest);
    }

    const dates = this.generateDateList(fromDate, toDate);

    // Compute grid per Room Type
    const roomTypeRows = roomTypes.map((rt) => {
      const summary = summaryByRoomType.get(rt.room_type_id) || {
        total_rooms: 0,
        maint_rooms: 0,
        occupied_rooms: 0,
        crs_rooms: 0,
        avg_room_rate: parseFloat(rt.base_rate) || 120,
      };

      const totalRooms = summary.total_rooms;
      const maintRooms = summary.maint_rooms;
      const occupiedRooms = summary.occupied_rooms;

      const dailyMetrics = {};
      const ratesByDate = {};
      const availByDate = {};
      const crsByDate = {};
      const vmaintByDate = {};
      const occByDate = {};

      for (const d of dates) {
        const rateKey = `${rt.room_type_id}_${d}`;
        const rest = restMap.get(rateKey);

        const rate = rateMap.has(rateKey)
          ? rateMap.get(rateKey)
          : parseFloat(rt.base_rate) || parseFloat(summary.avg_room_rate) || 129.00;

        const isSoldOut = rest?.sold_out === true;
        const available = isSoldOut ? 0 : Math.max(0, totalRooms - maintRooms - occupiedRooms);
        const crsInventory = isSoldOut ? 0 : available;
        const occPct = totalRooms > 0 ? parseFloat((((totalRooms - available) / totalRooms) * 100).toFixed(1)) : 0;

        ratesByDate[d] = rate;
        availByDate[d] = available;
        crsByDate[d] = crsInventory;
        vmaintByDate[d] = maintRooms;
        occByDate[d] = occPct;

        dailyMetrics[d] = {
          totalRooms,
          availableRooms: available,
          crsInventory,
          vMaintRooms: maintRooms,
          rate,
          occupancyPercent: occPct,
          restrictions: rest ? {
            closeToArrival: rest.close_to_arrival,
            closeToDeparture: rest.close_to_departure,
            soldOut: rest.sold_out,
            minimumNights: rest.minimum_nights,
            maximumNights: rest.maximum_nights,
          } : null,
        };
      }

      return {
        roomTypeId: rt.room_type_id,
        code: rt.short_code || `RT-${rt.room_type_id}`,
        name: rt.room_type_name,
        category: rt.category || 'Standard',
        totalKeys: totalRooms,
        maxOccupancy: rt.capacity || 2,
        rates: ratesByDate,
        physicalAvail: availByDate,
        crsAlloc: crsByDate,
        maintenance: vmaintByDate,
        occupancyPercent: occByDate,
        dailyMetrics,
      };
    });

    // Compute summary totals row across all room types for each date
    const summaryTotals = {};
    const chartSeries = [];

    for (const d of dates) {
      let totalKeys = 0;
      let totalAvail = 0;
      let totalCrs = 0;
      let totalMaint = 0;
      let totalRateSum = 0;
      let rateCount = 0;

      for (const row of roomTypeRows) {
        const m = row.dailyMetrics[d];
        totalKeys += m.totalRooms;
        totalAvail += m.availableRooms;
        totalCrs += m.crsInventory;
        totalMaint += m.vMaintRooms;
        totalRateSum += m.rate;
        rateCount++;
      }

      const totalOccupied = Math.max(0, totalKeys - totalAvail);
      const avgRate = rateCount > 0 ? parseFloat((totalRateSum / rateCount).toFixed(2)) : 0;
      const overallOccPct = totalKeys > 0 ? parseFloat(((totalOccupied / totalKeys) * 100).toFixed(1)) : 0;
      const estRevenue = parseFloat((totalOccupied * avgRate).toFixed(2));

      summaryTotals[d] = {
        totalRooms: totalKeys,
        availableRooms: totalAvail,
        crsInventory: totalCrs,
        vMaintRooms: totalMaint,
        soldRooms: totalOccupied,
        occupancyPercent: overallOccPct,
        averageRate: avgRate,
        roomRevenue: estRevenue,
      };

      chartSeries.push({
        date: d,
        totalRooms: totalKeys,
        availableRooms: totalAvail,
        soldRooms: totalOccupied,
        occupancyPercent: overallOccPct,
        adr: avgRate,
        revenue: estRevenue,
      });
    }

    return {
      from: fromDate,
      to: toDate,
      dates,
      roomTypes: roomTypeRows,
      summaryTotals,
      chartSeries,
    };
  }
}

export const flashService = new FlashService();
