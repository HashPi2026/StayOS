import { roomTypeRepository } from './room_type.repository.js';
import { floorRepository } from '../floor/floor.repository.js';
import { NotFoundError, ValidationError } from '../../../utils/errors.js';
export class RoomTypeService {
    repo;
    floorRepo;
    constructor(repo = roomTypeRepository, floorRepo = floorRepository) {
        this.repo = repo;
        this.floorRepo = floorRepo;
    }
    /**
     * Cross-field validation: Verify floor_id actually belongs to building_id for this tenant.
     * Rejects with HTTP 400 (ValidationError) if it does not.
     */
    async validateFloorBelongsToBuilding(clientId, floorId, buildingId) {
        const floor = await this.floorRepo.findById(clientId, floorId);
        if (!floor) {
            throw new ValidationError(`Floor with ID '${floorId}' does not exist for this property.`, { floor_id: floorId, client_id: clientId });
        }
        if (floor.building_id !== buildingId) {
            throw new ValidationError(`Invalid hierarchy: floor_id ${floorId} belongs to building_id ${floor.building_id}, not building_id ${buildingId}.`, {
                floor_id: floorId,
                submitted_building_id: buildingId,
                actual_building_id: floor.building_id,
            });
        }
    }
    async listRoomTypes(clientId) {
        return this.repo.findMany(clientId);
    }
    async getRoomTypeById(clientId, roomTypeId) {
        const roomType = await this.repo.findById(clientId, roomTypeId);
        if (!roomType) {
            throw new NotFoundError('RoomType', roomTypeId);
        }
        return roomType;
    }
    async createRoomType(clientId, dto) {
        // Cross-field hierarchy validation
        await this.validateFloorBelongsToBuilding(clientId, dto.floor_id, dto.building_id);
        return this.repo.create(clientId, dto);
    }
    async updateRoomType(clientId, roomTypeId, dto) {
        const existing = await this.getRoomTypeById(clientId, roomTypeId);
        const targetFloorId = dto.floor_id ?? existing.floor_id;
        const targetBuildingId = dto.building_id ?? existing.building_id;
        // Run hierarchy validation if either floor_id or building_id is updated
        if (dto.floor_id !== undefined || dto.building_id !== undefined) {
            await this.validateFloorBelongsToBuilding(clientId, targetFloorId, targetBuildingId);
        }
        const updated = await this.repo.update(clientId, roomTypeId, dto);
        if (!updated) {
            throw new NotFoundError('RoomType', roomTypeId);
        }
        return updated;
    }
    async deleteRoomType(clientId, roomTypeId) {
        const deleted = await this.repo.delete(clientId, roomTypeId);
        if (!deleted) {
            throw new NotFoundError('RoomType', roomTypeId);
        }
    }
}
export const roomTypeService = new RoomTypeService();
