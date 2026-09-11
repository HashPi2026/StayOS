export type RoleType =
  | 'FrontOffice'
  | 'Operations'
  | 'SuperAdmin'
  | 'Finance'
  | 'Management'
  | 'Sales'
  | 'Housekeeping'
  | 'Security';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  roleType?: string;
  avatarUrl?: string;
  initials?: string;
  department?: string;
  accessiblePropertyIds: string[];
  defaultPropertyId: string;
  status: 'active' | 'inactive';
}

export interface UserAccountItem {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  initials?: string;
  roleId: string;
  roleName: string;
  roleType: RoleType;
  lastLogin: string;
  status: 'active' | 'inactive';
  phone?: string;
  department?: string;
  description?: string;
  createdAt?: string;
}
