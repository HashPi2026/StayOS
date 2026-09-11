import { buildingRepository, BuildingRepository } from './building.repository';
import { BuildingEntity, CreateBuildingDTO, UpdateBuildingDTO } from './building.types';
import { NotFoundError } from '../../../utils/errors';

export class BuildingService {
  constructor(private repo: BuildingRepository = buildingRepository) {}

  async listBuildings(clientId: string): Promise<BuildingEntity[]> {
    return this.repo.findMany(clientId);
  }

  async getBuildingById(clientId: string, buildingId: number): Promise<BuildingEntity> {
    const building = await this.repo.findById(clientId, buildingId);
    if (!building) {
      throw new NotFoundError('Building', buildingId);
    }
    return building;
  }

  async createBuilding(clientId: string, dto: CreateBuildingDTO): Promise<BuildingEntity> {
    return this.repo.create(clientId, dto);
  }

  async updateBuilding(clientId: string, buildingId: number, dto: UpdateBuildingDTO): Promise<BuildingEntity> {
    const updated = await this.repo.update(clientId, buildingId, dto);
    if (!updated) {
      throw new NotFoundError('Building', buildingId);
    }
    return updated;
  }

  async deleteBuilding(clientId: string, buildingId: number): Promise<void> {
    const deleted = await this.repo.delete(clientId, buildingId);
    if (!deleted) {
      throw new NotFoundError('Building', buildingId);
    }
  }
}

export const buildingService = new BuildingService();
