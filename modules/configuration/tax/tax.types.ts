export interface TaxEntity {
  tax_id: number;
  client_id: string;
  tax_name: string;
  tax_type: string | null;
  per_day_tax: boolean;
  per_stay_tax: boolean;
  is_active: boolean;
  configurations?: TaxConfigurationEntity[];
}

export interface CreateTaxDTO {
  tax_name: string;
  tax_type?: string | null;
  per_day_tax: boolean;
  per_stay_tax: boolean;
  is_active?: boolean;
}

export interface UpdateTaxDTO {
  tax_name?: string;
  tax_type?: string | null;
  per_day_tax?: boolean;
  per_stay_tax?: boolean;
  is_active?: boolean;
}

export interface TaxConfigurationEntity {
  tax_config_id: number;
  client_id: string;
  tax_id: number;
  rate: number | string;
  from_date: string;
  last_date: string;
  is_active: boolean;
}

export interface CreateTaxConfigDTO {
  rate: number;
  from_date: string;
  last_date: string;
  is_active?: boolean;
}

export interface UpdateTaxConfigDTO {
  rate?: number;
  from_date?: string;
  last_date?: string;
  is_active?: boolean;
}
