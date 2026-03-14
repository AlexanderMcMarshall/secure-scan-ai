import { motion } from "framer-motion";
import { RiskRating } from "@/lib/types";

interface ScoreGaugeProps {
  score: number;
  rating: RiskRating;
}

export const ScoreGauge = ({ score, rating }: ScoreGaugeProps) => {
  const colorClass =
    rating === "Excellent" || rating === "Good"
      ? "text-success"
      : rating === "Needs Work"
      ? "score-needs-work"
      : "text-destructive";

  const strokeColor =
    rating === "Excellent" || rating === "Good"
      ? "hsl(160, 84%, 39%)"
      : rating === "Needs Work"
      ? "hsl(38, 92%, 50%)"
      : "hsl(350, 89%, 60%)";

  const circumference = 2 * Math.PI * 54;
  const progress = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" stroke="hsl(214, 32%, 91%)" strokeWidth="8" fill="none" />
          <motion.circle
            cx="60"
            cy="60"
            r="54"
            stroke={strokeColor}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`text-3xl font-extrabold ${colorClass}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-muted-foreground">/ 100</span>
        </div>
      </div>
      <motion.span
        className={`text-sm font-semibold mt-2 ${colorClass}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {rating}
      </motion.span>
    </div>
  );
};
