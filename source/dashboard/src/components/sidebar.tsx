import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Menu,
  Package,
  Receipt,
  ShoppingCart,
  UserCircle,
  Users,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  subItem?: {
    id: string;
    label: string;
  }[];
}

const Sidebar: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const location = useLocation();

  // Tự động mở dropdown nếu đang ở trang con của nó
  useEffect(() => {
    const currentPath = location.pathname;
    if (
      currentPath.includes("/admin/products") ||
      currentPath.includes("/admin/categories") ||
      currentPath.includes("/admin/brands")
    ) {
      setOpenDropdownId("products");
    }
  }, [location.pathname]);

  const menuItems: MenuItem[] = [
    {
      id: "dashboard",
      label: "Bảng điều khiển",
      icon: <LayoutDashboard size={20} />,
    },
    {
      id: "users",
      label: "Khách hàng",
      icon: <Users size={20} />,
    },
    {
      id: "products",
      label: "Sản phẩm",
      icon: <Package size={20} />,
      subItem: [
        { id: "products", label: "Danh sách sản phẩm" },
        { id: "categories", label: "Quản lý danh mục" },
        { id: "brands", label: "Quản lý thương hiệu" },
      ],
    },
    {
      id: "orders",
      label: "Đơn hàng",
      icon: <ShoppingCart size={20} />,
    },
    {
      id: "discounts",
      label: "Mã khuyến mãi",
      icon: <Receipt size={20} />,
    },
  ];

  const otherItems: MenuItem[] = [
    {
      id: "me",
      label: "Tài khoản",
      icon: <UserCircle size={20} />,
    },
  ];

  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);
  const closeMobileSidebar = () => setIsMobileOpen(false);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const handleDropdownToggle = (id: string) => {
    if (isCollapsed) {
      setIsCollapsed(false); // Tự động mở rộng nếu click vào menu có dropdown khi đang collapsed
      setTimeout(
        () => setOpenDropdownId(openDropdownId === id ? null : id),
        150
      );
    } else {
      setOpenDropdownId(openDropdownId === id ? null : id);
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleMobileSidebar}
        className="text-sm lg:hidden fixed top-4 left-4 z-50 p-2 bg-teal-500 text-white rounded-lg shadow-lg hover:bg-teal-600 transition-colors"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          flex flex-col bg-teal-500 text-white
          transition-all duration-300 ease-in-out
          ${
            isMobileOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
          ${isCollapsed ? "lg:w-20" : "lg:w-60"}
          w-72 // Width mặc định trên mobile
        `}
      >
        {/* Header & Toggle Button */}
        <div
          className={`flex items-center h-16 px-4 border-b border-teal-400 ${
            isCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          {!isCollapsed && (
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-teal-600 font-bold text-xl">G</span>
              </div>
              <span className="font-bold text-xl truncate">Gear-Up</span>
            </div>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-teal-600 font-bold text-xl">G</span>
            </div>
          )}

          {/* Desktop Collapse Button */}
          <button
            onClick={toggleCollapse}
            className="hidden lg:flex p-1.5 rounded-md hover:bg-teal-600 transition-colors absolute -right-3 top-5 bg-teal-500 border border-teal-400 shadow-sm"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight size={16} />
            ) : (
              <ChevronLeft size={16} />
            )}
          </button>
        </div>

        {/* Menu Items */}
        <div className="text-sm flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-teal-600 scrollbar-track-transparent">
          {/* Main Navigation */}
          <nav className="px-3 space-y-1">
            {menuItems.map((item) => (
              <div key={item.id}>
                {item.subItem ? (
                  /* Dropdown Menu Item */
                  <div>
                    <button
                      onClick={() => handleDropdownToggle(item.id)}
                      className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-colors duration-200
                        ${
                          openDropdownId === item.id
                            ? "bg-teal-600"
                            : "hover:bg-teal-400/50"
                        }
                        ${isCollapsed ? "justify-center" : "justify-between"}
                      `}
                      title={isCollapsed ? item.label : ""}
                    >
                      <div
                        className={`flex items-center ${
                          isCollapsed ? "" : "space-x-3"
                        }`}
                      >
                        <span className="flex-shrink-0">{item.icon}</span>
                        {!isCollapsed && (
                          <span className="font-medium truncate ml-3">
                            {item.label}
                          </span>
                        )}
                      </div>
                      {!isCollapsed && (
                        <span className="ml-auto">
                          {openDropdownId === item.id ? (
                            <ChevronDown size={18} />
                          ) : (
                            <ChevronRight size={18} />
                          )}
                        </span>
                      )}
                    </button>

                    {/* Sub-menu */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        openDropdownId === item.id && !isCollapsed
                          ? "max-h-96 opacity-100 mt-1"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="bg-teal-600/30 rounded-lg mt-1 py-1">
                        {item.subItem.map((sub) => (
                          <NavLink
                            key={sub.id}
                            to={`/admin/${sub.id}`}
                            onClick={closeMobileSidebar}
                            className={({ isActive }) =>
                              `block pl-11 pr-3 py-2 text-sm rounded-md transition-colors truncate
                                ${
                                  isActive
                                    ? "text-white font-medium bg-teal-600/50"
                                    : "text-teal-100 hover:text-white hover:bg-teal-600/30"
                                }
                                `
                            }
                          >
                            {sub.label}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Normal Menu Item */
                  <NavLink
                    to={
                      item.id === "dashboard"
                        ? "/admin/home"
                        : `/admin/${item.id}`
                    }
                    end={item.id === "dashboard"}
                    onClick={closeMobileSidebar}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2.5 rounded-lg transition-colors duration-200
                       ${isActive ? "bg-teal-600" : "hover:bg-teal-400/50"}
                       ${isCollapsed ? "justify-center" : ""}
                      `
                    }
                    title={isCollapsed ? item.label : ""}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {!isCollapsed && (
                      <span className="font-medium truncate ml-3">
                        {item.label}
                      </span>
                    )}
                  </NavLink>
                )}
              </div>
            ))}
          </nav>

          {/* Divider */}
          {!isCollapsed && (
            <div className="px-6 my-6">
              <div className="h-px bg-teal-400"></div>
              <span className="block text-xs font-semibold text-teal-200 mt-4 uppercase tracking-wider">
                Khác
              </span>
            </div>
          )}
          {isCollapsed && <div className="my-4 h-px bg-teal-400 mx-4"></div>}

          {/* Other Items */}
          <nav className="px-3 space-y-1">
            {otherItems.map((item) => (
              <NavLink
                key={item.id}
                to={`/admin/${item.id}`}
                onClick={closeMobileSidebar}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-lg transition-colors duration-200
                   ${isActive ? "bg-teal-600" : "hover:bg-teal-400/50"}
                   ${isCollapsed ? "justify-center" : ""}
                  `
                }
                title={isCollapsed ? item.label : ""}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!isCollapsed && (
                  <span className="font-medium truncate ml-3">
                    {item.label}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer User Info (Optional) */}
        {!isCollapsed && (
          <div className="p-4 border-t border-teal-400 bg-teal-600/20">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-teal-300 flex items-center justify-center">
                <UserCircle size={20} className="text-teal-700" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">Admin User</p>
                <p className="text-xs text-teal-200 truncate">
                  admin@gearup.com
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;
