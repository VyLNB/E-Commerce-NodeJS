import { SigninForm } from "@/components/auth";
import React from "react";

type Props = {};

export default function SigninPage({}: Props) {
  return (
    <section className="bg-radial-tech min-h-screen flex p-4">
      <SigninForm />
    </section>
  );
}
