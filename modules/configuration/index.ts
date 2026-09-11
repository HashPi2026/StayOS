import { Router } from 'express';
import { tenantMiddleware } from '../../middleware/tenant';
import { propertyRouter } from './property/property.routes';
import { buildingRouter } from './building/building.routes';
import { floorRouter } from './floor/floor.routes';
import { roomTypeRouter } from './room_type/room_type.routes';
import { roomRouter } from './room/room.routes';
import { roomStatusRouter } from './room_status/room_status.routes';
import { taxRouter } from './tax/tax.routes';

export const configurationRouter = Router();

// Enforce tenant scoping on all configuration module endpoints
configurationRouter.use(tenantMiddleware);

// 1. Property (Pattern A - Singleton)
configurationRouter.use('/property', propertyRouter);

// 2. Building (Pattern B - Master List)
configurationRouter.use('/buildings', buildingRouter);
configurationRouter.use('/building', buildingRouter);

// 3. Floor (Pattern B - Master List)
configurationRouter.use('/floors', floorRouter);
configurationRouter.use('/floor', floorRouter);

// 4. Room Type (Pattern B - Master List with Hierarchy Validation)
configurationRouter.use('/room-types', roomTypeRouter);
configurationRouter.use('/room_type', roomTypeRouter);

// 5. Room (Pattern B - Master List with Hierarchy Validation)
configurationRouter.use('/rooms', roomRouter);
configurationRouter.use('/room', roomRouter);

// 6. Room Status (Pattern B - Status Catalogue with Soft Delete)
configurationRouter.use('/room-statuses', roomStatusRouter);
configurationRouter.use('/room-status', roomStatusRouter);
configurationRouter.use('/room_status', roomStatusRouter);

// 7. Tax & Tax Configuration (Pattern B - Parent/Child with Active Date Range Overlap Check)
configurationRouter.use('/taxes', taxRouter);
configurationRouter.use('/tax', taxRouter);
