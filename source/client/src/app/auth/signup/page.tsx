import { SignupForm } from "@/components/auth";
import React from "react";

type Props = {};

export default function page({}: Props) {
  return (
    <section className="bg-radial-tech min-h-screen flex py-16 px-4">
      <SignupForm />
    </section>
  );
}
