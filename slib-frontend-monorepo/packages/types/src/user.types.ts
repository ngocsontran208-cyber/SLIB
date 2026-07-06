export interface User {
  id: number;
  username: string;
  passwordHash: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
  isActive: boolean;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
}

export interface UserClaim {
  id: number;
  userId: number;
  claimType: string;
  claimValue: string;
}
