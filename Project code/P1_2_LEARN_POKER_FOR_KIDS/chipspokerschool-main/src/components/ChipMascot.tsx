import { motion } from "framer-motion";
import chipMascot from "@/assets/chip-mascot.png";

interface ChipMascotProps {
  size?: "sm" | "md" | "lg" | "xl";
  animate?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32",
  xl: "w-48 h-48",
};

const ChipMascot = ({ size = "md", animate = true, className = "" }: ChipMascotProps) => {
  return (
    <motion.div
      className={`${sizeClasses[size]} ${className}`}
      animate={animate ? { y: [0, -10, 0] } : undefined}
      transition={animate ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : undefined}
    >
      <img
        src={chipMascot}
        alt="Chip the friendly poker mascot"
        className="w-full h-full object-contain drop-shadow-lg"
      />
    </motion.div>
  );
};

export default ChipMascot;
