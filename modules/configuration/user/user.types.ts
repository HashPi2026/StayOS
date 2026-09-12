export interface UserEntity {
  user_id: number;
  client_id: string;
  role_id: number;
  role_name?: string;
  role_code?: string;
  role_type?: string;
  user_name: string;
  description: string | null;
  is_active: boolean;
  phone: string | null;
  department: string | null;
  avatar_url: string | null;
  initials: string | null;
  username?: string;
  email?: string;
  login_email?: string;
  last_login_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CreateUserDTO {
  user_name: string;
  email: string;
  username?: string;
  role_id?: number;
  role_name?: string;
  description?: string;
  is_active?: boolean;
  phone?: string;
  department?: string;
  avatar_url?: string;
  initials?: string;
  password?: string;
}

export interface UpdateUserDTO {
  user_name?: string;
  email?: string;
  username?: string;
  role_id?: number;
  role_name?: string;
  description?: string;
  is_active?: boolean;
  phone?: string;
  department?: string;
  avatar_url?: string;
  initials?: string;
}
