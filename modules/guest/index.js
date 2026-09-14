import { Router } from 'express';
import { tenantMiddleware } from '../../middleware/tenant.js';
import { requireModuleAccess } from '../../middleware/roleAccess.js';
import { guestRouter as guestSubRouter } from './guest/guest.routes.js';
import { guestContactRouter } from './guest_contact/guest_contact.routes.js';
import { guestDocumentRouter } from './guest_document/guest_document.routes.js';
import { contactCategoryRouter } from './contact_category/contact_category.routes.js';
import { contactRouter as contactSubRouter } from './contact/contact.routes.js';
import { contactDetailRouter } from './contact_detail/contact_detail.routes.js';
import { contactDocumentRouter } from './contact_document/contact_document.routes.js';
import { lostFoundRouter } from './lost_found/lost_found.routes.js';

export const guestRouter = Router();

// Enforce tenant scoping and RBAC module access for Guest module
guestRouter.use(tenantMiddleware);
guestRouter.use(requireModuleAccess('guest'));

// Submodules
guestRouter.use(guestSubRouter);
guestRouter.use(guestContactRouter);
guestRouter.use(guestDocumentRouter);
guestRouter.use(contactCategoryRouter);
guestRouter.use(contactSubRouter);
guestRouter.use(contactDetailRouter);
guestRouter.use(contactDocumentRouter);
guestRouter.use(lostFoundRouter);
