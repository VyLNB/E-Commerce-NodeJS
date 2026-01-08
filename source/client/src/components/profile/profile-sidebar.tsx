"use client";

import clsx from "clsx";
import {
  CreditCardIcon,
  HandbagIcon,
  LockIcon,
  MapPinnedIcon,
  UserIcon,
} from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {};

const sideNavItems = [
  {
    href: "/profile",
    title: "Thông tin tài khoản",
    leftIcon: <UserIcon size={20} />,
  },
  {
    href: "/profile/orders",
    title: "Danh sách đơn hàng",
    leftIcon: <HandbagIcon size={20} />,
  },
  {
    href: "/profile/addresses",
    title: "Sổ địa chỉ",
    leftIcon: <MapPinnedIcon size={20} />,
  },
  {
    href: "/profile/security",
    title: "Thông tin bảo mật",
    leftIcon: <LockIcon size={20} />,
  },
  {
    href: "/profile/payment",
    title: "Phương thức thanh toán",
    leftIcon: <CreditCardIcon size={20} />,
  },
];

const ProfileSidebar = (props: Props) => {
  const pathname = usePathname();

  return (
    <aside className="w-64 z-10 fixed bg-white rounded-xl shadow-lg text-gray-500 overflow-hidden">
      <nav>
        <ul>
          {sideNavItems.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={clsx(
                  "flex p-4 items-center gap-3 hover:text-gray-900 hover:bg-gray-100 transition-colors ease-in-out",
                  {
                    "text-blue-600 bg-blue-50 font-semibold":
                      pathname === link.href,
                    "text-gray-600": pathname !== link.href,
                  }
                )}
              >
                {link?.leftIcon}
                {link.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default ProfileSidebar;
