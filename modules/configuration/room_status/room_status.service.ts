import { roomStatusRepository, RoomStatusRepository } from './room_status.repository';
import { CreateRoomStatusDTO, RoomStatusEntity, UpdateRoomStatusDTO } from './room_status.types';
import { NotFoundError } from '../../../utils/errors';

export class RoomStatusService {
  constructor(private repo: RoomStatusRepository = roomStatusRepository) {}

  async listRoomStatuses(clientId: string, isActive?: boolean): Promise<RoomStatusEntity[]> {
    return this.repo.findMany(clientId, isActive);
  }

  async getRoomStatusById(clientId: string, statusId: number): Promise<RoomStatusEntity> {
    const status = await this.repo.findById(clientId, statusId);
    if (!status) {
      throw new NotFoundError('RoomStatus', statusId);
    }
    return status;
  }

  async createRoomStatus(clientId: string, dto: CreateRoomStatusDTO): Promise<RoomStatusEntity> {
    return this.repo.create(clientId, dto);
  }

  async updateRoomStatus(clientId: string, statusId: number, dto: UpdateRoomStatusDTO): Promise<RoomStatusEntity> {
    const existing = await this.repo.findById(clientId, statusId);
    if (!existing) {
      throw new NotFoundError('RoomStatus', statusId);
    }

    const updated = await this.repo.update(clientId, statusId, dto);
    if (!updated) {
      throw new NotFoundError('RoomStatus', statusId);
    }
    return updated;
  }

  /**
   * Soft-delete: Sets is_active = false for this catalogue entry.
   */
  async deleteRoomStatus(clientId: string, statusId: number): Promise<void> {
    const existing = await this.repo.findById(clientId, statusId);
    if (!existing) {
      throw new NotFoundError('RoomStatus', statusId);
    }

    await this.repo.softDelete(clientId, statusId);
  }
}

export const roomStatusService = new RoomStatusService();
