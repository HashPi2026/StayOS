import { userRepository } from './user.repository.js';
import { NotFoundError, ValidationError } from '../../../utils/errors.js';

export class UserService {
  constructor(repo = userRepository) {
    this.repo = repo;
  }

  async getUsers(clientId) {
    return this.repo.findMany(clientId);
  }

  async getUserById(clientId, userId) {
    const user = await this.repo.findById(clientId, userId);
    if (!user) {
      throw new NotFoundError(`User with ID ${userId} not found for property ${clientId}`);
    }
    return user;
  }

  async createUser(clientId, data) {
    if (!data.user_name || !data.user_name.trim()) {
      throw new ValidationError('user_name is required');
    }
    if (!data.email || !data.email.trim()) {
      throw new ValidationError('email is required');
    }
    return this.repo.create(clientId, data);
  }

  async updateUser(clientId, userId, data) {
    const updated = await this.repo.update(clientId, userId, data);
    if (!updated) {
      throw new NotFoundError(`User with ID ${userId} not found for property ${clientId}`);
    }
    return updated;
  }

  async toggleUserStatus(clientId, userId, isActive) {
    const updated = await this.repo.toggleStatus(clientId, userId, isActive);
    if (!updated) {
      throw new NotFoundError(`User with ID ${userId} not found for property ${clientId}`);
    }
    return updated;
  }

  async deleteUser(clientId, userId) {
    const success = await this.repo.delete(clientId, userId);
    if (!success) {
      throw new NotFoundError(`User with ID ${userId} not found for property ${clientId}`);
    }
  }
}

export const userService = new UserService();
