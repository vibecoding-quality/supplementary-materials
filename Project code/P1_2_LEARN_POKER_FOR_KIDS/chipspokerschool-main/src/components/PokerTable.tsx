import { motion } from "framer-motion";
import PlayingCard from "./PlayingCard";

interface PokerTableProps {
  communityCards?: { suit: "hearts" | "diamonds" | "clubs" | "spades"; value: string }[];
  showFlop?: boolean;
  showTurn?: boolean;
  showRiver?: boolean;
}

const PokerTable = ({
  communityCards = [
    { suit: "hearts", value: "A" },
    { suit: "clubs", value: "K" },
    { suit: "diamonds", value: "7" },
    { suit: "spades", value: "2" },
    { suit: "hearts", value: "9" },
  ],
  showFlop = true,
  showTurn = true,
  showRiver = true,
}: PokerTableProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full max-w-lg mx-auto"
    >
      {/* Table felt */}
      <div className="bg-success rounded-[100px] p-8 border-8 border-success/70 shadow-2xl">
        {/* Inner table rim */}
        <div className="bg-success/80 rounded-[80px] p-6 border-4 border-success/50">
          {/* Community cards area */}
          <div className="flex justify-center gap-2 py-8">
            {communityCards.slice(0, 3).map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, rotateY: 180 }}
                animate={showFlop ? { opacity: 1, rotateY: 0 } : { opacity: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <PlayingCard suit={card.suit} value={card.value} size="md" />
              </motion.div>
            ))}
            {communityCards[3] && (
              <motion.div
                initial={{ opacity: 0, rotateY: 180 }}
                animate={showTurn ? { opacity: 1, rotateY: 0 } : { opacity: 0 }}
                transition={{ delay: 0.6 }}
              >
                <PlayingCard suit={communityCards[3].suit} value={communityCards[3].value} size="md" />
              </motion.div>
            )}
            {communityCards[4] && (
              <motion.div
                initial={{ opacity: 0, rotateY: 180 }}
                animate={showRiver ? { opacity: 1, rotateY: 0 } : { opacity: 0 }}
                transition={{ delay: 0.8 }}
              >
                <PlayingCard suit={communityCards[4].suit} value={communityCards[4].value} size="md" />
              </motion.div>
            )}
          </div>
          
          {/* Labels */}
          <div className="flex justify-center gap-8 text-primary-foreground/80 text-xs font-semibold">
            <span className={showFlop ? "opacity-100" : "opacity-30"}>FLOP</span>
            <span className={showTurn ? "opacity-100" : "opacity-30"}>TURN</span>
            <span className={showRiver ? "opacity-100" : "opacity-30"}>RIVER</span>
          </div>
        </div>
      </div>
      
      {/* Dealer button */}
      <motion.div
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute -top-4 right-8 w-10 h-10 bg-secondary rounded-full flex items-center justify-center font-fredoka font-bold text-secondary-foreground text-sm shadow-lg border-2 border-secondary/70"
      >
        D
      </motion.div>
    </motion.div>
  );
};

export default PokerTable;
