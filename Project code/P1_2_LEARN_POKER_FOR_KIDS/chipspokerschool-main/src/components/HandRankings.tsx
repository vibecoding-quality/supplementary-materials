import { motion } from "framer-motion";
import PlayingCard from "./PlayingCard";

interface HandRank {
  name: string;
  description: string;
  cards: { suit: "hearts" | "diamonds" | "clubs" | "spades"; value: string }[];
  rank: number;
}

const handRankings: HandRank[] = [
  {
    name: "Royal Flush",
    description: "The best hand! A, K, Q, J, 10 all the same suit.",
    cards: [
      { suit: "hearts", value: "A" },
      { suit: "hearts", value: "K" },
      { suit: "hearts", value: "Q" },
      { suit: "hearts", value: "J" },
      { suit: "hearts", value: "10" },
    ],
    rank: 1,
  },
  {
    name: "Straight Flush",
    description: "Five cards in a row, all the same suit.",
    cards: [
      { suit: "clubs", value: "9" },
      { suit: "clubs", value: "8" },
      { suit: "clubs", value: "7" },
      { suit: "clubs", value: "6" },
      { suit: "clubs", value: "5" },
    ],
    rank: 2,
  },
  {
    name: "Four of a Kind",
    description: "Four cards with the same number.",
    cards: [
      { suit: "hearts", value: "K" },
      { suit: "diamonds", value: "K" },
      { suit: "clubs", value: "K" },
      { suit: "spades", value: "K" },
      { suit: "hearts", value: "3" },
    ],
    rank: 3,
  },
  {
    name: "Full House",
    description: "Three of a kind plus a pair.",
    cards: [
      { suit: "hearts", value: "Q" },
      { suit: "diamonds", value: "Q" },
      { suit: "clubs", value: "Q" },
      { suit: "spades", value: "7" },
      { suit: "hearts", value: "7" },
    ],
    rank: 4,
  },
  {
    name: "Flush",
    description: "Five cards of the same suit (any order).",
    cards: [
      { suit: "diamonds", value: "K" },
      { suit: "diamonds", value: "J" },
      { suit: "diamonds", value: "8" },
      { suit: "diamonds", value: "4" },
      { suit: "diamonds", value: "2" },
    ],
    rank: 5,
  },
  {
    name: "Straight",
    description: "Five cards in a row (any suit).",
    cards: [
      { suit: "hearts", value: "10" },
      { suit: "clubs", value: "9" },
      { suit: "diamonds", value: "8" },
      { suit: "spades", value: "7" },
      { suit: "hearts", value: "6" },
    ],
    rank: 6,
  },
  {
    name: "Three of a Kind",
    description: "Three cards with the same number.",
    cards: [
      { suit: "hearts", value: "8" },
      { suit: "diamonds", value: "8" },
      { suit: "clubs", value: "8" },
      { suit: "spades", value: "K" },
      { suit: "hearts", value: "4" },
    ],
    rank: 7,
  },
  {
    name: "Two Pair",
    description: "Two different pairs of cards.",
    cards: [
      { suit: "hearts", value: "J" },
      { suit: "diamonds", value: "J" },
      { suit: "clubs", value: "4" },
      { suit: "spades", value: "4" },
      { suit: "hearts", value: "A" },
    ],
    rank: 8,
  },
  {
    name: "One Pair",
    description: "Two cards with the same number.",
    cards: [
      { suit: "hearts", value: "10" },
      { suit: "diamonds", value: "10" },
      { suit: "clubs", value: "K" },
      { suit: "spades", value: "5" },
      { suit: "hearts", value: "2" },
    ],
    rank: 9,
  },
  {
    name: "High Card",
    description: "No matches? Your highest card wins!",
    cards: [
      { suit: "hearts", value: "A" },
      { suit: "diamonds", value: "J" },
      { suit: "clubs", value: "8" },
      { suit: "spades", value: "4" },
      { suit: "hearts", value: "2" },
    ],
    rank: 10,
  },
];

const HandRankings = () => {
  return (
    <div className="space-y-4">
      {handRankings.map((hand, index) => (
        <motion.div
          key={hand.name}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.05 }}
          className="bg-card rounded-2xl p-4 border-2 border-border hover:border-primary/50 transition-colors"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2 flex-1">
              <span className="w-8 h-8 rounded-full bg-primary/10 text-primary font-fredoka font-bold flex items-center justify-center text-sm shrink-0">
                #{hand.rank}
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="font-fredoka font-bold text-lg">{hand.name}</h4>
                <p className="text-sm text-muted-foreground">{hand.description}</p>
              </div>
            </div>
            <div className="flex gap-1 sm:ml-auto">
              {hand.cards.map((card, cardIndex) => (
                <PlayingCard
                  key={cardIndex}
                  suit={card.suit}
                  value={card.value}
                  size="sm"
                />
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default HandRankings;
