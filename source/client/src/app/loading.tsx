import { Spinner } from "@/public/icons";
import React from "react";

type Props = {};

export default function loading({}: Props) {
  return (
    <section className="h-screen flex items-center justify-center">
      <span className="animate-spin inline-block">
        <Spinner size={64} />
      </span>
    </section>
  );
}
