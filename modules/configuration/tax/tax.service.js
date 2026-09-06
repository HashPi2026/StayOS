import { taxRepository } from './tax.repository.js';
import { NotFoundError, ValidationError } from '../../../utils/errors.js';
export class TaxService {
    repo;
    constructor(repo = taxRepository) {
        this.repo = repo;
    }
    // ================= TAX =================
    async listTaxes(clientId, isActive) {
        return this.repo.findManyTaxes(clientId, isActive);
    }
    async getTaxById(clientId, taxId, includeConfigs = true) {
        const tax = await this.repo.findTaxById(clientId, taxId);
        if (!tax) {
            throw new NotFoundError('Tax', taxId);
        }
        if (includeConfigs) {
            tax.configurations = await this.repo.findConfigurationsByTaxId(clientId, taxId);
        }
        return tax;
    }
    async createTax(clientId, dto) {
        if (dto.per_day_tax === dto.per_stay_tax) {
            throw new ValidationError("Tax basis check failed: exactly one of 'per_day_tax' and 'per_stay_tax' must be true (they cannot both be true or both be false).", { per_day_tax: dto.per_day_tax, per_stay_tax: dto.per_stay_tax });
        }
        return this.repo.createTax(clientId, dto);
    }
    async updateTax(clientId, taxId, dto) {
        const existing = await this.repo.findTaxById(clientId, taxId);
        if (!existing) {
            throw new NotFoundError('Tax', taxId);
        }
        const effectivePerDay = dto.per_day_tax !== undefined ? dto.per_day_tax : existing.per_day_tax;
        const effectivePerStay = dto.per_stay_tax !== undefined ? dto.per_stay_tax : existing.per_stay_tax;
        if (effectivePerDay === effectivePerStay) {
            throw new ValidationError("Tax basis check failed: exactly one of 'per_day_tax' and 'per_stay_tax' must be true.", { per_day_tax: effectivePerDay, per_stay_tax: effectivePerStay });
        }
        const updated = await this.repo.updateTax(clientId, taxId, dto);
        if (!updated) {
            throw new NotFoundError('Tax', taxId);
        }
        return updated;
    }
    async deleteTax(clientId, taxId) {
        const existing = await this.repo.findTaxById(clientId, taxId);
        if (!existing) {
            throw new NotFoundError('Tax', taxId);
        }
        // Dependent tax_configuration records will trigger Postgres FK 23503 -> 409 Conflict
        await this.repo.deleteTax(clientId, taxId);
    }
    // ================= TAX CONFIGURATION =================
    /**
     * Enforces that active date ranges for the same tax_id do not overlap.
     */
    async validateNoActiveDateOverlap(clientId, taxId, fromDate, lastDate, excludeConfigId) {
        const activeConfigs = await this.repo.findActiveConfigurations(clientId, taxId, excludeConfigId);
        for (const config of activeConfigs) {
            // Overlap condition between [fromDate, lastDate] and [config.from_date, config.last_date]
            if (fromDate <= config.last_date && config.from_date <= lastDate) {
                throw new ValidationError(`Overlapping active date range detected. The date range '${fromDate}' to '${lastDate}' overlaps with existing active tax configuration (ID: ${config.tax_config_id}, '${config.from_date}' to '${config.last_date}').`, {
                    tax_id: taxId,
                    conflicting_config_id: config.tax_config_id,
                    conflicting_from_date: config.from_date,
                    conflicting_last_date: config.last_date,
                    submitted_from_date: fromDate,
                    submitted_last_date: lastDate,
                });
            }
        }
    }
    async listConfigurations(clientId, taxId, isActive) {
        const tax = await this.repo.findTaxById(clientId, taxId);
        if (!tax) {
            throw new NotFoundError('Tax', taxId);
        }
        return this.repo.findConfigurationsByTaxId(clientId, taxId, isActive);
    }
    async getConfigurationById(clientId, taxId, configId) {
        const config = await this.repo.findConfigurationById(clientId, taxId, configId);
        if (!config) {
            throw new NotFoundError('TaxConfiguration', configId);
        }
        return config;
    }
    async createConfiguration(clientId, taxId, dto) {
        const tax = await this.repo.findTaxById(clientId, taxId);
        if (!tax) {
            throw new NotFoundError('Tax', taxId);
        }
        if (dto.from_date >= dto.last_date) {
            throw new ValidationError("'from_date' must be strictly before 'last_date'.", {
                from_date: dto.from_date,
                last_date: dto.last_date,
            });
        }
        const isActive = dto.is_active ?? true;
        if (isActive) {
            await this.validateNoActiveDateOverlap(clientId, taxId, dto.from_date, dto.last_date);
        }
        return this.repo.createConfiguration(clientId, taxId, dto);
    }
    async updateConfiguration(clientId, taxId, configId, dto) {
        const existing = await this.repo.findConfigurationById(clientId, taxId, configId);
        if (!existing) {
            throw new NotFoundError('TaxConfiguration', configId);
        }
        const effectiveFromDate = dto.from_date ?? existing.from_date;
        const effectiveLastDate = dto.last_date ?? existing.last_date;
        const effectiveIsActive = dto.is_active !== undefined ? dto.is_active : existing.is_active;
        if (effectiveFromDate >= effectiveLastDate) {
            throw new ValidationError("'from_date' must be strictly before 'last_date'.", {
                from_date: effectiveFromDate,
                last_date: effectiveLastDate,
            });
        }
        if (effectiveIsActive) {
            await this.validateNoActiveDateOverlap(clientId, taxId, effectiveFromDate, effectiveLastDate, configId);
        }
        const updated = await this.repo.updateConfiguration(clientId, taxId, configId, dto);
        if (!updated) {
            throw new NotFoundError('TaxConfiguration', configId);
        }
        return updated;
    }
    async deleteConfiguration(clientId, taxId, configId) {
        const existing = await this.repo.findConfigurationById(clientId, taxId, configId);
        if (!existing) {
            throw new NotFoundError('TaxConfiguration', configId);
        }
        await this.repo.deleteConfiguration(clientId, taxId, configId);
    }
}
export const taxService = new TaxService();
