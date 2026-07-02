import { Check, Star } from "lucide-react";
import { motion } from "framer-motion";

interface CardControlsProps {
  cardId: string;
  isRead: boolean;
  isStarred: boolean;
  onToggleRead: (cardId: string) => void;
  onToggleStar: (cardId: string) => void;
  size?: "sm" | "md";
}

const CardControls = ({
  cardId,
  isRead,
  isStarred,
  onToggleRead,
  onToggleStar,
  size = "md",
}: CardControlsProps) => {
  const buttonSize = size === "sm" ? "w-8 h-8" : "w-9 h-9";
  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <div className="flex items-center gap-2">
      <motion.button
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          e.stopPropagation();
          onToggleRead(cardId);
        }}
        className={`${buttonSize} rounded-full flex items-center justify-center transition-all duration-200 border-2 ${
          isRead
            ? "bg-green-500 border-green-600 text-white shadow-md"
            : "bg-white border-gray-300 text-gray-400 hover:border-green-400 hover:text-green-500"
        }`}
        title={isRead ? "Mark as unread" : "Mark as read"}
        aria-label={isRead ? "Mark as unread" : "Mark as read"}
      >
        <Check className={iconSize} strokeWidth={isRead ? 3 : 2} />
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          e.stopPropagation();
          onToggleStar(cardId);
        }}
        className={`${buttonSize} rounded-full flex items-center justify-center transition-all duration-200 border-2 ${
          isStarred
            ? "bg-yellow-400 border-yellow-500 text-white shadow-md"
            : "bg-white border-gray-300 text-gray-400 hover:border-yellow-400 hover:text-yellow-500"
        }`}
        title={isStarred ? "Remove star" : "Add star"}
        aria-label={isStarred ? "Remove star" : "Add star"}
      >
        <Star 
          className={iconSize} 
          fill={isStarred ? "currentColor" : "none"}
          strokeWidth={2}
        />
      </motion.button>
    </div>
  );
};

export default CardControls;
