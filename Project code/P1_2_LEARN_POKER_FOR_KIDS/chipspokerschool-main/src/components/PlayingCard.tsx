import { motion } from "framer-motion";

interface PlayingCardProps {
  suit: "hearts" | "diamonds" | "clubs" | "spades";
  value: string;
  size?: "sm" | "md" | "lg";
  faceDown?: boolean;
  className?: string;
}

const suitSymbols = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
};

const sizeClasses = {
  sm: "w-12 h-16 text-sm",
  md: "w-16 h-22 text-lg",
  lg: "w-24 h-32 text-2xl",
};

const PlayingCard = ({ suit, value, size = "md", faceDown = false, className = "" }: PlayingCardProps) => {
  const isRed = suit === "hearts" || suit === "diamonds";
  
  if (faceDown) {
    return (
      <motion.div
        className={`${sizeClasses[size]} rounded-xl bg-primary flex items-center justify-center card-shadow ${className}`}
        whileHover={{ scale: 1.05, rotate: 2 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className="w-3/4 h-3/4 rounded-lg border-2 border-primary-foreground/30 flex items-center justify-center">
          <span className="text-primary-foreground font-fredoka text-xl">?</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`${sizeClasses[size]} rounded-xl bg-card flex flex-col items-center justify-center card-shadow border-2 border-border ${className}`}
      whileHover={{ scale: 1.05, rotate: 2 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <span className={`font-fredoka font-bold ${isRed ? "text-card-red" : "text-card-black"}`}>
        {value}
      </span>
      <span className={`${isRed ? "text-card-red" : "text-card-black"} text-xl`}>
        {suitSymbols[suit]}
      </span>
    </motion.div>
  );
};

export default PlayingCard;
