import type { StandardApiResponse } from "../admin";
import type {CategoryItem} from "../../interface/categoryInterface"
import type { CategoryResponse } from "../category";

// mock dữ liệu Category
const mockCategory: CategoryItem[] = [
    {
    id: "64f8a1b2c3d4e5f6a7b8c9d4",
    name: "Electronics",
    slug: "electronics",
    logoURL: "https://cdn.example.com/electronics-icon.png",
    description: "Electronic devices and accessories",
    parentCategoryID: "",
    isActive: true,
    sortOrder: 1,
    path: "Electronics",
    level: 0,
    children: [
      {
        id: "64f8a1b2c3d4e5f6a7b8c9d7",
        name: "Audio",
        slug: "audio",
        logoURL: "https://cdn.example.com/audio-icon.png",
        description: "Audio devices and equipment",
        parentCategoryID: "64f8a1b2c3d4e5f6a7b8c9d4",
        isActive: true,
        sortOrder: 1,
        path: "Electronics > Audio",
        level: 1,
        createdAt: "2025-01-01T12:00:00Z"
      },
      {
        id: "64f8a1b2c3d4e5f6a7b8c9d8",
        name: "Mobile Phones",
        slug: "mobile-phones",
        logoURL: "https://cdn.example.com/mobile-icon.png",
        description: "Smartphones and mobile accessories",
        parentCategoryID: "64f8a1b2c3d4e5f6a7b8c9d4",
        isActive: true,
        sortOrder: 2,
        path: "Electronics > Mobile Phones",
        level: 1,
        createdAt: "2025-01-01T12:30:00Z"
      }
    ],
    createdAt: "2025-01-01T12:00:00Z"
  },
  {
    id: "64f8a1b2c3d4e5f6a7b8c9d5",
    name: "Fashion",
    slug: "fashion",
    logoURL: "https://cdn.example.com/fashion-icon.png",
    description: "Clothing and fashion accessories",
    parentCategoryID: "",
    isActive: true,
    sortOrder: 2,
    path: "Fashion",
    level: 0,
    children: [
      {
        id: "64f8a1b2c3d4e5f6a7b8c9d9",
        name: "Men's Clothing",
        slug: "mens-clothing",
        logoURL: "https://cdn.example.com/mens-clothing-icon.png",
        description: "Men's fashion and clothing",
        parentCategoryID: "64f8a1b2c3d4e5f6a7b8c9d5",
        isActive: true,
        sortOrder: 1,
        path: "Fashion > Men's Clothing",
        level: 1,
        createdAt: "2025-01-01T13:00:00Z"
      },
      {
        id: "64f8a1b2c3d4e5f6a7b8c9da",
        name: "Women's Clothing",
        slug: "womens-clothing",
        logoURL: "https://cdn.example.com/womens-clothing-icon.png",
        description: "Women's fashion and clothing",
        parentCategoryID: "64f8a1b2c3d4e5f6a7b8c9d5",
        isActive: true,
        sortOrder: 2,
        path: "Fashion > Women's Clothing",
        level: 1,
        createdAt: "2025-01-01T13:15:00Z"
      }
    ],
    createdAt: "2025-01-01T13:00:00Z"
  },
  {
    id: "64f8a1b2c3d4e5f6a7b8c9d6",
    name: "Home & Garden",
    slug: "home-garden",
    logoURL: "https://cdn.example.com/home-garden-icon.png",
    description: "Home improvement and gardening supplies",
    parentCategoryID: "",
    isActive: false, // Inactive category for testing
    sortOrder: 3,
    path: "Home & Garden",
    level: 0,
    children: [],
    createdAt: "2025-01-01T14:00:00Z"
  }
]

// Mock get products
export async function getCategoriesMock(): Promise<StandardApiResponse<CategoryItem[]>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: mockCategory
      });
    }, 300);
  });
}

// Mock delete category
export async function deleteCategoryMock(categoryID: string): Promise<CategoryResponse> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Tìm danh mục cần xóa
      const categoryExists = mockCategory.some(
        (cat) => cat.id === categoryID || cat.children?.some((child) => child.id === categoryID)
      );

      if (!categoryExists) {
        reject({
          success: false,
          message: `Danh mục với ID ${categoryID} không tồn tại`,
          category: mockCategory,
        });
        return;
      }

      // Lọc danh mục cha và danh mục con
      const updatedCategories = mockCategory
        .map((cat) => {
          if (cat.id === categoryID) {
            return null; // Xóa danh mục cha
          }
          if (cat.children) {
            return {
              ...cat,
              children: cat.children.filter((child) => child.id !== categoryID),
            };
          }
          return cat;
        })
        .filter((cat) => cat !== null) as CategoryItem[];

      // Cập nhật mảng mockCategory
      mockCategory.length = 0;
      mockCategory.push(...updatedCategories);

      resolve({
        success: true,
        message: "Xóa danh mục thành công",
        category: updatedCategories,
      });
    }, 300);
  });
}