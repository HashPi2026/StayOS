import { query } from '../../../db/pool';
import {
  CreateTaxConfigDTO,
  CreateTaxDTO,
  TaxConfigurationEntity,
  TaxEntity,
  UpdateTaxConfigDTO,
  UpdateTaxDTO,
} from './tax.types';

export class TaxRepository {
  // ================= TAX =================

  async findManyTaxes(clientId: string, isActive?: boolean): Promise<TaxEntity[]> {
    let text = `
      SELECT
        tax_id,
        client_id,
        tax_name,
        tax_type,
        per_day_tax,
        per_stay_tax,
        is_active
      FROM tax
      WHERE client_id = $1
    `;
    const params: (string | boolean)[] = [clientId];

    if (isActive !== undefined) {
      text += ` AND is_active = $2`;
      params.push(isActive);
    }

    text += ` ORDER BY tax_name ASC;`;

    const res = await query<TaxEntity>(text, params);
    return res.rows;
  }

  async findTaxById(clientId: string, taxId: number): Promise<TaxEntity | null> {
    const text = `
      SELECT
        tax_id,
        client_id,
        tax_name,
        tax_type,
        per_day_tax,
        per_stay_tax,
        is_active
      FROM tax
      WHERE client_id = $1 AND tax_id = $2
      LIMIT 1;
    `;
    const res = await query<TaxEntity>(text, [clientId, taxId]);
    return res.rows[0] || null;
  }

  async createTax(clientId: string, data: CreateTaxDTO): Promise<TaxEntity> {
    const text = `
      INSERT INTO tax (
        client_id,
        tax_name,
        tax_type,
        per_day_tax,
        per_stay_tax,
        is_active
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        tax_id,
        client_id,
        tax_name,
        tax_type,
        per_day_tax,
        per_stay_tax,
        is_active;
    `;
    const values = [
      clientId,
      data.tax_name.trim(),
      data.tax_type ? data.tax_type.trim() : null,
      data.per_day_tax,
      data.per_stay_tax,
      data.is_active ?? true,
    ];
    const res = await query<TaxEntity>(text, values);
    return res.rows[0];
  }

  async updateTax(clientId: string, taxId: number, data: UpdateTaxDTO): Promise<TaxEntity | null> {
    const text = `
      UPDATE tax
      SET
        tax_name = COALESCE($3, tax_name),
        tax_type = CASE WHEN $4::boolean THEN $5 ELSE tax_type END,
        per_day_tax = COALESCE($6, per_day_tax),
        per_stay_tax = COALESCE($7, per_stay_tax),
        is_active = COALESCE($8, is_active)
      WHERE client_id = $1 AND tax_id = $2
      RETURNING
        tax_id,
        client_id,
        tax_name,
        tax_type,
        per_day_tax,
        per_stay_tax,
        is_active;
    `;
    const values = [
      clientId,
      taxId,
      data.tax_name ? data.tax_name.trim() : null,
      data.tax_type !== undefined,
      data.tax_type ? data.tax_type.trim() : null,
      data.per_day_tax ?? null,
      data.per_stay_tax ?? null,
      data.is_active ?? null,
    ];
    const res = await query<TaxEntity>(text, values);
    return res.rows[0] || null;
  }

  async deleteTax(clientId: string, taxId: number): Promise<boolean> {
    const text = `
      DELETE FROM tax
      WHERE client_id = $1 AND tax_id = $2;
    `;
    const res = await query(text, [clientId, taxId]);
    return (res.rowCount ?? 0) > 0;
  }

  // ================= TAX CONFIGURATION =================

  async findConfigurationsByTaxId(
    clientId: string,
    taxId: number,
    isActive?: boolean
  ): Promise<TaxConfigurationEntity[]> {
    let text = `
      SELECT
        tax_config_id,
        client_id,
        tax_id,
        rate,
        to_char(from_date, 'YYYY-MM-DD') AS from_date,
        to_char(last_date, 'YYYY-MM-DD') AS last_date,
        is_active
      FROM tax_configuration
      WHERE client_id = $1 AND tax_id = $2
    `;
    const params: (string | number | boolean)[] = [clientId, taxId];

    if (isActive !== undefined) {
      text += ` AND is_active = $3`;
      params.push(isActive);
    }

    text += ` ORDER BY from_date DESC;`;

    const res = await query<TaxConfigurationEntity>(text, params);
    return res.rows;
  }

  async findConfigurationById(
    clientId: string,
    taxId: number,
    configId: number
  ): Promise<TaxConfigurationEntity | null> {
    const text = `
      SELECT
        tax_config_id,
        client_id,
        tax_id,
        rate,
        to_char(from_date, 'YYYY-MM-DD') AS from_date,
        to_char(last_date, 'YYYY-MM-DD') AS last_date,
        is_active
      FROM tax_configuration
      WHERE client_id = $1 AND tax_id = $2 AND tax_config_id = $3
      LIMIT 1;
    `;
    const res = await query<TaxConfigurationEntity>(text, [clientId, taxId, configId]);
    return res.rows[0] || null;
  }

  async findActiveConfigurations(
    clientId: string,
    taxId: number,
    excludeConfigId?: number
  ): Promise<TaxConfigurationEntity[]> {
    let text = `
      SELECT
        tax_config_id,
        client_id,
        tax_id,
        rate,
        to_char(from_date, 'YYYY-MM-DD') AS from_date,
        to_char(last_date, 'YYYY-MM-DD') AS last_date,
        is_active
      FROM tax_configuration
      WHERE client_id = $1 AND tax_id = $2 AND is_active = TRUE
    `;
    const params: (string | number)[] = [clientId, taxId];

    if (excludeConfigId !== undefined) {
      text += ` AND tax_config_id <> $3`;
      params.push(excludeConfigId);
    }

    text += ` ORDER BY from_date ASC;`;

    const res = await query<TaxConfigurationEntity>(text, params);
    return res.rows;
  }

  async createConfiguration(
    clientId: string,
    taxId: number,
    data: CreateTaxConfigDTO
  ): Promise<TaxConfigurationEntity> {
    const text = `
      INSERT INTO tax_configuration (
        client_id,
        tax_id,
        rate,
        from_date,
        last_date,
        is_active
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        tax_config_id,
        client_id,
        tax_id,
        rate,
        to_char(from_date, 'YYYY-MM-DD') AS from_date,
        to_char(last_date, 'YYYY-MM-DD') AS last_date,
        is_active;
    `;
    const values = [
      clientId,
      taxId,
      data.rate,
      data.from_date,
      data.last_date,
      data.is_active ?? true,
    ];
    const res = await query<TaxConfigurationEntity>(text, values);
    return res.rows[0];
  }

  async updateConfiguration(
    clientId: string,
    taxId: number,
    configId: number,
    data: UpdateTaxConfigDTO
  ): Promise<TaxConfigurationEntity | null> {
    const text = `
      UPDATE tax_configuration
      SET
        rate = COALESCE($4, rate),
        from_date = COALESCE($5, from_date),
        last_date = COALESCE($6, last_date),
        is_active = COALESCE($7, is_active)
      WHERE client_id = $1 AND tax_id = $2 AND tax_config_id = $3
      RETURNING
        tax_config_id,
        client_id,
        tax_id,
        rate,
        to_char(from_date, 'YYYY-MM-DD') AS from_date,
        to_char(last_date, 'YYYY-MM-DD') AS last_date,
        is_active;
    `;
    const values = [
      clientId,
      taxId,
      configId,
      data.rate ?? null,
      data.from_date ?? null,
      data.last_date ?? null,
      data.is_active ?? null,
    ];
    const res = await query<TaxConfigurationEntity>(text, values);
    return res.rows[0] || null;
  }

  async deleteConfiguration(clientId: string, taxId: number, configId: number): Promise<boolean> {
    const text = `
      DELETE FROM tax_configuration
      WHERE client_id = $1 AND tax_id = $2 AND tax_config_id = $3;
    `;
    const res = await query(text, [clientId, taxId, configId]);
    return (res.rowCount ?? 0) > 0;
  }
}

export const taxRepository = new TaxRepository();
