import { propertyRepository } from './property.repository.js';
export class PropertyService {
    repo;
    constructor(repo = propertyRepository) {
        this.repo = repo;
    }
    async getProperty(clientId) {
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
    async upsertProperty(clientId, dto) {
        return this.repo.upsert(clientId, dto);
    }
}
export const propertyService = new PropertyService();
