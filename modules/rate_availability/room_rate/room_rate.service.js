import { roomRateRepository } from './room_rate.repository.js';
import { ValidationError, NotFoundError } from '../../../utils/errors.js';

const ALLOWED_OCCUPANCY_TYPES = ['Base', 'Adult', 'Child', 'Pet'];

export class RoomRateService {
  constructor(repo = roomRateRepository) {
    this.repo = repo;
  }

  formatDate(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

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

  async listRoomRates(clientId, filters = {}) {
    return this.repo.findMany(clientId, filters);
  }

  async getRoomRateById(clientId, id) {
    const record = await this.repo.findById(clientId, id);
    if (!record) {
      throw new NotFoundError('Room Rate', id);
    }
    return record;
  }

  async validateRatePayload(clientId, data) {
    if (!data.rate_type_id) {
      throw new ValidationError("Missing required field 'rate_type_id'.");
    }
    if (!data.room_type_id) {
      throw new ValidationError("Missing required field 'room_type_id'.");
    }
    if (!data.rate_date) {
      throw new ValidationError("Missing required field 'rate_date'.");
    }
    if (!data.occupancy_type || !ALLOWED_OCCUPANCY_TYPES.includes(data.occupancy_type)) {
      throw new ValidationError(
        `Invalid 'occupancy_type'. Must be one of: ${ALLOWED_OCCUPANCY_TYPES.join(', ')}.`
      );
    }
    if (data.rate_amount === undefined || data.rate_amount === null || isNaN(Number(data.rate_amount))) {
      throw new ValidationError("Field 'rate_amount' is required and must be a valid number.");
    }
    if (Number(data.rate_amount) < 0) {
      throw new ValidationError("Field 'rate_amount' must be greater than or equal to 0.");
    }

    const [rateTypeValid, roomTypeValid] = await Promise.all([
      this.repo.verifyRateTypeBelongsToClient(clientId, data.rate_type_id),
      this.repo.verifyRoomTypeBelongsToClient(clientId, data.room_type_id),
    ]);

    if (!rateTypeValid) {
      throw new ValidationError(
        `Rate Type ID '${data.rate_type_id}' does not exist or does not belong to this property.`
      );
    }
    if (!roomTypeValid) {
      throw new ValidationError(
        `Room Type ID '${data.room_type_id}' does not exist or does not belong to this property.`
      );
    }
  }

  async createRoomRate(clientId, data) {
    await this.validateRatePayload(clientId, data);

    const defaultCounts = { Base: 1, Adult: 2, Child: 1, Pet: 1 };
    const occupancyCount = data.occupancy_count ?? defaultCounts[data.occupancy_type] ?? 1;

    return this.repo.upsert(clientId, {
      rate_type_id: data.rate_type_id,
      room_type_id: data.room_type_id,
      occupancy_type: data.occupancy_type,
      occupancy_count: occupancyCount,
      rate_date: data.rate_date,
      rate_amount: Number(data.rate_amount),
    });
  }

  async updateRoomRate(clientId, id, data) {
    const existing = await this.repo.findById(clientId, id);
    if (!existing) {
      throw new NotFoundError('Room Rate', id);
    }

    if (data.rate_amount !== undefined) {
      if (isNaN(Number(data.rate_amount)) || Number(data.rate_amount) < 0) {
        throw new ValidationError("Field 'rate_amount' must be a valid number >= 0.");
      }
    }

    return this.repo.updateById(clientId, id, {
      rate_amount: data.rate_amount !== undefined ? Number(data.rate_amount) : undefined,
      occupancy_count: data.occupancy_count,
    });
  }

  async deleteRoomRate(clientId, id) {
    const deleted = await this.repo.deleteById(clientId, id);
    if (!deleted) {
      throw new NotFoundError('Room Rate', id);
    }
    return true;
  }

  /**
   * Range Rate Operation — apply flat values, additions, or percentage markups
   * across a date range, room types, and occupancy tiers.
   */
  async bulkUpdateRates(clientId, data) {
    // Mode A: Direct list of records
    if (Array.isArray(data.records) && data.records.length > 0) {
      const results = [];
      for (const rec of data.records) {
        if (Number(rec.rate_amount) < 0) {
          throw new ValidationError("All 'rate_amount' values must be >= 0.");
        }
        const saved = await this.repo.upsert(clientId, {
          rate_type_id: rec.rate_type_id,
          room_type_id: rec.room_type_id,
          occupancy_type: rec.occupancy_type || 'Base',
          occupancy_count: rec.occupancy_count || 1,
          rate_date: rec.rate_date,
          rate_amount: Number(rec.rate_amount),
        });
        results.push(saved);
      }
      return { updatedCount: results.length, records: results };
    }

    // Mode B: Range parameters
    const { from, to, roomTypeIds, rateTypeId, occupancyTypes, operation, value, daysOfWeek } = data;

    if (!from || !to) {
      throw new ValidationError("Range bulk update requires 'from' and 'to' dates.");
    }
    if (!Array.isArray(roomTypeIds) || roomTypeIds.length === 0) {
      throw new ValidationError("Range bulk update requires an array of 'roomTypeIds'.");
    }
    if (!rateTypeId) {
      throw new ValidationError("Range bulk update requires 'rateTypeId'.");
    }

    const rateTypeValid = await this.repo.verifyRateTypeBelongsToClient(clientId, rateTypeId);
    if (!rateTypeValid) {
      throw new ValidationError(`Rate Type ID '${rateTypeId}' does not belong to this property.`);
    }

    const targetOccupancies = Array.isArray(occupancyTypes) && occupancyTypes.length > 0
      ? occupancyTypes
      : ['Base'];

    const dates = this.generateDateList(from, to);
    const dayFilterSet = Array.isArray(daysOfWeek) && daysOfWeek.length > 0
      ? new Set(daysOfWeek.map(Number))
      : null;

    // Pre-fetch existing rates for modification if relative operations
    const existingRates = await this.repo.findMany(clientId, { from, to, rateTypeId });
    const rateMap = new Map();
    for (const r of existingRates) {
      rateMap.set(`${r.room_type_id}_${r.occupancy_type}_${r.rate_date}`, parseFloat(r.rate_amount));
    }

    const numVal = Number(value) || 0;
    let updatedCount = 0;

    for (const roomTypeId of roomTypeIds) {
      const roomTypeValid = await this.repo.verifyRoomTypeBelongsToClient(clientId, roomTypeId);
      if (!roomTypeValid) continue;

      for (const d of dates) {
        const dayDate = new Date(d + 'T00:00:00');
        if (dayFilterSet && !dayFilterSet.has(dayDate.getDay())) {
          continue;
        }

        for (const occ of targetOccupancies) {
          const key = `${roomTypeId}_${occ}_${d}`;
          const currentRate = rateMap.get(key) || 120.00;

          let newRate = currentRate;
          if (operation === 'set') {
            newRate = Math.max(0, numVal);
          } else if (operation === 'adjust_flat') {
            newRate = Math.max(0, currentRate + numVal);
          } else if (operation === 'adjust_pct') {
            newRate = Math.max(0, currentRate * (1 + numVal / 100));
          } else {
            newRate = Math.max(0, numVal);
          }

          newRate = parseFloat(newRate.toFixed(2));

          await this.repo.upsert(clientId, {
            rate_type_id: rateTypeId,
            room_type_id: roomTypeId,
            occupancy_type: occ,
            occupancy_count: occ === 'Adult' ? 2 : 1,
            rate_date: d,
            rate_amount: newRate,
          });

          updatedCount++;
        }
      }
    }

    return {
      updatedCount,
      from,
      to,
      rateTypeId,
      roomTypeIds,
      operation: operation || 'set',
      value: numVal,
    };
  }

  /**
   * Room Type Binding Action: One-time bulk-copy of source room type's rates
   * (with optional adjustment) into target room type for a date range.
   * Does not persist an ongoing binding rule.
   */
  async copyFromRoomType(clientId, payload) {
    const {
      sourceRoomTypeId,
      targetRoomTypeId,
      rateTypeId,
      from,
      to,
      adjustmentType = 'none',
      adjustmentValue = 0,
    } = payload;

    if (!sourceRoomTypeId || !targetRoomTypeId) {
      throw new ValidationError("Both 'sourceRoomTypeId' and 'targetRoomTypeId' are required.");
    }
    if (sourceRoomTypeId === targetRoomTypeId) {
      throw new ValidationError("Source and target room types must be different.");
    }
    if (!from || !to) {
      throw new ValidationError("'from' and 'to' date range is required.");
    }

    const [srcValid, tgtValid] = await Promise.all([
      this.repo.verifyRoomTypeBelongsToClient(clientId, sourceRoomTypeId),
      this.repo.verifyRoomTypeBelongsToClient(clientId, targetRoomTypeId),
    ]);

    if (!srcValid) {
      throw new ValidationError(`Source Room Type '${sourceRoomTypeId}' does not belong to this property.`);
    }
    if (!tgtValid) {
      throw new ValidationError(`Target Room Type '${targetRoomTypeId}' does not belong to this property.`);
    }

    const sourceRates = await this.repo.findSourceRatesForCopy(
      clientId,
      sourceRoomTypeId,
      from,
      to,
      rateTypeId
    );

    const adjVal = Number(adjustmentValue) || 0;
    let copiedCount = 0;

    for (const src of sourceRates) {
      const srcAmount = parseFloat(src.rate_amount);
      let targetAmount = srcAmount;

      if (adjustmentType === 'flat') {
        targetAmount = Math.max(0, srcAmount + adjVal);
      } else if (adjustmentType === 'percentage') {
        targetAmount = Math.max(0, srcAmount * (1 + adjVal / 100));
      } else {
        targetAmount = Math.max(0, srcAmount);
      }

      targetAmount = parseFloat(targetAmount.toFixed(2));

      await this.repo.upsert(clientId, {
        rate_type_id: src.rate_type_id,
        room_type_id: targetRoomTypeId,
        occupancy_type: src.occupancy_type,
        occupancy_count: src.occupancy_count || 1,
        rate_date: src.rate_date,
        rate_amount: targetAmount,
      });

      copiedCount++;
    }

    return {
      copiedCount,
      sourceRoomTypeId,
      targetRoomTypeId,
      from,
      to,
      adjustmentType,
      adjustmentValue: adjVal,
    };
  }
}

export const roomRateService = new RoomRateService();
