import { Router } from 'express';
import { tenantMiddleware } from '../../middleware/tenant.js';
import { propertyRouter } from './property/property.routes.js';
import { buildingRouter } from './building/building.routes.js';
import { floorRouter } from './floor/floor.routes.js';
import { roomTypeRouter } from './room_type/room_type.routes.js';
import { roomRouter } from './room/room.routes.js';
import { roomStatusRouter } from './room_status/room_status.routes.js';
import { taxRouter } from './tax/tax.routes.js';
import { userRouter } from './user/user.routes.js';
import { exchangeRateRouter } from './exchange_rate/exchange_rate.routes.js';
import { emailTemplateRouter } from './email_template/email_template.routes.js';
import { measurementUnitRouter } from './measurement_unit/measurement_unit.routes.js';
import { otherChargesRouter } from './other_charges/other_charges.routes.js';
import { policyRouter } from './policy/policy.routes.js';
import { packageRouter } from './package/package.routes.js';
import { rateTypeRouter } from './rate_type/rate_type.routes.js';
import { documentTypeRouter } from './document_type/document_type.routes.js';
import { paymentTypeRouter } from './payment_type/payment_type.routes.js';
import { guestCategoryRouter } from './guest_category/guest_category.routes.js';
import { reservationLogRouter } from './reservation_log/reservation_log.routes.js';

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

// 8. User Management (Pattern B - App Users & Roles)
configurationRouter.use('/users', userRouter);
configurationRouter.use('/user', userRouter);

// 9. Exchange Rates
configurationRouter.use('/exchange-rates', exchangeRateRouter);
configurationRouter.use('/exchange_rates', exchangeRateRouter);

// 10. Email Templates
configurationRouter.use('/email-templates', emailTemplateRouter);
configurationRouter.use('/email_templates', emailTemplateRouter);

// 11. Measurement Units
configurationRouter.use('/measurement-units', measurementUnitRouter);
configurationRouter.use('/measurement_units', measurementUnitRouter);

// 12. Other Charges & Categories
configurationRouter.use('/other-charges', otherChargesRouter);
configurationRouter.use('/other_charges', otherChargesRouter);

// 13. Policies
configurationRouter.use('/policies', policyRouter);
configurationRouter.use('/policy', policyRouter);

// 14. Packages
configurationRouter.use('/packages', packageRouter);
configurationRouter.use('/package', packageRouter);

// 15. Rate Types
configurationRouter.use('/rate-types', rateTypeRouter);
configurationRouter.use('/rate_types', rateTypeRouter);

// 16. Document Types
configurationRouter.use('/document-types', documentTypeRouter);
configurationRouter.use('/document_types', documentTypeRouter);

// 17. Payment Types
configurationRouter.use('/payment-types', paymentTypeRouter);
configurationRouter.use('/payment_types', paymentTypeRouter);

// 18. Guest Categories
configurationRouter.use('/guest-categories', guestCategoryRouter);
configurationRouter.use('/guest_categories', guestCategoryRouter);

// 19. Reservation Logs (Miscellaneous -> Reservation Log)
configurationRouter.use('/reservation-logs', reservationLogRouter);
configurationRouter.use('/reservation_logs', reservationLogRouter);
configurationRouter.use('/reservation-log', reservationLogRouter);
