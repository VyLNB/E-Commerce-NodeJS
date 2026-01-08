export default function ShippingStep() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">
        Phương thức vận chuyển
      </h2>
      <div className="p-4 border border-gray-200 rounded-lg">
        <p className="text-gray-700">Standard Shipping - $10.00</p>
        <p className="text-sm text-gray-500">Arrives in 5-7 business days.</p>
      </div>
      <div className="p-4 border-2 border-blue-600 rounded-lg bg-blue-50">
        <p className="text-blue-800 font-semibold">Express Shipping - $25.00</p>
        <p className="text-sm text-blue-600">Arrives in 1-2 business days.</p>
      </div>
    </div>
  );
}
