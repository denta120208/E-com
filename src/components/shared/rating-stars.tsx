import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  className?: string;
}

export function RatingStars({ rating, className }: RatingStarsProps) {
  const rounded = Math.round(rating);
  return (
    <div className={cn("flex items-center gap-1", className)} aria-label={`Rated ${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} className={index < rounded ? "text-amber-500" : "text-zinc-300"}>
          ★
        </span>
      ))}
    </div>
  );
}
