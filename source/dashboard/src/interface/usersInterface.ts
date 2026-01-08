export interface UserItem {
    _id: string;
    email: string;
    avatar?: string;
    fullName: string;
    loyaltyPoints: number;
    status: "active" | "inactive" | "suspended";
    role: "admin" | "customer";
    createdAt: Date;
    updatedAt: Date;
}

export interface PaginationInfo {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface UsersQueryParams {
    page?: number;
    limit?: number;
    q?: string;
    sort_by?: string;
}