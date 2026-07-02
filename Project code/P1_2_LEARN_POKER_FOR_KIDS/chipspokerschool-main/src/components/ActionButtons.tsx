import { motion } from "framer-motion";
import { Hand, Check, ArrowUpCircle, XCircle } from "lucide-react";

const actions = [
  {
    name: "Fold",
    icon: XCircle,
    color: "bg-accent",
    description: "Give up your cards and leave the round. You lose any chips you've put in.",
  },
  {
    name: "Check",
    icon: Hand,
    color: "bg-muted",
    description: "Stay in without betting more. Only works if no one has bet yet!",
  },
  {
    name: "Call",
    icon: Check,
    color: "bg-primary",
    description: "Match the current bet to stay in the game.",
  },
  {
    name: "Raise",
    icon: ArrowUpCircle,
    color: "bg-secondary",
    description: "Bet more chips than the current bet. This makes others pay more to stay in!",
  },
];

const ActionButtons = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <motion.div
          key={action.name}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05 }}
          className="text-center"
        >
          <div
            className={`${action.color} w-16 h-16 md:w-20 md:h-20 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-lg`}
          >
            <action.icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          <h4 className="font-fredoka font-bold text-lg">{action.name}</h4>
          <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default ActionButtons;
