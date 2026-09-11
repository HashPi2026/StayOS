import { roomRepository, RoomRepository } from './room.repository';
import { CreateRoomDTO, RoomEntity, UpdateRoomDTO } from './room.types';
import { floorRepository, FloorRepository } from '../floor/floor.repository';
import { roomTypeRepository, RoomTypeRepository } from '../room_type/room_type.repository';
import { NotFoundError, ValidationError } from '../../../utils/errors';

export class RoomService {
  constructor(
    private repo: RoomRepository = roomRepository,
    private floorRepo: FloorRepository = floorRepository,
    private roomTypeRepo: RoomTypeRepository = roomTypeRepository
  ) {}

  /**
   * Validate that room_type_id, floor_id, and building_id all belong to the same hierarchy chain.
   */
  private async validateHierarchy(
    clientId: string,
    buildingId: number,
    floorId: number,
    roomTypeId: number
  ): Promise<void> {
    const floor = await this.floorRepo.findById(clientId, floorId);
    if (!floor) {
      throw new ValidationError(
        `Floor with ID '${floorId}' does not exist for this property.`,
        { floor_id: floorId, client_id: clientId }
      );
    }

    if (floor.building_id !== buildingId) {
      throw new ValidationError(
        `Invalid hierarchy: floor_id ${floorId} belongs to building_id ${floor.building_id}, not building_id ${buildingId}.`,
        {
          floor_id: floorId,
          submitted_building_id: buildingId,
          actual_building_id: floor.building_id,
        }
      );
    }

    const roomType = await this.roomTypeRepo.findById(clientId, roomTypeId);
    if (!roomType) {
      throw new ValidationError(
        `Room Type with ID '${roomTypeId}' does not exist for this property.`,
        { room_type_id: roomTypeId, client_id: clientId }
      );
    }

    if (roomType.building_id !== buildingId) {
      throw new ValidationError(
        `Invalid hierarchy: room_type_id ${roomTypeId} belongs to building_id ${roomType.building_id}, not building_id ${buildingId}.`,
        {
          room_type_id: roomTypeId,
          submitted_building_id: buildingId,
          actual_building_id: roomType.building_id,
        }
      );
    }

    if (roomType.floor_id !== floorId) {
      throw new ValidationError(
        `Invalid hierarchy: room_type_id ${roomTypeId} belongs to floor_id ${roomType.floor_id}, not floor_id ${floorId}.`,
        {
          room_type_id: roomTypeId,
          submitted_floor_id: floorId,
          actual_floor_id: roomType.floor_id,
        }
      );
    }
  }

  async listRooms(
    clientId: string,
    filters?: { building_id?: number; floor_id?: number; room_type_id?: number }
  ): Promise<RoomEntity[]> {
    return this.repo.findMany(clientId, filters);
  }

  async getRoomById(clientId: string, roomId: number): Promise<RoomEntity> {
    const room = await this.repo.findById(clientId, roomId);
    if (!room) {
      throw new NotFoundError('Room', roomId);
    }
    return room;
  }

  async createRoom(clientId: string, dto: CreateRoomDTO): Promise<RoomEntity> {
    await this.validateHierarchy(clientId, dto.building_id, dto.floor_id, dto.room_type_id);
    return this.repo.create(clientId, dto);
  }

  async updateRoom(clientId: string, roomId: number, dto: UpdateRoomDTO): Promise<RoomEntity> {
    const existing = await this.repo.findById(clientId, roomId);
    if (!existing) {
      throw new NotFoundError('Room', roomId);
    }

    const effectiveBuildingId = dto.building_id ?? existing.building_id;
    const effectiveFloorId = dto.floor_id ?? existing.floor_id;
    const effectiveRoomTypeId = dto.room_type_id ?? existing.room_type_id;

    if (
      effectiveBuildingId !== existing.building_id ||
      effectiveFloorId !== existing.floor_id ||
      effectiveRoomTypeId !== existing.room_type_id
    ) {
      await this.validateHierarchy(clientId, effectiveBuildingId, effectiveFloorId, effectiveRoomTypeId);
    }

    const updated = await this.repo.update(clientId, roomId, dto);
    if (!updated) {
      throw new NotFoundError('Room', roomId);
    }
    return updated;
  }

  async deleteRoom(clientId: string, roomId: number): Promise<void> {
    const existing = await this.repo.findById(clientId, roomId);
    if (!existing) {
      throw new NotFoundError('Room', roomId);
    }

    // TODO: Reservation-history checking is not yet implemented (Reservation module doesn't exist yet).
    // Currently only database-level FK constraints (e.g. room_status dependency) prevent deletion.
    // Revisit once Reservation is built to check active or historic reservations before deleting.
    await this.repo.delete(clientId, roomId);
  }
}

export const roomService = new RoomService();
