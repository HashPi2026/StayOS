import { Router } from 'express';
import { reservationController } from './reservation.controller.js';

export const reservationSubRouter = Router();

// Master Reservation Routes
reservationSubRouter.get('/', reservationController.list);
reservationSubRouter.post('/', reservationController.create);
reservationSubRouter.get('/reservations', reservationController.list);
reservationSubRouter.post('/reservations', reservationController.create);
reservationSubRouter.get('/reservations/:id', reservationController.getById);
reservationSubRouter.put('/reservations/:id', reservationController.update);
reservationSubRouter.delete('/reservations/:id', reservationController.delete);
reservationSubRouter.put('/reservations/:id/status', reservationController.updateStatus);
reservationSubRouter.post('/reservations/:id/cancel', reservationController.cancel);

// Night-by-Night Rental Details
reservationSubRouter.get('/reservations/:id/rental-details', reservationController.listRentalDetails);
reservationSubRouter.put('/rental-details/:id', reservationController.updateRentalDetail);

// Reservation Guest Multi-Allocation & Primary Guest
reservationSubRouter.get('/reservations/:id/guests', reservationController.listGuests);
reservationSubRouter.post('/reservations/:id/guests', reservationController.attachGuest);
reservationSubRouter.put('/reservation-guests/:id', reservationController.updateGuest);
reservationSubRouter.delete('/reservation-guests/:id', reservationController.removeGuest);

// Reservation Other Charges
reservationSubRouter.get('/reservations/:id/other-charges', reservationController.listOtherCharges);
reservationSubRouter.post('/reservations/:id/other-charges', reservationController.createOtherCharge);
reservationSubRouter.put('/other-charges/:id', reservationController.updateOtherCharge);
reservationSubRouter.delete('/other-charges/:id', reservationController.deleteOtherCharge);

// Reservation Payments & Authorizations
reservationSubRouter.get('/reservations/:id/payments', reservationController.listPayments);
reservationSubRouter.post('/reservations/:id/payments', reservationController.createPayment);
reservationSubRouter.put('/payments/:id', reservationController.updatePayment);
reservationSubRouter.delete('/payments/:id', reservationController.deletePayment);

// Reservation Vehicles
reservationSubRouter.get('/reservations/:id/vehicles', reservationController.listVehicles);
reservationSubRouter.post('/reservations/:id/vehicles', reservationController.createVehicle);
reservationSubRouter.put('/vehicles/:id', reservationController.updateVehicle);
reservationSubRouter.delete('/vehicles/:id', reservationController.deleteVehicle);
