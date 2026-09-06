import { floorRepository } from './floor.repository.js';
import { buildingRepository } from '../building/building.repository.js';
import { NotFoundError, ValidationError } from '../../../utils/errors.js';
export class FloorService {
    repo;
    buildingRepo;
    constructor(repo = floorRepository, buildingRepo = buildingRepository) {
        this.repo = repo;
        this.buildingRepo = buildingRepo;
    }
    async validateBuildingExists(clientId, buildingId) {
        const building = await this.buildingRepo.findById(clientId, buildingId);
        if (!building) {
            throw new ValidationError(`Building with ID '${buildingId}' does not exist for this property.`, { building_id: buildingId, client_id: clientId });
        }
    }
    async listFloors(clientId, buildingId) {
        return this.repo.findMany(clientId, buildingId);
    }
    async getFloorById(clientId, floorId) {
        const floor = await this.repo.findById(clientId, floorId);
        if (!floor) {
            throw new NotFoundError('Floor', floorId);
        }
        return floor;
    }
    async createFloor(clientId, dto) {
        await this.validateBuildingExists(clientId, dto.building_id);
        return this.repo.create(clientId, dto);
    }
    async updateFloor(clientId, floorId, dto) {
        const existing = await this.repo.findById(clientId, floorId);
        if (!existing) {
            throw new NotFoundError('Floor', floorId);
        }
        if (dto.building_id !== undefined && dto.building_id !== existing.building_id) {
            await this.validateBuildingExists(clientId, dto.building_id);
        }
        const updated = await this.repo.update(clientId, floorId, dto);
        if (!updated) {
            throw new NotFoundError('Floor', floorId);
        }
        return updated;
    }
    async deleteFloor(clientId, floorId) {
        const existing = await this.repo.findById(clientId, floorId);
        if (!existing) {
            throw new NotFoundError('Floor', floorId);
        }
        // Postgres FK constraint (floor_building_id_fkey or dependent rooms/room_types)
        // will throw 23503 and be mapped to 409 Conflict by centralized errorHandler
        await this.repo.delete(clientId, floorId);
    }
}
export const floorService = new FloorService();
