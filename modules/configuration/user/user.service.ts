import { UserRepository } from './user.repository';
import { CreateUserDTO, UpdateUserDTO, UserEntity } from './user.types';
import { NotFoundError, ValidationError } from '../../../utils/errors';

export class UserService {
  constructor(private repo: UserRepository = new UserRepository()) {}

  async getUsers(clientId: string): Promise<UserEntity[]> {
    return this.repo.findMany(clientId);
  }

  async getUserById(clientId: string, userId: number): Promise<UserEntity> {
    const user = await this.repo.findById(clientId, userId);
    if (!user) {
      throw new NotFoundError(`User with ID ${userId} not found for property ${clientId}`);
    }
    return user;
  }

  async createUser(clientId: string, data: CreateUserDTO): Promise<UserEntity> {
    if (!data.user_name || !data.user_name.trim()) {
      throw new ValidationError('user_name is required');
    }
    if (!data.email || !data.email.trim()) {
      throw new ValidationError('email is required');
    }
    return this.repo.create(clientId, data);
  }

  async updateUser(clientId: string, userId: number, data: UpdateUserDTO): Promise<UserEntity> {
    const updated = await this.repo.update(clientId, userId, data);
    if (!updated) {
      throw new NotFoundError(`User with ID ${userId} not found for property ${clientId}`);
    }
    return updated;
  }

  async toggleUserStatus(clientId: string, userId: number, isActive: boolean): Promise<UserEntity> {
    const updated = await this.repo.toggleStatus(clientId, userId, isActive);
    if (!updated) {
      throw new NotFoundError(`User with ID ${userId} not found for property ${clientId}`);
    }
    return updated;
  }

  async deleteUser(clientId: string, userId: number): Promise<void> {
    const success = await this.repo.delete(clientId, userId);
    if (!success) {
      throw new NotFoundError(`User with ID ${userId} not found for property ${clientId}`);
    }
  }
}
