import { roomStatusService } from './room_status.service.js';
import { sendCreated, sendNoContent, sendSuccess } from '../../../utils/response.js';
import { ValidationError } from '../../../utils/errors.js';
export class RoomStatusController {
    service;
    constructor(service = roomStatusService) {
        this.service = service;
    }
    parseId(paramId) {
        const id = parseInt(paramId, 10);
        if (isNaN(id) || id <= 0) {
            throw new ValidationError('Invalid room status ID. Must be a positive integer.');
        }
        return id;
    }
    list = async (req, res, next) => {
        try {
            const clientId = req.clientId;
            let isActive = undefined;
            if (req.query.is_active !== undefined) {
                isActive = req.query.is_active === 'true' || req.query.is_active === '1';
            }
            const statuses = await this.service.listRoomStatuses(clientId, isActive);
            sendSuccess(res, statuses);
        }
        catch (err) {
            next(err);
        }
    };
    getById = async (req, res, next) => {
        try {
            const clientId = req.clientId;
            const id = this.parseId(req.params.id);
            const status = await this.service.getRoomStatusById(clientId, id);
            sendSuccess(res, status);
        }
        catch (err) {
            next(err);
        }
    };
    create = async (req, res, next) => {
        try {
            const clientId = req.clientId;
            const created = await this.service.createRoomStatus(clientId, req.body);
            sendCreated(res, created);
        }
        catch (err) {
            next(err);
        }
    };
    update = async (req, res, next) => {
        try {
            const clientId = req.clientId;
            const id = this.parseId(req.params.id);
            const updated = await this.service.updateRoomStatus(clientId, id, req.body);
            sendSuccess(res, updated);
        }
        catch (err) {
            next(err);
        }
    };
    delete = async (req, res, next) => {
        try {
            const clientId = req.clientId;
            const id = this.parseId(req.params.id);
            await this.service.deleteRoomStatus(clientId, id);
            sendNoContent(res);
        }
        catch (err) {
            next(err);
        }
    };
}
export const roomStatusController = new RoomStatusController();
