import { UserRole } from '../../generated/prisma/client.js';
export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: UserRole;
}
