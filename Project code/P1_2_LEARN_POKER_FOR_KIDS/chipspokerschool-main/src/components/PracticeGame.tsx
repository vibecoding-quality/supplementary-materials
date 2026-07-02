import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, ArrowRight, Trophy, ThumbsUp } from "lucide-react";
import PlayingCard from "./PlayingCard";
import ChipMascot from "./ChipMascot";
import SpeechBubble from "./SpeechBubble";

type Suit = "hearts" | "diamonds" | "clubs" | "spades";
type Card = { suit: Suit; value: string };
type GamePhase = "intro" | "preflop" | "flop" | "turn" | "river" | "showdown" | "result";

interface GameState {
  phase: GamePhase;
  playerCards: Card[];
  communityCards: Card[];
  opponentCards: Card[];
  pot: number;
  playerChips: number;
  opponentChips: number;
  currentBet: number;
  playerBet: number;
  opponentBet: number;
  message: string;
  playerWon: boolean | null;
  playerHandName: string;
  opponentHandName: string;
}

const allCards: Card[] = [];
const suits: Suit[] = ["hearts", "diamonds", "clubs", "spades"];
const values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
suits.forEach(suit => values.forEach(value => allCards.push({ suit, value })));

const shuffleDeck = (): Card[] => {
  const deck = [...allCards];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

const getCardValue = (value: string): number => {
  if (value === "A") return 14;
  if (value === "K") return 13;
  if (value === "Q") return 12;
  if (value === "J") return 11;
  return parseInt(value);
};

const evaluateHand = (cards: Card[]): { rank: number; name: string } => {
  const values = cards.map(c => getCardValue(c.value)).sort((a, b) => b - a);
  const suits = cards.map(c => c.suit);
  
  const valueCounts: Record<number, number> = {};
  values.forEach(v => valueCounts[v] = (valueCounts[v] || 0) + 1);
  const counts = Object.values(valueCounts).sort((a, b) => b - a);
  
  const isFlush = suits.filter(s => s === suits[0]).length >= 5;
  const uniqueValues = [...new Set(values)].sort((a, b) => b - a);
  
  let isStraight = false;
  for (let i = 0; i <= uniqueValues.length - 5; i++) {
    if (uniqueValues[i] - uniqueValues[i + 4] === 4) {
      isStraight = true;
      break;
    }
  }
  // Check for A-2-3-4-5 straight
  if (uniqueValues.includes(14) && uniqueValues.includes(2) && uniqueValues.includes(3) && uniqueValues.includes(4) && uniqueValues.includes(5)) {
    isStraight = true;
  }

  if (isFlush && isStraight && values.includes(14)) return { rank: 1, name: "Royal Flush" };
  if (isFlush && isStraight) return { rank: 2, name: "Straight Flush" };
  if (counts[0] === 4) return { rank: 3, name: "Four of a Kind" };
  if (counts[0] === 3 && counts[1] === 2) return { rank: 4, name: "Full House" };
  if (isFlush) return { rank: 5, name: "Flush" };
  if (isStraight) return { rank: 6, name: "Straight" };
  if (counts[0] === 3) return { rank: 7, name: "Three of a Kind" };
  if (counts[0] === 2 && counts[1] === 2) return { rank: 8, name: "Two Pair" };
  if (counts[0] === 2) return { rank: 9, name: "One Pair" };
  return { rank: 10, name: "High Card" };
};

const phaseMessages: Record<GamePhase, string> = {
  intro: "Ready to practice? Click 'Deal Cards' and I'll give you a hand to play!",
  preflop: "Look at your cards! These are your secret hole cards. Do you want to play this hand or fold?",
  flop: "Here comes the Flop - 3 community cards! Now you can see if your hand is getting stronger.",
  turn: "The Turn card is here! One more card to go. What do you want to do?",
  river: "The River - the final card! This is your last chance to bet or fold.",
  showdown: "It's Showdown time! Let's see who has the better hand...",
  result: "",
};

const PracticeGame = () => {
  const [game, setGame] = useState<GameState>({
    phase: "intro",
    playerCards: [],
    communityCards: [],
    opponentCards: [],
    pot: 0,
    playerChips: 100,
    opponentChips: 100,
    currentBet: 0,
    playerBet: 0,
    opponentBet: 0,
    message: phaseMessages.intro,
    playerWon: null,
    playerHandName: "",
    opponentHandName: "",
  });

  const startNewGame = useCallback(() => {
    const deck = shuffleDeck();
    setGame({
      phase: "preflop",
      playerCards: [deck[0], deck[1]],
      communityCards: [deck[4], deck[5], deck[6], deck[7], deck[8]],
      opponentCards: [deck[2], deck[3]],
      pot: 15,
      playerChips: 95,
      opponentChips: 95,
      currentBet: 10,
      playerBet: 5,
      opponentBet: 10,
      message: phaseMessages.preflop,
      playerWon: null,
      playerHandName: "",
      opponentHandName: "",
    });
  }, []);

  const handleFold = () => {
    setGame(prev => ({
      ...prev,
      phase: "result",
      playerWon: false,
      message: "You folded! That's okay - sometimes folding is the smart move. The opponent wins this pot.",
    }));
  };

  const handleCall = () => {
    const callAmount = game.currentBet - game.playerBet;
    setGame(prev => {
      const newPot = prev.pot + callAmount;
      const newPlayerChips = prev.playerChips - callAmount;
      
      if (prev.phase === "preflop") {
        return { ...prev, phase: "flop", pot: newPot, playerChips: newPlayerChips, playerBet: prev.currentBet, currentBet: 0, message: phaseMessages.flop };
      } else if (prev.phase === "flop") {
        return { ...prev, phase: "turn", pot: newPot, playerChips: newPlayerChips, playerBet: 0, opponentBet: 0, currentBet: 0, message: phaseMessages.turn };
      } else if (prev.phase === "turn") {
        return { ...prev, phase: "river", pot: newPot, playerChips: newPlayerChips, playerBet: 0, opponentBet: 0, currentBet: 0, message: phaseMessages.river };
      } else {
        return { ...prev, phase: "showdown", pot: newPot, playerChips: newPlayerChips, message: phaseMessages.showdown };
      }
    });
  };

  const handleCheck = () => {
    setGame(prev => {
      if (prev.phase === "flop") {
        return { ...prev, phase: "turn", message: phaseMessages.turn };
      } else if (prev.phase === "turn") {
        return { ...prev, phase: "river", message: phaseMessages.river };
      } else {
        return { ...prev, phase: "showdown", message: phaseMessages.showdown };
      }
    });
  };

  const handleRaise = () => {
    const raiseAmount = 10;
    setGame(prev => {
      const totalBet = (prev.currentBet - prev.playerBet) + raiseAmount;
      const newPot = prev.pot + totalBet;
      const newPlayerChips = prev.playerChips - totalBet;
      
      // Opponent calls the raise
      const opponentCall = raiseAmount;
      const finalPot = newPot + opponentCall;
      const newOpponentChips = prev.opponentChips - opponentCall;
      
      if (prev.phase === "preflop") {
        return { ...prev, phase: "flop", pot: finalPot, playerChips: newPlayerChips, opponentChips: newOpponentChips, playerBet: 0, opponentBet: 0, currentBet: 0, message: "Nice raise! Your opponent calls. " + phaseMessages.flop };
      } else if (prev.phase === "flop") {
        return { ...prev, phase: "turn", pot: finalPot, playerChips: newPlayerChips, opponentChips: newOpponentChips, playerBet: 0, opponentBet: 0, currentBet: 0, message: "Bold move! " + phaseMessages.turn };
      } else if (prev.phase === "turn") {
        return { ...prev, phase: "river", pot: finalPot, playerChips: newPlayerChips, opponentChips: newOpponentChips, playerBet: 0, opponentBet: 0, currentBet: 0, message: "Great raise! " + phaseMessages.river };
      } else {
        return { ...prev, phase: "showdown", pot: finalPot, playerChips: newPlayerChips, opponentChips: newOpponentChips, message: phaseMessages.showdown };
      }
    });
  };

  const handleShowdown = () => {
    const playerHand = evaluateHand([...game.playerCards, ...game.communityCards]);
    const opponentHand = evaluateHand([...game.opponentCards, ...game.communityCards]);
    
    const playerWon = playerHand.rank < opponentHand.rank;
    const isTie = playerHand.rank === opponentHand.rank;
    
    let message = "";
    if (isTie) {
      message = `It's a tie! You both have ${playerHand.name}. The pot is split!`;
    } else if (playerWon) {
      message = `🎉 You WIN! Your ${playerHand.name} beats their ${opponentHand.name}! You won ${game.pot} chips!`;
    } else {
      message = `The opponent wins with ${opponentHand.name} against your ${playerHand.name}. Better luck next time!`;
    }

    setGame(prev => ({
      ...prev,
      phase: "result",
      playerWon: isTie ? null : playerWon,
      playerHandName: playerHand.name,
      opponentHandName: opponentHand.name,
      message,
      playerChips: playerWon ? prev.playerChips + prev.pot : (isTie ? prev.playerChips + prev.pot / 2 : prev.playerChips),
    }));
  };

  const resetGame = () => {
    setGame({
      phase: "intro",
      playerCards: [],
      communityCards: [],
      opponentCards: [],
      pot: 0,
      playerChips: 100,
      opponentChips: 100,
      currentBet: 0,
      playerBet: 0,
      opponentBet: 0,
      message: phaseMessages.intro,
      playerWon: null,
      playerHandName: "",
      opponentHandName: "",
    });
  };

  const canCheck = game.currentBet === 0 || game.playerBet >= game.currentBet;
  const callAmount = game.currentBet - game.playerBet;

  return (
    <div className="bg-card rounded-3xl p-6 md:p-8 border-2 border-border card-shadow">
      {/* Chip's Message */}
      <div className="flex items-start gap-4 mb-8">
        <ChipMascot size="md" animate={game.phase !== "result"} />
        <SpeechBubble direction="left" className="flex-1">
          <p className="text-muted-foreground">{game.message}</p>
        </SpeechBubble>
      </div>

      {/* Game Area */}
      <div className="bg-success/90 rounded-[40px] p-6 md:p-8 border-8 border-success/70 shadow-xl mb-6">
        <div className="bg-success/80 rounded-[30px] p-4 md:p-6 border-4 border-success/50">
          {/* Opponent's cards */}
          <div className="flex justify-center mb-4">
            <div className="text-center">
              <p className="text-primary-foreground/80 text-xs font-semibold mb-2">Opponent's Cards</p>
              <div className="flex gap-2 justify-center">
                {game.phase === "intro" ? (
                  <>
                    <div className="w-12 h-16 rounded-lg bg-primary/30 border-2 border-dashed border-primary-foreground/30" />
                    <div className="w-12 h-16 rounded-lg bg-primary/30 border-2 border-dashed border-primary-foreground/30" />
                  </>
                ) : game.phase === "result" || game.phase === "showdown" ? (
                  game.opponentCards.map((card, i) => (
                    <motion.div
                      key={i}
                      initial={{ rotateY: 180 }}
                      animate={{ rotateY: 0 }}
                      transition={{ delay: i * 0.2 }}
                    >
                      <PlayingCard suit={card.suit} value={card.value} size="sm" />
                    </motion.div>
                  ))
                ) : (
                  game.opponentCards.map((_, i) => (
                    <PlayingCard key={i} suit="spades" value="" faceDown size="sm" />
                  ))
                )}
              </div>
              {game.phase === "result" && game.opponentHandName && (
                <p className="text-primary-foreground text-xs mt-1 font-semibold">{game.opponentHandName}</p>
              )}
            </div>
          </div>

          {/* Community Cards */}
          <div className="flex justify-center gap-2 my-6">
            {game.phase === "intro" ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="w-12 h-16 md:w-14 md:h-20 rounded-lg bg-primary-foreground/10 border-2 border-dashed border-primary-foreground/30" />
              ))
            ) : (
              <>
                {/* Flop */}
                {game.communityCards.slice(0, 3).map((card, i) => (
                  <motion.div
                    key={`flop-${i}`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ 
                      opacity: ["flop", "turn", "river", "showdown", "result"].includes(game.phase) ? 1 : 0,
                      scale: ["flop", "turn", "river", "showdown", "result"].includes(game.phase) ? 1 : 0.5
                    }}
                    transition={{ delay: i * 0.15 }}
                  >
                    <PlayingCard suit={card.suit} value={card.value} size="sm" />
                  </motion.div>
                ))}
                {/* Turn */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ 
                    opacity: ["turn", "river", "showdown", "result"].includes(game.phase) ? 1 : 0,
                    scale: ["turn", "river", "showdown", "result"].includes(game.phase) ? 1 : 0.5
                  }}
                >
                  {game.communityCards[3] && (
                    <PlayingCard suit={game.communityCards[3].suit} value={game.communityCards[3].value} size="sm" />
                  )}
                </motion.div>
                {/* River */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ 
                    opacity: ["river", "showdown", "result"].includes(game.phase) ? 1 : 0,
                    scale: ["river", "showdown", "result"].includes(game.phase) ? 1 : 0.5
                  }}
                >
                  {game.communityCards[4] && (
                    <PlayingCard suit={game.communityCards[4].suit} value={game.communityCards[4].value} size="sm" />
                  )}
                </motion.div>
              </>
            )}
          </div>

          {/* Pot */}
          <div className="text-center mb-4">
            <span className="bg-secondary px-4 py-1 rounded-full text-secondary-foreground font-fredoka font-bold text-sm">
              Pot: {game.pot} chips
            </span>
          </div>

          {/* Player's Cards */}
          <div className="flex justify-center">
            <div className="text-center">
              <p className="text-primary-foreground/80 text-xs font-semibold mb-2">Your Cards</p>
              <div className="flex gap-2 justify-center">
                {game.phase === "intro" ? (
                  <>
                    <div className="w-14 h-20 md:w-16 md:h-22 rounded-xl bg-primary/30 border-2 border-dashed border-primary-foreground/30" />
                    <div className="w-14 h-20 md:w-16 md:h-22 rounded-xl bg-primary/30 border-2 border-dashed border-primary-foreground/30" />
                  </>
                ) : (
                  game.playerCards.map((card, i) => (
                    <motion.div
                      key={i}
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: i * 0.2 }}
                    >
                      <PlayingCard suit={card.suit} value={card.value} size="md" />
                    </motion.div>
                  ))
                )}
              </div>
              {game.phase === "result" && game.playerHandName && (
                <p className="text-primary-foreground text-xs mt-1 font-semibold">{game.playerHandName}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chip counts */}
      <div className="flex justify-between mb-6 text-sm">
        <div className="bg-muted rounded-xl px-4 py-2">
          <span className="text-muted-foreground">Your Chips: </span>
          <span className="font-fredoka font-bold text-primary">{game.playerChips}</span>
        </div>
        <div className="bg-muted rounded-xl px-4 py-2">
          <span className="text-muted-foreground">Opponent: </span>
          <span className="font-fredoka font-bold">{game.opponentChips}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <AnimatePresence mode="wait">
          {game.phase === "intro" && (
            <motion.button
              key="deal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startNewGame}
              className="flex items-center gap-2 bg-primary text-primary-foreground font-fredoka font-bold px-6 py-3 rounded-xl button-shadow"
            >
              Deal Cards! <ArrowRight className="w-5 h-5" />
            </motion.button>
          )}

          {["preflop", "flop", "turn", "river"].includes(game.phase) && (
            <>
              <motion.button
                key="fold"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFold}
                className="bg-accent text-accent-foreground font-fredoka font-bold px-5 py-3 rounded-xl shadow-lg"
              >
                Fold
              </motion.button>

              {canCheck ? (
                <motion.button
                  key="check"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCheck}
                  className="bg-muted text-foreground font-fredoka font-bold px-5 py-3 rounded-xl shadow-lg"
                >
                  Check
                </motion.button>
              ) : (
                <motion.button
                  key="call"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCall}
                  className="bg-primary text-primary-foreground font-fredoka font-bold px-5 py-3 rounded-xl button-shadow"
                >
                  Call ({callAmount})
                </motion.button>
              )}

              <motion.button
                key="raise"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRaise}
                className="bg-secondary text-secondary-foreground font-fredoka font-bold px-5 py-3 rounded-xl shadow-lg"
              >
                Raise +10
              </motion.button>
            </>
          )}

          {game.phase === "showdown" && (
            <motion.button
              key="showdown"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShowdown}
              className="flex items-center gap-2 bg-secondary text-secondary-foreground font-fredoka font-bold px-6 py-3 rounded-xl shadow-lg"
            >
              Reveal Cards! <Trophy className="w-5 h-5" />
            </motion.button>
          )}

          {game.phase === "result" && (
            <motion.button
              key="reset"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetGame}
              className="flex items-center gap-2 bg-primary text-primary-foreground font-fredoka font-bold px-6 py-3 rounded-xl button-shadow"
            >
              <RotateCcw className="w-5 h-5" /> Play Again!
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Result badge */}
      <AnimatePresence>
        {game.phase === "result" && game.playerWon !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="mt-6 text-center"
          >
            {game.playerWon ? (
              <div className="inline-flex items-center gap-2 bg-success/20 text-success px-6 py-3 rounded-2xl font-fredoka font-bold text-xl">
                <Trophy className="w-6 h-6" /> You Won! 🎉
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 bg-muted text-muted-foreground px-6 py-3 rounded-2xl font-fredoka font-bold text-lg">
                <ThumbsUp className="w-5 h-5" /> Good try! Keep practicing!
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PracticeGame;
