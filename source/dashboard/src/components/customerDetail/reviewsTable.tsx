import { Star } from "lucide-react";

export default function ReviewsTable() {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Rating & reviews (20)</h2>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-50 text-left">
            <th className="p-2">Product</th>
            <th className="p-2">Review</th>
            <th className="p-2">Review Text</th>
            <th className="p-2">Status</th>
            <th className="p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b">
            <td className="p-2">Apple M1 8GB Memory</td>
            <td className="p-2 flex text-yellow-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="currentColor" />
              ))}
            </td>
            <td className="p-2">Very smooth and fast device, I love it.</td>
            <td className="p-2">
              <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                Success
              </span>
            </td>
            <td className="p-2">—</td>
          </tr>
          <tr className="border-b">
            <td className="p-2">Apple M1 8GB Memory</td>
            <td className="p-2 flex text-yellow-500">
              {[...Array(4)].map((_, i) => (
                <Star key={i} size={16} fill="currentColor" />
              ))}
            </td>
            <td className="p-2">Works well, but had some issues initially.</td>
            <td className="p-2">
              <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700">
                Cancelled
              </span>
            </td>
            <td className="p-2">—</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
