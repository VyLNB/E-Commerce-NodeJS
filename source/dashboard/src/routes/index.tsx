import { createBrowserRouter, Navigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/auth/Login";
import UsersPage from "../pages/user/UsersPage";
import UserDetailPageWrapper from "../pages/user/UserDetailPageWrapper";
import ProtectedRoute from "./ProtectedRoute";
import AdminProfilePage from "../pages/profile/AdminProfilePage";
import OrderPage from "../pages/order/OrderPage";
import OrderDetail from "../pages/order/OrderDetail";
import {AddProductPage, ProductDetailPage, ProductsPage} from "../pages/Product";
import {AddCategoryPage, CategoryDetail, CategoryPage} from "../pages/category";
import {BrandPage, BrandDetail, AddBrandPage} from "../pages/brand";
import {DiscountPage, DiscountDetail, AddDiscountPage} from "../pages/discounts";


const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="home" replace />,
      },
      {
        path: "home",
        element: <Dashboard />,
      },
      {
        path: "me",
        element: <AdminProfilePage />,
      },
      {
        path: "users",
        children: [
          {
            index: true,
            element: <UsersPage />,
            handle: { searchLabel: "Tìm kiếm theo tên hoặc email" },
          },

          {
            path: ":id",
            element: <UserDetailPageWrapper />,
          },
        ],
      },
      {
        path: "products",
        children: [
          {
            index: true,
            element: <ProductsPage />,
            handle: { searchLabel: "Search Product" },
          },
          {
            path: "add",
            element: <AddProductPage />,
          },
          {
            path: ":id",
            element: <ProductDetailPage />,
          },
        ],
      },
      {
        path: "categories",
        children: [
          {
            index: true,
            element: <CategoryPage />,
            handle: { searchLabel: "Search Product" },
          },
          {
            path: ":id",
            element: <CategoryDetail/>,
          },
          {
            path: "add",
            element: <AddCategoryPage />,
          }
        ],
      },
      {
        path: "brands",
        children: [
          {
            index: true,
            element: <BrandPage />,
            handle: { searchLabel: "Search Brand" },
          },
          {
            path: ":id",
            element: <BrandDetail/>,
          }, 
          {
            path: "add",
            element: <AddBrandPage />,
          }
        ]
      },
      {
        path: "orders",
        children: [
          {
            index: true,
            element: <OrderPage/>
          }, 
          {
            path: ":id",
            element: <OrderDetail/>
          }
        ]
      },
      {
        path: "discounts",
        children: [
          {
            index: true,
            element: <DiscountPage/>
          }, 
          {
            path: ":id",
            element: <DiscountDetail/>
          },
          {
            path: "add",
            element: <AddDiscountPage/>
          }
        ]
      }
    ],
  },
  {
    path: "*",
    element: <div>404 Not Found</div>,
  },
]);

export default router;
