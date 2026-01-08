import type { StandardApiResponse } from "../admin";
import type { ProductItem } from "../../interface/productInterface";

// mock dữ liệu Products
const mockProducts: ProductItem[] = [
    {
        id: '64f8a1b2c3d4e5f6a7b8c9d2',
        name: 'Wireless Headphones',
        basePrice: 299.99,
        brand: 'Sony',
        caterogy: 'Electronics',
        description: 'Premium noise-canceling headphones',
        status: 'active',
        img: [
        {
            id: '64f8a1b2c3d4e5f6a7b8c9d6',
            url: 'https://th.bing.com/th/id/OIF.zMw3kVH4sAhBJuwU5YXTTA?w=184&h=184&c=7&r=0&o=5&pid=1.7',
            altText: 'Sony XM4 Headphones'
        }
        ],
        variant: [
        {
            id: '64f8a1b2c3d4e5f6a7b8c9d5',
            attributes: [
            {
                color: 'Black',
                size: 'Standard'
            }
            ],
            priceAdjustment: 0.00,
            status: 'active'
        }
        ],
        pagination: []
    }
]

// Mock get products
export async function getProductsMock(): Promise<StandardApiResponse<ProductItem[]>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: mockProducts
      });
    }, 300);
  });
}