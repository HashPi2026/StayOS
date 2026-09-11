import { floorRepository, FloorRepository } from './floor.repository';
import { CreateFloorDTO, FloorEntity, UpdateFloorDTO } from './floor.types';
import { buildingRepository, BuildingRepository } from '../building/building.repository';
import { NotFoundError, ValidationError } from '../../../utils/errors';

export class FloorService {
  constructor(
    private repo: FloorRepository = floorRepository,
    private buildingRepo: BuildingRepository = buildingRepository
  ) {}

  private async validateBuildingExists(clientId: string, buildingId: number): Promise<void> {
    const building = await this.buildingRepo.findById(clientId, buildingId);
    if (!building) {
      throw new ValidationError(
        `Building with ID '${buildingId}' does not exist for this property.`,
        { building_id: buildingId, client_id: clientId }
      );
    }
  }

  async listFloors(clientId: string, buildingId?: number): Promise<FloorEntity[]> {
    return this.repo.findMany(clientId, buildingId);
  }

  async getFloorById(clientId: string, floorId: number): Promise<FloorEntity> {
    const floor = await this.repo.findById(clientId, floorId);
    if (!floor) {
      throw new NotFoundError('Floor', floorId);
    }
    return floor;
  }

  async createFloor(clientId: string, dto: CreateFloorDTO): Promise<FloorEntity> {
    await this.validateBuildingExists(clientId, dto.building_id);
    return this.repo.create(clientId, dto);
  }

  async updateFloor(clientId: string, floorId: number, dto: UpdateFloorDTO): Promise<FloorEntity> {
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

  async deleteFloor(clientId: string, floorId: number): Promise<void> {
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
