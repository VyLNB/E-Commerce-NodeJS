import React from "react";

type Props = {};

export default function Payment({}: Props) {
  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Đã liên kết hiện tại</h1>
        <p>Hiện tại chưa có phương thức nào khả dụng</p>
      </div>
      <div>
        <h1 className="text-2xl font-semibold">Thêm phương thức khác</h1>
        <p>Hiện tại chưa có phương thức nào khả dụng</p>
      </div>
    </section>
  );
}
