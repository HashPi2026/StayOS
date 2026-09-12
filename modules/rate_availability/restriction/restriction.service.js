import { restrictionRepository } from './restriction.repository.js';
import { ValidationError, NotFoundError } from '../../../utils/errors.js';

export class RestrictionService {
  constructor(repo = restrictionRepository) {
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

  async listRestrictions(clientId, filters = {}) {
    return this.repo.findMany(clientId, filters);
  }

  async getRestrictionById(clientId, id) {
    const record = await this.repo.findById(clientId, id);
    if (!record) {
      throw new NotFoundError('Room Type Restriction', id);
    }
    return record;
  }

  async validateRestrictionPayload(clientId, data) {
    if (!data.rate_type_id) {
      throw new ValidationError("Missing required field 'rate_type_id'.");
    }
    if (!data.room_type_id) {
      throw new ValidationError("Missing required field 'room_type_id'.");
    }
    if (!data.restriction_date) {
      throw new ValidationError("Missing required field 'restriction_date'.");
    }

    const minNights = data.minimum_nights !== undefined && data.minimum_nights !== null
      ? Number(data.minimum_nights)
      : null;
    const maxNights = data.maximum_nights !== undefined && data.maximum_nights !== null
      ? Number(data.maximum_nights)
      : null;

    if (minNights !== null && minNights < 0) {
      throw new ValidationError("'minimum_nights' cannot be negative.");
    }
    if (maxNights !== null && maxNights < 0) {
      throw new ValidationError("'maximum_nights' cannot be negative.");
    }
    if (minNights !== null && maxNights !== null && minNights > maxNights) {
      throw new ValidationError(
        `'minimum_nights' (${minNights}) cannot be greater than 'maximum_nights' (${maxNights}).`
      );
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

  async createRestriction(clientId, data) {
    await this.validateRestrictionPayload(clientId, data);

    const minNights = data.minimum_nights !== undefined && data.minimum_nights !== null
      ? Number(data.minimum_nights)
      : null;
    const maxNights = data.maximum_nights !== undefined && data.maximum_nights !== null
      ? Number(data.maximum_nights)
      : null;

    return this.repo.upsert(clientId, {
      rate_type_id: data.rate_type_id,
      room_type_id: data.room_type_id,
      restriction_date: data.restriction_date,
      close_to_arrival: Boolean(data.close_to_arrival),
      close_to_departure: Boolean(data.close_to_departure),
      sold_out: Boolean(data.sold_out),
      minimum_nights: minNights,
      maximum_nights: maxNights,
    });
  }

  async updateRestriction(clientId, id, data) {
    const existing = await this.repo.findById(clientId, id);
    if (!existing) {
      throw new NotFoundError('Room Type Restriction', id);
    }

    const minNights = data.minimum_nights !== undefined
      ? (data.minimum_nights !== null ? Number(data.minimum_nights) : null)
      : (existing.minimum_nights !== null ? Number(existing.minimum_nights) : null);

    const maxNights = data.maximum_nights !== undefined
      ? (data.maximum_nights !== null ? Number(data.maximum_nights) : null)
      : (existing.maximum_nights !== null ? Number(existing.maximum_nights) : null);

    if (minNights !== null && maxNights !== null && minNights > maxNights) {
      throw new ValidationError(
        `'minimum_nights' (${minNights}) cannot be greater than 'maximum_nights' (${maxNights}).`
      );
    }

    return this.repo.updateById(clientId, id, {
      close_to_arrival: data.close_to_arrival !== undefined ? Boolean(data.close_to_arrival) : undefined,
      close_to_departure: data.close_to_departure !== undefined ? Boolean(data.close_to_departure) : undefined,
      sold_out: data.sold_out !== undefined ? Boolean(data.sold_out) : undefined,
      minimum_nights: data.minimum_nights !== undefined ? data.minimum_nights : undefined,
      maximum_nights: data.maximum_nights !== undefined ? data.maximum_nights : undefined,
    });
  }

  async deleteRestriction(clientId, id) {
    const deleted = await this.repo.deleteById(clientId, id);
    if (!deleted) {
      throw new NotFoundError('Room Type Restriction', id);
    }
    return true;
  }

  /**
   * Bulk Operation — apply restriction flags/night limits across a date range and room types.
   */
  async bulkUpdateRestrictions(clientId, data) {
    // Mode A: Direct array of records
    if (Array.isArray(data.records) && data.records.length > 0) {
      const results = [];
      for (const rec of data.records) {
        const minNights = rec.minimum_nights !== undefined && rec.minimum_nights !== null
          ? Number(rec.minimum_nights)
          : null;
        const maxNights = rec.maximum_nights !== undefined && rec.maximum_nights !== null
          ? Number(rec.maximum_nights)
          : null;

        if (minNights !== null && maxNights !== null && minNights > maxNights) {
          throw new ValidationError(
            `'minimum_nights' (${minNights}) cannot be greater than 'maximum_nights' (${maxNights}).`
          );
        }

        const saved = await this.repo.upsert(clientId, {
          rate_type_id: rec.rate_type_id,
          room_type_id: rec.room_type_id,
          restriction_date: rec.restriction_date,
          close_to_arrival: Boolean(rec.close_to_arrival),
          close_to_departure: Boolean(rec.close_to_departure),
          sold_out: Boolean(rec.sold_out),
          minimum_nights: minNights,
          maximum_nights: maxNights,
        });
        results.push(saved);
      }
      return { updatedCount: results.length, records: results };
    }

    // Mode B: Parameterized range operation
    const {
      from,
      to,
      roomTypeIds,
      rateTypeId,
      close_to_arrival,
      close_to_departure,
      sold_out,
      minimum_nights,
      maximum_nights,
      daysOfWeek,
    } = data;

    if (!from || !to) {
      throw new ValidationError("Bulk restriction update requires 'from' and 'to' dates.");
    }
    if (!Array.isArray(roomTypeIds) || roomTypeIds.length === 0) {
      throw new ValidationError("Bulk restriction update requires an array of 'roomTypeIds'.");
    }
    if (!rateTypeId) {
      throw new ValidationError("Bulk restriction update requires 'rateTypeId'.");
    }

    const minNights = minimum_nights !== undefined && minimum_nights !== null ? Number(minimum_nights) : null;
    const maxNights = maximum_nights !== undefined && maximum_nights !== null ? Number(maximum_nights) : null;

    if (minNights !== null && maxNights !== null && minNights > maxNights) {
      throw new ValidationError(
        `'minimum_nights' (${minNights}) cannot be greater than 'maximum_nights' (${maxNights}).`
      );
    }

    const rateTypeValid = await this.repo.verifyRateTypeBelongsToClient(clientId, rateTypeId);
    if (!rateTypeValid) {
      throw new ValidationError(`Rate Type ID '${rateTypeId}' does not belong to this property.`);
    }

    const dates = this.generateDateList(from, to);
    const dayFilterSet = Array.isArray(daysOfWeek) && daysOfWeek.length > 0
      ? new Set(daysOfWeek.map(Number))
      : null;

    // Read existing restrictions for those dates to allow selective partial updates
    const existing = await this.repo.findMany(clientId, { from, to, rateTypeId });
    const existingMap = new Map();
    for (const item of existing) {
      existingMap.set(`${item.room_type_id}_${item.restriction_date}`, item);
    }

    let updatedCount = 0;

    for (const roomTypeId of roomTypeIds) {
      const roomTypeValid = await this.repo.verifyRoomTypeBelongsToClient(clientId, roomTypeId);
      if (!roomTypeValid) continue;

      for (const d of dates) {
        const dayDate = new Date(d + 'T00:00:00');
        if (dayFilterSet && !dayFilterSet.has(dayDate.getDay())) {
          continue;
        }

        const prev = existingMap.get(`${roomTypeId}_${d}`) || {};

        const cta = close_to_arrival !== undefined ? Boolean(close_to_arrival) : Boolean(prev.close_to_arrival);
        const ctd = close_to_departure !== undefined ? Boolean(close_to_departure) : Boolean(prev.close_to_departure);
        const so = sold_out !== undefined ? Boolean(sold_out) : Boolean(prev.sold_out);
        const minL = minNights !== null ? minNights : (prev.minimum_nights !== undefined && prev.minimum_nights !== null ? Number(prev.minimum_nights) : null);
        const maxL = maxNights !== null ? maxNights : (prev.maximum_nights !== undefined && prev.maximum_nights !== null ? Number(prev.maximum_nights) : null);

        await this.repo.upsert(clientId, {
          rate_type_id: rateTypeId,
          room_type_id: roomTypeId,
          restriction_date: d,
          close_to_arrival: cta,
          close_to_departure: ctd,
          sold_out: so,
          minimum_nights: minL,
          maximum_nights: maxL,
        });

        updatedCount++;
      }
    }

    return {
      updatedCount,
      from,
      to,
      rateTypeId,
      roomTypeIds,
      close_to_arrival,
      close_to_departure,
      sold_out,
      minimum_nights: minNights,
      maximum_nights: maxNights,
    };
  }
}

export const restrictionService = new RestrictionService();
