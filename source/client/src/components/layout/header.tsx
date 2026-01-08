"use client";
import { getCurrentUser, logout } from "@/api/auth";
import { getCartServer } from "@/api/cart";
import { useDebounce } from "@/hooks";
import { setCart } from "@/lib/features/cart-slice";
import { clearCredentials, setCredentials } from "@/lib/features/user-slice";
import { useAppDispatch, useAppSelector, useImageFallback } from "@/lib/hooks";
import { Menu, Search, User } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Dropdown from "./dropdown";
import DropdownSearch from "./dropdown-search";

// Chỉ load code của CartPopup khi user hover/click, không load lúc đầu
const CartPopup = dynamic(() => import("../cart/cart-popup"), {
  ssr: false, // Component này không cần render ở server
  loading: () => <div className="w-8 h-8"></div>, // Placeholder
});

type Props = {};

export default function Header({}: Props) {
  const { isAuthenticated, fullName, avatar } = useAppSelector(
    (state) => state.user
  );
  const cartItems = useAppSelector((state) => state.cart.items);
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const router = useRouter();
  const { imgSrc, onError } = useImageFallback(avatar, "/user-placeholder.png");

  // Load Cart lúc khởi động
  useEffect(() => {
    const restoreSession = async () => {
      // ... (logic restore user cũ giữ nguyên)

      // LOGIC CART MỚI
      if (isAuthenticated) {
        // Nếu là User: Lấy từ Server
        try {
          const serverCart = await getCartServer();
          dispatch(setCart(serverCart));
        } catch (error) {
          console.error("Failed to fetch server cart");
        }
      } else {
        // Nếu là Guest: Lấy từ LocalStorage
        const storedCart = localStorage.getItem("guest_cart");
        if (storedCart) {
          try {
            const parsedCart = JSON.parse(storedCart);
            dispatch(setCart(parsedCart));
          } catch (e) {
            console.error("Error parsing guest cart");
          }
        }
      }
    };
    restoreSession();
  }, [dispatch, isAuthenticated]);

  // Sync Cart -> LocalStorage (Chỉ cho Guest)
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem("guest_cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated]);

  useEffect(() => {
    const restoreSession = async () => {
      if (!isAuthenticated) {
        try {
          const { data: userData } = await getCurrentUser();
          if (userData) {
            dispatch(
              setCredentials({
                _id: userData._id,
                email: userData.email,
                fullName: userData.fullName,
                avatar: userData.avatar,
                loyaltyPoints: userData.loyaltyPoints,
                accessToken: userData.accessToken,
              })
            );
          }
        } catch (error) {
          console.log("No active session found or session expired.", error);
        }
      }

      // Getting cart items
      if (isAuthenticated) {
        try {
          const serverCart = await getCartServer();
          dispatch(setCart(serverCart));
        } catch (error) {
          console.error("Failed to fetch initial cart:", error);
        }
      }
    };

    restoreSession();
  }, [dispatch, isAuthenticated]);

  const fetchSuggestions = (term: string) => {
    if (term.trim() === "") {
      setSuggestions([]);
      return;
    }
    const mockSuggestions = [
      "Laptop Gaming",
      "Bàn phím cơ",
      "Chuột không dây",
      "Màn hình 144Hz",
      "Tai nghe Over-ear",
      "Ram DDR5 16GB",
    ].filter((s) => s.toLowerCase().includes(term.toLowerCase()));
    setSuggestions(mockSuggestions);
  };

  useEffect(() => {
    fetchSuggestions(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  const handleSearch = (term?: string) => {
    const query = term || searchTerm;
    if (query.trim() === "") return;

    setSuggestions([]); // Clear suggestions
    // Redirect to products page with 'q' param
    router.push(`/products?q=${encodeURIComponent(query.trim())}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setSearchTerm(suggestion);
    handleSearch(suggestion);
  };

  const handleLogout = async () => {
    try {
      await logout();
      dispatch(clearCredentials());
      router.push("/auth/signin");
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
      dispatch(clearCredentials());
      router.push("/auth/signin");
    }
  };

  const navItems = [
    { name: "Về chúng tôi", onClick: () => router.push("/about") },
    { name: "Liên hệ", onClick: () => router.push("/contact") },
  ];

  const userMenuItems = [
    { name: "Thông tin tài khoản", onClick: () => router.push("/profile") },
    {
      name: "Đổi mật khẩu",
      onClick: () => router.push("/auth/change-password"),
    },
    { name: "Đăng xuất", onClick: handleLogout, isForm: true },
  ];

  return (
    <header className="bg-white py-4 shadow-md">
      <div className="container mx-auto px-4 lg:px-32 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            GearUp
          </Link>
          <nav className="hidden xl:flex space-x-8 text-gray-600">
            <a href="#" className="hover:text-red-500 transition">
              Về chúng tôi
            </a>
            <a href="#" className="hover:text-red-500 transition">
              Liên hệ
            </a>
          </nav>
        </div>

        <div className="hidden xl:flex text-gray-700 relative items-center flex-grow mx-4 max-w-lg">
          <input
            type="text"
            placeholder="Bạn đang cần tìm sản phẩm nào"
            className="w-full pl-4 pr-10 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 transition focus:ring-red-300 bg-gray-100 placeholder-gray-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            onClick={() => handleSearch()}
            className="absolute right-0 top-0 mt-2 mr-3 text-gray-500 hover:text-red-400"
          >
            <Search size={24} />
          </button>
          {suggestions.length > 0 && (
            <div className="absolute top-full mt-1 w-full max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl z-50">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  className="block w-full text-left px-4 py-2 cursor-pointer hover:bg-gray-100 text-gray-800 transition"
                  onClick={() => handleSuggestionSelect(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center lg:space-x-8 text-gray-600">
          <div className="xl:hidden">
            <DropdownSearch
              placeholder="Bạn đang cần tìm sản phẩm nào"
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              suggestions={suggestions}
              onSuggestionSelect={handleSuggestionSelect}
              onSearchSubmit={() => handleSearch()}
            />
          </div>

          <div className="hidden xl:flex">
            <CartPopup />
          </div>

          {isAuthenticated ? (
            <div className="hidden xl:inline-block">
              <Dropdown
                label={fullName || "Tài khoản"}
                btnClassNames="text-gray-500 hover:text-red-500 transition cursor-pointer outline-none"
                LeftIcon={
                  <div className="rounded-full relative w-6 h-6">
                    <Image
                      src={imgSrc}
                      alt="head-user-avatar"
                      width={24}
                      height={24}
                      className="rounded-full"
                      priority
                      onError={onError}
                    />
                  </div>
                }
                items={userMenuItems}
              />
            </div>
          ) : (
            <Link
              href="/auth/signin"
              className="hidden xl:flex items-center space-x-2 hover:text-red-500 transition"
            >
              <User size={24} />
              <span className="hidden sm:block">Đăng nhập</span>
            </Link>
          )}

          <div className="xl:hidden">
            <Dropdown
              label=""
              items={
                isAuthenticated
                  ? [...navItems, ...userMenuItems]
                  : [
                      ...navItems,
                      {
                        name: "Đăng nhập",
                        onClick: () => router.push("/auth/signin"),
                      },
                    ]
              }
              RightIcon={<Menu size={24} />}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
