export type UserRole = 'admin' | 'manager' | 'cashier' | 'warehouse';

export interface Profile {
  user_id: string;
  role: UserRole;
  branch_id: number | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  citizen_id: string | null;
  created_at: string;
}