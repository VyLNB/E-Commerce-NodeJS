import clsx from "clsx";
import { Star } from "lucide-react";

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[...Array(5)].map((_, i) => (
      <Star
        key={`star-${i + 1}`}
        className={clsx(
          "h-4 w-4",
          i < Math.round(rating) ? "text-yellow-400" : "text-gray-300"
        )}
        fill="currentColor"
      />
    ))}
  </div>
);

export default StarRating;
