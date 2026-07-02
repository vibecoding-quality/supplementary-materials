import { motion } from "framer-motion";
import { Lightbulb, Star } from "lucide-react";

interface StrategyTipProps {
  title: string;
  tip: string;
  level: "beginner" | "intermediate" | "advanced";
  index?: number;
}

const levelColors = {
  beginner: "border-green-400 bg-green-50",
  intermediate: "border-yellow-400 bg-yellow-50",
  advanced: "border-primary bg-primary/10",
};

const levelLabels = {
  beginner: "Easy",
  intermediate: "Medium",
  advanced: "Pro Tip",
};

const StrategyTip = ({
  title,
  tip,
  level,
  index = 0,
}: StrategyTipProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className={`rounded-2xl border-2 p-5 transition-all ${levelColors[level]}`}
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-card flex items-center justify-center shrink-0">
          <Lightbulb className="w-5 h-5 text-secondary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h4 className="font-fredoka font-bold text-lg">{title}</h4>
            <span className="text-xs px-2 py-0.5 rounded-full bg-card font-semibold flex items-center gap-1">
              <Star className="w-3 h-3" />
              {levelLabels[level]}
            </span>
          </div>
          <p className="text-muted-foreground">{tip}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default StrategyTip;
