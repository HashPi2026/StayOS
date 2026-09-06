import { propertyService } from './property.service.js';
import { sendSuccess } from '../../../utils/response.js';
export class PropertyController {
    service;
    constructor(service = propertyService) {
        this.service = service;
    }
    get = async (req, res, next) => {
        try {
            const clientId = req.clientId;
            const property = await this.service.getProperty(clientId);
            sendSuccess(res, property);
        }
        catch (err) {
            next(err);
        }
    };
    put = async (req, res, next) => {
        try {
            const clientId = req.clientId;
            const updated = await this.service.upsertProperty(clientId, req.body);
            sendSuccess(res, updated, 200, { upserted: true });
        }
        catch (err) {
            next(err);
        }
    };
}
export const propertyController = new PropertyController();
