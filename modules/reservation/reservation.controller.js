import { reservationService } from './reservation.service.js';
import { sendCreated, sendNoContent, sendSuccess } from '../../utils/response.js';
import { ValidationError } from '../../utils/errors.js';

export class ReservationController {
  constructor(service = reservationService) {
    this.service = service;
  }

  parseId(paramId, entityName = 'reservation') {
    const id = parseInt(paramId, 10);
    if (isNaN(id) || id <= 0) {
      throw new ValidationError(`Invalid ${entityName} ID. Must be a positive integer.`);
    }
    return id;
  }

  // ==================== RESERVATIONS ====================

  list = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const { group_id, status, check_in_date, check_out_date, room_id, room_type_id, search, limit, offset } = req.query;
      const reservations = await this.service.listReservations(clientId, {
        group_id,
        status,
        check_in_date,
        check_out_date,
        room_id,
        room_type_id,
        search,
        limit,
        offset
      });
      sendSuccess(res, reservations);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const id = this.parseId(req.params.id);
      const reservation = await this.service.getReservationById(clientId, id);
      sendSuccess(res, reservation);
    } catch (err) {
      next(err);
    }
  };

  create = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const created = await this.service.createReservation(clientId, req.body);
      sendCreated(res, created);
    } catch (err) {
      next(err);
    }
  };

  update = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const id = this.parseId(req.params.id);
      const updated = await this.service.updateReservation(clientId, id, req.body);
      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const id = this.parseId(req.params.id);
      await this.service.deleteReservation(clientId, id);
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };

  updateStatus = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const id = this.parseId(req.params.id);
      const { status, allow_balance_override } = req.body;
      if (!status) {
        throw new ValidationError('status field is required in request body.');
      }
      const updated = await this.service.updateReservationStatus(clientId, id, status, { allow_balance_override });
      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  };

  cancel = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const id = this.parseId(req.params.id);
      const { reason } = req.body;
      const cancelled = await this.service.cancelReservation(clientId, id, reason);
      sendSuccess(res, cancelled);
    } catch (err) {
      next(err);
    }
  };

  // ==================== RENTAL DETAILS ====================

  listRentalDetails = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const resId = this.parseId(req.params.id);
      const details = await this.service.listRentalDetails(clientId, resId);
      sendSuccess(res, details);
    } catch (err) {
      next(err);
    }
  };

  updateRentalDetail = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const detailId = this.parseId(req.params.id, 'rental detail');
      const updated = await this.service.updateRentalDetail(clientId, detailId, req.body);
      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  };

  // ==================== GUESTS ====================

  listGuests = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const resId = this.parseId(req.params.id);
      const guests = await this.service.listReservationGuests(clientId, resId);
      sendSuccess(res, guests);
    } catch (err) {
      next(err);
    }
  };

  attachGuest = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const resId = this.parseId(req.params.id);
      const attached = await this.service.attachGuest(clientId, resId, req.body);
      sendCreated(res, attached);
    } catch (err) {
      next(err);
    }
  };

  updateGuest = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const linkId = this.parseId(req.params.id, 'reservation guest');
      const updated = await this.service.updateReservationGuest(clientId, linkId, req.body);
      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  };

  removeGuest = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const linkId = this.parseId(req.params.id, 'reservation guest');
      await this.service.removeReservationGuest(clientId, linkId);
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };

  // ==================== OTHER CHARGES ====================

  listOtherCharges = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const resId = this.parseId(req.params.id);
      const charges = await this.service.listOtherCharges(clientId, resId);
      sendSuccess(res, charges);
    } catch (err) {
      next(err);
    }
  };

  createOtherCharge = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const resId = this.parseId(req.params.id);
      const created = await this.service.createOtherCharge(clientId, resId, req.body);
      sendCreated(res, created);
    } catch (err) {
      next(err);
    }
  };

  updateOtherCharge = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const chargeId = this.parseId(req.params.id, 'other charge');
      const updated = await this.service.updateOtherCharge(clientId, chargeId, req.body);
      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  };

  deleteOtherCharge = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const chargeId = this.parseId(req.params.id, 'other charge');
      await this.service.deleteOtherCharge(clientId, chargeId);
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };

  // ==================== PAYMENTS ====================

  listPayments = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const resId = this.parseId(req.params.id);
      const payments = await this.service.listPayments(clientId, resId);
      sendSuccess(res, payments);
    } catch (err) {
      next(err);
    }
  };

  createPayment = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const resId = this.parseId(req.params.id);
      const created = await this.service.createPayment(clientId, resId, req.body);
      sendCreated(res, created);
    } catch (err) {
      next(err);
    }
  };

  updatePayment = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const paymentId = this.parseId(req.params.id, 'payment');
      const updated = await this.service.updatePayment(clientId, paymentId, req.body);
      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  };

  deletePayment = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const paymentId = this.parseId(req.params.id, 'payment');
      await this.service.deletePayment(clientId, paymentId);
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };

  // ==================== VEHICLES ====================

  listVehicles = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const resId = this.parseId(req.params.id);
      const vehicles = await this.service.listVehicles(clientId, resId);
      sendSuccess(res, vehicles);
    } catch (err) {
      next(err);
    }
  };

  createVehicle = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const resId = this.parseId(req.params.id);
      const created = await this.service.createVehicle(clientId, resId, req.body);
      sendCreated(res, created);
    } catch (err) {
      next(err);
    }
  };

  updateVehicle = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const vehicleId = this.parseId(req.params.id, 'vehicle');
      const updated = await this.service.updateVehicle(clientId, vehicleId, req.body);
      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  };

  deleteVehicle = async (req, res, next) => {
    try {
      const clientId = req.clientId;
      const vehicleId = this.parseId(req.params.id, 'vehicle');
      await this.service.deleteVehicle(clientId, vehicleId);
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };
}

export const reservationController = new ReservationController();
