import { motion } from "framer-motion";
import { ReactNode } from "react";
import ChipMascot from "./ChipMascot";
import SpeechBubble from "./SpeechBubble";
import CardControls from "./CardControls";
import { useCardProgress } from "@/hooks/useCardProgress";

interface LessonSectionProps {
  id: string;
  title: string;
  mascotMessage: string;
  children: ReactNode;
  bgVariant?: "default" | "alt";
}

const LessonSection = ({
  id,
  title,
  mascotMessage,
  children,
  bgVariant = "default",
}: LessonSectionProps) => {
  const { toggleRead, toggleStar, isRead, isStarred } = useCardProgress();
  const cardId = `lesson-${id}`;
  const read = isRead(cardId);
  const starred = isStarred(cardId);

  return (
    <section
      id={id}
      className={`py-16 md:py-24 ${
        bgVariant === "alt" ? "bg-muted/50" : "bg-background"
      }`}
    >
      <div className="container max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`flex flex-col md:flex-row items-start gap-6 mb-12 p-4 rounded-2xl border-2 transition-colors ${
            starred
              ? "border-yellow-400 bg-yellow-50"
              : read
              ? "border-green-400 bg-green-50"
              : "border-transparent"
          }`}
        >
          <ChipMascot size="lg" />
          <SpeechBubble direction="left" className="flex-1 relative">
            <div className="absolute top-0 right-0 z-10">
              <CardControls
                cardId={cardId}
                isRead={read}
                isStarred={starred}
                onToggleRead={toggleRead}
                onToggleStar={toggleStar}
                size="sm"
              />
            </div>
            <h2 className="font-fredoka font-bold text-2xl md:text-3xl text-foreground mb-2 pr-20">
              {title}
            </h2>
            <p className="text-lg text-muted-foreground pr-20">{mascotMessage}</p>
          </SpeechBubble>
        </motion.div>

        <div className="pl-0 md:pl-40">{children}</div>
      </div>
    </section>
  );
};

export default LessonSection;
