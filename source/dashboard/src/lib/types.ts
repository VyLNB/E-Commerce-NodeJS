export interface AuthUser {
  _id: string;
  fullName: string;
  avatar?: string;
  email: string;
  role: "admin" | "customer";
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  _id: string;
  fullName: string;
  avatar?: string;
  email: string;
  loyaltyPoints: number;
  role: "admin" | "customer";
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
