export interface AuthenticatedUser {
  id: string;
  email: string;
  userType: string;
  specialistId?: string;
  companyId?: string;
  name?: string;
  permissions?: string[];
}
