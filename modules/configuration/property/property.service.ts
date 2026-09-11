import { propertyRepository, PropertyRepository } from './property.repository';
import { PropertyEntity, UpsertPropertyDTO } from './property.types';

export class PropertyService {
  constructor(private repo: PropertyRepository = propertyRepository) {}

  async getProperty(clientId: string): Promise<PropertyEntity> {
    const existing = await this.repo.findByClientId(clientId);
    if (existing) {
      return existing;
    }

    // Return sensible empty default if not yet created / provisioned
    return {
      client_id: clientId,
      property_name: '',
      region: null,
      address: null,
      city: '',
      state: '',
      url: null,
      latitude: null,
      longitude: null,
    };
  }

  async upsertProperty(clientId: string, dto: UpsertPropertyDTO): Promise<PropertyEntity> {
    return this.repo.upsert(clientId, dto);
  }
}

export const propertyService = new PropertyService();
