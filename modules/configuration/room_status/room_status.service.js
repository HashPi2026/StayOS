import { roomStatusRepository } from './room_status.repository.js';
import { NotFoundError } from '../../../utils/errors.js';
export class RoomStatusService {
    repo;
    constructor(repo = roomStatusRepository) {
        this.repo = repo;
    }
    async listRoomStatuses(clientId, isActive) {
        return this.repo.findMany(clientId, isActive);
    }
    async getRoomStatusById(clientId, statusId) {
        const status = await this.repo.findById(clientId, statusId);
        if (!status) {
            throw new NotFoundError('RoomStatus', statusId);
        }
        return status;
    }
    async createRoomStatus(clientId, dto) {
        return this.repo.create(clientId, dto);
    }
    async updateRoomStatus(clientId, statusId, dto) {
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
    async deleteRoomStatus(clientId, statusId) {
        const existing = await this.repo.findById(clientId, statusId);
        if (!existing) {
            throw new NotFoundError('RoomStatus', statusId);
        }
        await this.repo.softDelete(clientId, statusId);
    }
}
export const roomStatusService = new RoomStatusService();
