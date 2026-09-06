import { Router } from 'express';
import { taxController } from './tax.controller.js';
import { validate } from '../../../middleware/validate.js';
import { validateCreateTax, validateCreateTaxConfig, validateUpdateTax, validateUpdateTaxConfig, } from './tax.validation.js';
export const taxRouter = Router();
// ================= TAX ENDPOINTS =================
taxRouter.get('/', taxController.listTaxes);
taxRouter.get('/:taxId', taxController.getTaxById);
taxRouter.post('/', validate(validateCreateTax), taxController.createTax);
taxRouter.put('/:taxId', validate(validateUpdateTax), taxController.updateTax);
taxRouter.delete('/:taxId', taxController.deleteTax);
// ================= NESTED TAX CONFIGURATION ENDPOINTS =================
taxRouter.get('/:taxId/configurations', taxController.listConfigurations);
taxRouter.get('/:taxId/configurations/:configId', taxController.getConfigurationById);
taxRouter.post('/:taxId/configurations', validate(validateCreateTaxConfig), taxController.createConfiguration);
taxRouter.put('/:taxId/configurations/:configId', validate(validateUpdateTaxConfig), taxController.updateConfiguration);
taxRouter.delete('/:taxId/configurations/:configId', taxController.deleteConfiguration);
