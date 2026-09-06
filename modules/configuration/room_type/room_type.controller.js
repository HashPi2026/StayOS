import { roomTypeService } from './room_type.service.js';
import { sendCreated, sendNoContent, sendSuccess } from '../../../utils/response.js';
import { ValidationError } from '../../../utils/errors.js';
export class RoomTypeController {
    service;
    constructor(service = roomTypeService) {
        this.service = service;
    }
    parseId(paramId) {
        const id = parseInt(paramId, 10);
        if (isNaN(id) || id <= 0) {
            throw new ValidationError('Invalid room_type ID. Must be a positive integer.');
        }
        return id;
    }
    list = async (req, res, next) => {
        try {
            const clientId = req.clientId;
            const roomTypes = await this.service.listRoomTypes(clientId);
            sendSuccess(res, roomTypes);
        }
        catch (err) {
            next(err);
        }
    };
    getById = async (req, res, next) => {
        try {
            const clientId = req.clientId;
            const id = this.parseId(req.params.id);
            const roomType = await this.service.getRoomTypeById(clientId, id);
            sendSuccess(res, roomType);
        }
        catch (err) {
            next(err);
        }
    };
    create = async (req, res, next) => {
        try {
            const clientId = req.clientId;
            const created = await this.service.createRoomType(clientId, req.body);
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
            const updated = await this.service.updateRoomType(clientId, id, req.body);
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
            await this.service.deleteRoomType(clientId, id);
            sendNoContent(res);
        }
        catch (err) {
            next(err);
        }
    };
}
export const roomTypeController = new RoomTypeController();
