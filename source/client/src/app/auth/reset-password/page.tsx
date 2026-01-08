"use client";

import ResetPasswordForm from "@/components/auth/reset-password-form";
import { useSearchParams } from "next/navigation";
import React from "react";

type Props = {};

export default function ResetPassword({}: Props) {
  const params = useSearchParams();
  const token = params.get("token");

  return (
    <section className="bg-radial-tech min-h-screen flex p-4">
      <ResetPasswordForm resetToken={token} />
    </section>
  );
}
