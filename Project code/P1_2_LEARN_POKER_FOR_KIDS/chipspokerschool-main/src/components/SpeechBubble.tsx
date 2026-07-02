import { motion } from "framer-motion";
import { ReactNode } from "react";

interface SpeechBubbleProps {
  children: ReactNode;
  direction?: "left" | "right" | "bottom";
  className?: string;
}

const SpeechBubble = ({ children, direction = "left", className = "" }: SpeechBubbleProps) => {
  const tailClasses = {
    left: "left-0 -translate-x-2 top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-card border-l-0",
    right: "right-0 translate-x-2 top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-card border-r-0",
    bottom: "bottom-0 translate-y-2 left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-card border-b-0",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={`relative bg-card rounded-2xl p-6 card-shadow ${className}`}
    >
      {children}
      <div
        className={`absolute w-0 h-0 border-8 ${tailClasses[direction]}`}
        style={{ borderWidth: "12px" }}
      />
    </motion.div>
  );
};

export default SpeechBubble;
