import { floorService } from './floor.service.js';
import { sendCreated, sendNoContent, sendSuccess } from '../../../utils/response.js';
import { ValidationError } from '../../../utils/errors.js';
export class FloorController {
    service;
    constructor(service = floorService) {
        this.service = service;
    }
    parseId(paramId) {
        const id = parseInt(paramId, 10);
        if (isNaN(id) || id <= 0) {
            throw new ValidationError('Invalid floor ID. Must be a positive integer.');
        }
        return id;
    }
    list = async (req, res, next) => {
        try {
            const clientId = req.clientId;
            const buildingId = req.query.building_id ? parseInt(req.query.building_id, 10) : undefined;
            const floors = await this.service.listFloors(clientId, isNaN(buildingId) ? undefined : buildingId);
            sendSuccess(res, floors);
        }
        catch (err) {
            next(err);
        }
    };
    getById = async (req, res, next) => {
        try {
            const clientId = req.clientId;
            const id = this.parseId(req.params.id);
            const floor = await this.service.getFloorById(clientId, id);
            sendSuccess(res, floor);
        }
        catch (err) {
            next(err);
        }
    };
    create = async (req, res, next) => {
        try {
            const clientId = req.clientId;
            const created = await this.service.createFloor(clientId, req.body);
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
            const updated = await this.service.updateFloor(clientId, id, req.body);
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
            await this.service.deleteFloor(clientId, id);
            sendNoContent(res);
        }
        catch (err) {
            next(err);
        }
    };
}
export const floorController = new FloorController();
