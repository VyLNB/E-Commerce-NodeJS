"use client";

import React from "react";
import googleIcon from "@/public/images/icon-google.png";
import Image from "next/image";

type Props = {};

export default function SocialAuth({}: Props) {
  const serverHost = process.env.NEXT_PUBLIC_SERVER_HOST || "http://localhost";
  const serverPort = process.env.NEXT_PUBLIC_SERVER_PORT || 5000;
  const apiVersion = process.env.NEXT_PUBLIC_API_VERSION || "v1";

  const googleLoginUrl = `${serverHost}:${serverPort}/${apiVersion}/users/login/google`;

  const handleGoogleLogin = () => {
    // Server sẽ tiếp nhận và chuyển hướng sang Google
    window.location.href = googleLoginUrl;
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full cursor-pointer flex justify-center items-center py-3 px-4 border border-gray-300 rounded-md text-base transition text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <Image
          src={googleIcon}
          alt="Google logo"
          width={24}
          height={24}
          className="mr-3"
        />
        Tiếp tục với Google
      </button>
    </div>
  );
}
