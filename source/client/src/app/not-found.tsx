import React from "react";

type Props = {};

export default function NotFound({}: Props) {
  return (
    <section className="bg-gray-100 h-screen flex">
      <div className="m-auto text-gray-900 text-center space-y-2">
        <h1 className="text-6xl">
          <span className="font-bold text-red-500">404</span> Not Found
        </h1>
        <p className="text-lg">
          We{`'`}re so sorry for this may cause inconvenience
        </p>
      </div>
    </section>
  );
}
