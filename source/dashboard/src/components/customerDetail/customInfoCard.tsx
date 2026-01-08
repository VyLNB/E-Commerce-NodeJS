import type { Customer } from "../../lib/types";
import { formatJoinDate } from "../../lib/utils";

interface CustomerInfoProps {
  user: Customer;
}
const CustomerInfoCard = ({ user }: CustomerInfoProps) => {
  return (
    <div className="flex gap-6 items-start">
      <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
        {user.avatar && (
          <img
            src={user.avatar}
            alt={`${user.fullName}'s avatar`}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.log("Avatar failed to load, showing initials");
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              const spanElement = target.parentElement?.querySelector("span");
              if (spanElement) {
                spanElement.style.display = "flex";
              }
            }}
          />
        )}

        <span
          className="text-teal-600 font-semibold text-xl items-center justify-center w-full h-full"
          style={{ display: user.avatar ? "none" : "flex" }}
        >
          {(user.fullName ?? "").charAt(0).toUpperCase()}
        </span>

      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <h2 className="text-lg font-semibold">{user.fullName}</h2>
        <p className="text-sm text-gray-500">
          {formatJoinDate(user.createdAt)}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Email:</span> {user.email}
          {user.email && (
            <span className="ml-2 text-xs text-green-600">✓ Đã xác thực</span>
          )}
        </p>
        {user?.loyaltyPoints && (
          <p className="text-sm text-gray-600">
            <span className="font-medium">Điểm thưởng:</span>{" "}
            {user.loyaltyPoints.toLocaleString()}
          </p>
        )}
        <p className="text-sm text-gray-600">
          <span className="font-medium">Trạng thái:</span>
          <span
            className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
              user.status === "active"
                ? "bg-green-100 text-green-800"
                : user.status === "inactive"
                ? "bg-gray-100 text-gray-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {user.status
              ? user.status.charAt(0).toUpperCase() + user.status.slice(1)
              : "Unknown"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default CustomerInfoCard;
