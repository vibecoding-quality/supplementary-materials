import { motion } from "framer-motion";
import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import CardControls from "./CardControls";

interface LessonCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  lessonNumber: number;
  isActive?: boolean;
  isCompleted?: boolean;
  onClick?: () => void;
  children?: ReactNode;
  cardId?: string;
  isRead?: boolean;
  isStarred?: boolean;
  onToggleRead?: (cardId: string) => void;
  onToggleStar?: (cardId: string) => void;
}

const LessonCard = ({
  icon: Icon,
  title,
  description,
  lessonNumber,
  isActive = false,
  isCompleted = false,
  onClick,
  children,
  cardId,
  isRead = false,
  isStarred = false,
  onToggleRead,
  onToggleStar,
}: LessonCardProps) => {
  const showControls = cardId && onToggleRead && onToggleStar;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: lessonNumber * 0.1 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
        isStarred
          ? "bg-secondary/10 border-2 border-secondary card-shadow"
          : isActive
          ? "bg-primary text-primary-foreground card-shadow"
          : isRead
          ? "bg-success/5 border-2 border-success/50"
          : isCompleted
          ? "bg-success/10 border-2 border-success"
          : "bg-card border-2 border-border hover:border-primary/50"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            isStarred
              ? "bg-secondary/20"
              : isActive
              ? "bg-primary-foreground/20"
              : isRead
              ? "bg-success/20"
              : isCompleted
              ? "bg-success/20"
              : "bg-primary/10"
          }`}
        >
          <Icon
            className={`w-6 h-6 ${
              isStarred
                ? "text-secondary"
                : isActive
                ? "text-primary-foreground"
                : isRead
                ? "text-success"
                : isCompleted
                ? "text-success"
                : "text-primary"
            }`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                isStarred
                  ? "bg-secondary/20 text-secondary"
                  : isActive
                  ? "bg-primary-foreground/20"
                  : isRead
                  ? "bg-success/20 text-success"
                  : isCompleted
                  ? "bg-success/20 text-success"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              Lesson {lessonNumber}
            </span>
            {isCompleted && <span className="text-success">✓</span>}
            {showControls && (
              <div className="ml-auto">
                <CardControls
                  cardId={cardId}
                  isRead={isRead}
                  isStarred={isStarred}
                  onToggleRead={onToggleRead}
                  onToggleStar={onToggleStar}
                  size="sm"
                />
              </div>
            )}
          </div>
          <h3
            className={`font-fredoka font-bold text-xl mb-1 ${
              isStarred
                ? "text-foreground"
                : isActive
                ? "text-primary-foreground"
                : ""
            }`}
          >
            {title}
          </h3>
          <p
            className={`text-sm ${
              isActive ? "text-primary-foreground/80" : "text-muted-foreground"
            }`}
          >
            {description}
          </p>
        </div>
      </div>
      {children && <div className="mt-4">{children}</div>}
    </motion.div>
  );
};

export default LessonCard;
