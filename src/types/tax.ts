export interface TaxSlab {
  id: string;
  fromAmount: number;
  toAmount: number | null;
  ratePercentage: number;
  description?: string;
}

export interface TaxItem {
  id: string;
  name: string;
  code?: string;
  description?: string;
  taxType: 'GST' | 'VAT' | 'Service Tax' | 'Luxury Tax' | 'City Tax' | 'Environmental Fee' | string;
  ruleType?: 'percentage' | 'fixed';
  value?: number;
  applicationMethod?: 'per_night' | 'per_person_night' | 'per_stay' | 'per_item' | string;
  calculationStrategy?: 'per-day' | 'per-stay' | 'percentage';
  isActive: boolean;
  configsCount?: number;
  jurisdiction?: string;
  slabs?: TaxSlab[];
  applicableTo?: 'all-rooms' | 'specific-rooms' | 'food-beverage' | 'all-services';
  effectiveDate?: string;
  fromDate?: string;
  lastDate?: string;
  ratePercentage?: number;
  createdAt?: string;
  updatedAt?: string;
}
