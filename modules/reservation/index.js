import { Router } from 'express';
import { tenantMiddleware } from '../../middleware/tenant.js';
import { requireModuleAccess } from '../../middleware/roleAccess.js';
import { reservationSubRouter } from './reservation.routes.js';
import { groupSubRouter } from './group.routes.js';

export const reservationRouter = Router();

// Enforce tenant scoping and RBAC module access for Reservation module
reservationRouter.use(tenantMiddleware);
reservationRouter.use(requireModuleAccess('reservation'));

// Mount Submodules
reservationRouter.use(reservationSubRouter);
reservationRouter.use(groupSubRouter);
