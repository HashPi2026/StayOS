import { roomService } from './room.service.js';
import { sendCreated, sendNoContent, sendSuccess } from '../../../utils/response.js';
import { ValidationError } from '../../../utils/errors.js';
export class RoomController {
    service;
    constructor(service = roomService) {
        this.service = service;
    }
    parseId(paramId) {
        const id = parseInt(paramId, 10);
        if (isNaN(id) || id <= 0) {
            throw new ValidationError('Invalid room ID. Must be a positive integer.');
        }
        return id;
    }
    list = async (req, res, next) => {
        try {
            const clientId = req.clientId;
            const buildingId = req.query.building_id ? parseInt(req.query.building_id, 10) : undefined;
            const floorId = req.query.floor_id ? parseInt(req.query.floor_id, 10) : undefined;
            const roomTypeId = req.query.room_type_id ? parseInt(req.query.room_type_id, 10) : undefined;
            const rooms = await this.service.listRooms(clientId, {
                building_id: isNaN(buildingId) ? undefined : buildingId,
                floor_id: isNaN(floorId) ? undefined : floorId,
                room_type_id: isNaN(roomTypeId) ? undefined : roomTypeId,
            });
            sendSuccess(res, rooms);
        }
        catch (err) {
            next(err);
        }
    };
    getById = async (req, res, next) => {
        try {
            const clientId = req.clientId;
            const id = this.parseId(req.params.id);
            const room = await this.service.getRoomById(clientId, id);
            sendSuccess(res, room);
        }
        catch (err) {
            next(err);
        }
    };
    create = async (req, res, next) => {
        try {
            const clientId = req.clientId;
            const created = await this.service.createRoom(clientId, req.body);
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
            const updated = await this.service.updateRoom(clientId, id, req.body);
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
            await this.service.deleteRoom(clientId, id);
            sendNoContent(res);
        }
        catch (err) {
            next(err);
        }
    };
}
export const roomController = new RoomController();
