import { Router } from 'express';
import { tenantMiddleware } from '../../middleware/tenant.js';
import { requireModuleAccess } from '../../middleware/roleAccess.js';
import { flashRouter } from './flash/flash.routes.js';
import { forecastRouter } from './forecast/forecast.routes.js';
import { roomRateRouter } from './room_rate/room_rate.routes.js';
import { restrictionRouter } from './restriction/restriction.routes.js';

export const rateAvailabilityRouter = Router();

// Enforce tenant scoping and RBAC module access for Rate & Availability
rateAvailabilityRouter.use(tenantMiddleware);
rateAvailabilityRouter.use(requireModuleAccess('rate_availability'));

// Flash View Submodule
rateAvailabilityRouter.use(flashRouter);

// Forecasting Submodule
rateAvailabilityRouter.use(forecastRouter);

// Room Rates Submodule
rateAvailabilityRouter.use(roomRateRouter);

// Restrictions Submodule
rateAvailabilityRouter.use(restrictionRouter);
