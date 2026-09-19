import { UserRole } from '../../generated/prisma/client.js';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}
