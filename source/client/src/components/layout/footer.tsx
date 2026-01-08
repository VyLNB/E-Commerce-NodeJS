import React from "react";
import {
  FacebookIcon,
  InstagramIcon,
  LocationIcon,
  TiktokIcon,
} from "@/public/icons";
import Twitch from "@/public/icons/Twitch";

type Props = {};

export default function footer({}: Props) {
  return (
    <footer className="bg-black text-gray-300 py-10 lg:py-16">
      <div className="container mx-auto px-4 md:px-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="col-span-1">
            <h2 className="text-2xl font-bold text-white mb-4">GearUp</h2>
            <div className="space-y-4">
              <h3 className="text-white text-lg">Subscribe</h3>
              <p className="text-sm">Get 10% off your first order</p>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full bg-transparent border-b border-gray-600 focus:border-white focus:outline-none py-2 pr-10 text-white"
                />
                <button className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500">
                  <LocationIcon size={24} />
                </button>
              </div>
            </div>
          </div>

          <div className="col-span-1">
            <h3 className="text-lg font-semibold text-white mb-4">Support</h3>
            <div className="space-y-4">
              <p className="text-sm">TDTU, Nguyen Huu Tho, District 7, HCMC</p>
              <a
                href="mailto:tatu@gmail.com"
                className="block text-sm mt-2 hover:text-red-500 transition-colors"
              >
                gearup-support@tdtu.edu.vn
              </a>
              <a
                href="tel:+8801588889999"
                className="block text-sm mt-1 hover:text-red-500 transition-colors"
              >
                +88015-8888-9999
              </a>
            </div>
          </div>

          <div className="col-span-1">
            <h3 className="text-lg font-semibold text-white mb-4">Account</h3>
            <ul className="space-y-4 text-sm">
              <li>
                <a href="#" className="hover:text-red-500 transition-colors">
                  My Account
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-500 transition-colors">
                  Login / Register
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-500 transition-colors">
                  Cart
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-500 transition-colors">
                  Wishlist
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-500 transition-colors">
                  Shop
                </a>
              </li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-lg font-semibold text-white mb-4">
              Quick Link
            </h3>
            <ul className="space-y-4 text-sm">
              <li>
                <a href="#" className="hover:text-red-500 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-500 transition-colors">
                  Terms Of Use
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-500 transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-500 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-lg font-semibold text-white mb-4">
              Social Link
            </h3>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-red-500 transition-colors">
                <FacebookIcon />
              </a>
              <a href="#" className="hover:text-red-500 transition-colors">
                <Twitch />
              </a>
              <a href="#" className="hover:text-red-500 transition-colors">
                <InstagramIcon />
              </a>
              <a href="#" className="hover:text-red-500 transition-colors">
                <TiktokIcon />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
          &copy; Copyright GearUp 2025. All right reserved
        </div>
      </div>
    </footer>
  );
}
