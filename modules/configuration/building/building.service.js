import { buildingRepository } from './building.repository.js';
import { NotFoundError } from '../../../utils/errors.js';
export class BuildingService {
    repo;
    constructor(repo = buildingRepository) {
        this.repo = repo;
    }
    async listBuildings(clientId) {
        return this.repo.findMany(clientId);
    }
    async getBuildingById(clientId, buildingId) {
        const building = await this.repo.findById(clientId, buildingId);
        if (!building) {
            throw new NotFoundError('Building', buildingId);
        }
        return building;
    }
    async createBuilding(clientId, dto) {
        return this.repo.create(clientId, dto);
    }
    async updateBuilding(clientId, buildingId, dto) {
        const updated = await this.repo.update(clientId, buildingId, dto);
        if (!updated) {
            throw new NotFoundError('Building', buildingId);
        }
        return updated;
    }
    async deleteBuilding(clientId, buildingId) {
        const deleted = await this.repo.delete(clientId, buildingId);
        if (!deleted) {
            throw new NotFoundError('Building', buildingId);
        }
    }
}
export const buildingService = new BuildingService();
