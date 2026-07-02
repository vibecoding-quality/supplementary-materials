import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, ArrowRight, Trophy, Users, Crown, Frown, ChevronRight } from "lucide-react";
import PlayingCard from "./PlayingCard";
import ChipMascot from "./ChipMascot";

type Suit = "hearts" | "diamonds" | "clubs" | "spades";
type Card = { suit: Suit; value: string };
type GamePhase = "setup" | "preflop" | "flop" | "turn" | "river" | "showdown" | "roundEnd" | "gameOver";

interface Player {
  id: number;
  name: string;
  chips: number;
  cards: Card[];
  folded: boolean;
  currentBet: number;
  isOut: boolean;
}

interface FullGameState {
  phase: GamePhase;
  players: Player[];
  communityCards: Card[];
  pot: number;
  currentBet: number;
  dealerIndex: number;
  roundNumber: number;
  message: string;
  lastWinner: string;
  winningHand: string;
}

const playerNames = ["You", "Alex", "Sam", "Jordan", "Riley"];
const playerEmojis = ["🎮", "🤖", "🎯", "🎲", "🃏"];

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

const evaluateHand = (cards: Card[]): { rank: number; name: string; highCard: number } => {
  const cardValues = cards.map(c => getCardValue(c.value)).sort((a, b) => b - a);
  const suitCounts: Record<string, number> = {};
  cards.forEach(c => suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1);
  
  const valueCounts: Record<number, number> = {};
  cardValues.forEach(v => valueCounts[v] = (valueCounts[v] || 0) + 1);
  const counts = Object.entries(valueCounts).sort((a, b) => b[1] - a[1] || parseInt(b[0]) - parseInt(a[0]));
  
  const isFlush = Object.values(suitCounts).some(count => count >= 5);
  const uniqueValues = [...new Set(cardValues)].sort((a, b) => b - a);
  
  let isStraight = false;
  let straightHigh = 0;
  for (let i = 0; i <= uniqueValues.length - 5; i++) {
    if (uniqueValues[i] - uniqueValues[i + 4] === 4) {
      isStraight = true;
      straightHigh = uniqueValues[i];
      break;
    }
  }
  if (uniqueValues.includes(14) && uniqueValues.includes(2) && uniqueValues.includes(3) && uniqueValues.includes(4) && uniqueValues.includes(5)) {
    isStraight = true;
    straightHigh = 5;
  }

  const highCard = cardValues[0];

  if (isFlush && isStraight && straightHigh === 14) return { rank: 1, name: "Royal Flush", highCard };
  if (isFlush && isStraight) return { rank: 2, name: "Straight Flush", highCard: straightHigh };
  if (counts[0][1] === 4) return { rank: 3, name: "Four of a Kind", highCard: parseInt(counts[0][0]) };
  if (counts[0][1] === 3 && counts[1]?.[1] >= 2) return { rank: 4, name: "Full House", highCard: parseInt(counts[0][0]) };
  if (isFlush) return { rank: 5, name: "Flush", highCard };
  if (isStraight) return { rank: 6, name: "Straight", highCard: straightHigh };
  if (counts[0][1] === 3) return { rank: 7, name: "Three of a Kind", highCard: parseInt(counts[0][0]) };
  if (counts[0][1] === 2 && counts[1]?.[1] === 2) return { rank: 8, name: "Two Pair", highCard: Math.max(parseInt(counts[0][0]), parseInt(counts[1][0])) };
  if (counts[0][1] === 2) return { rank: 9, name: "One Pair", highCard: parseInt(counts[0][0]) };
  return { rank: 10, name: "High Card", highCard };
};

const SMALL_BLIND = 5;
const BIG_BLIND = 10;
const STARTING_CHIPS = 100;

const FullPokerGame = () => {
  const [numOpponents, setNumOpponents] = useState(2);
  const [game, setGame] = useState<FullGameState>({
    phase: "setup",
    players: [],
    communityCards: [],
    pot: 0,
    currentBet: 0,
    dealerIndex: 0,
    roundNumber: 0,
    message: "Choose how many opponents you want to play against!",
    lastWinner: "",
    winningHand: "",
  });

  const initializePlayers = (count: number): Player[] => {
    return Array.from({ length: count + 1 }, (_, i) => ({
      id: i,
      name: playerNames[i],
      chips: STARTING_CHIPS,
      cards: [],
      folded: false,
      currentBet: 0,
      isOut: false,
    }));
  };

  const startGame = useCallback(() => {
    const players = initializePlayers(numOpponents);
    setGame({
      phase: "preflop",
      players,
      communityCards: [],
      pot: 0,
      currentBet: 0,
      dealerIndex: 0,
      roundNumber: 1,
      message: "Game started! Let's play!",
      lastWinner: "",
      winningHand: "",
    });
    dealNewRound(players, 0, 1);
  }, [numOpponents]);

  const dealNewRound = (currentPlayers: Player[], dealerIdx: number, roundNum: number) => {
    const deck = shuffleDeck();
    const activePlayers = currentPlayers.filter(p => !p.isOut);
    
    if (activePlayers.length <= 1) {
      const winner = activePlayers[0] || currentPlayers[0];
      setGame(prev => ({
        ...prev,
        phase: "gameOver",
        message: winner.id === 0 
          ? "🎉 Congratulations! You won the entire game!" 
          : `Game Over! ${winner.name} won the game!`,
      }));
      return;
    }

    let cardIndex = 0;
    const updatedPlayers = currentPlayers.map(player => {
      if (player.isOut) return { ...player, cards: [], folded: true, currentBet: 0 };
      const cards = [deck[cardIndex++], deck[cardIndex++]];
      return { ...player, cards, folded: false, currentBet: 0 };
    });

    const communityCards = [
      deck[cardIndex++], deck[cardIndex++], deck[cardIndex++],
      deck[cardIndex++], deck[cardIndex++]
    ];

    // Post blinds
    const sbIndex = (dealerIdx + 1) % updatedPlayers.length;
    const bbIndex = (dealerIdx + 2) % updatedPlayers.length;
    
    let sbPlayer = updatedPlayers[sbIndex];
    let bbPlayer = updatedPlayers[bbIndex];
    
    // Find next active player for blinds
    let sbActiveIdx = sbIndex;
    while (updatedPlayers[sbActiveIdx].isOut) {
      sbActiveIdx = (sbActiveIdx + 1) % updatedPlayers.length;
    }
    let bbActiveIdx = (sbActiveIdx + 1) % updatedPlayers.length;
    while (updatedPlayers[bbActiveIdx].isOut) {
      bbActiveIdx = (bbActiveIdx + 1) % updatedPlayers.length;
    }

    const sbAmount = Math.min(SMALL_BLIND, updatedPlayers[sbActiveIdx].chips);
    const bbAmount = Math.min(BIG_BLIND, updatedPlayers[bbActiveIdx].chips);

    updatedPlayers[sbActiveIdx] = { 
      ...updatedPlayers[sbActiveIdx], 
      chips: updatedPlayers[sbActiveIdx].chips - sbAmount,
      currentBet: sbAmount 
    };
    updatedPlayers[bbActiveIdx] = { 
      ...updatedPlayers[bbActiveIdx], 
      chips: updatedPlayers[bbActiveIdx].chips - bbAmount,
      currentBet: bbAmount 
    };

    setGame({
      phase: "preflop",
      players: updatedPlayers,
      communityCards,
      pot: sbAmount + bbAmount,
      currentBet: BIG_BLIND,
      dealerIndex: dealerIdx,
      roundNumber: roundNum,
      message: `Round ${roundNum}! Blinds posted. Your turn to act!`,
      lastWinner: "",
      winningHand: "",
    });
  };

  const handleFold = () => {
    setGame(prev => {
      const updatedPlayers = prev.players.map((p, i) => 
        i === 0 ? { ...p, folded: true } : p
      );
      
      const activePlayers = updatedPlayers.filter(p => !p.folded && !p.isOut);
      if (activePlayers.length === 1) {
        const winner = activePlayers[0];
        return {
          ...prev,
          players: updatedPlayers.map(p => 
            p.id === winner.id ? { ...p, chips: p.chips + prev.pot } : p
          ),
          phase: "roundEnd",
          message: `You folded. ${winner.name} wins ${prev.pot} chips!`,
          lastWinner: winner.name,
          pot: 0,
        };
      }
      
      return { ...prev, players: updatedPlayers, message: "You folded. Watch the opponents play..." };
    });
  };

  const simulateOpponents = (currentGame: FullGameState): FullGameState => {
    let updatedGame = { ...currentGame };
    let updatedPlayers = [...currentGame.players];
    let currentPot = currentGame.pot;
    let currentBet = currentGame.currentBet;

    // Simple AI: opponents either call, raise (20% chance), or fold (if weak hand and high bet)
    for (let i = 1; i < updatedPlayers.length; i++) {
      const player = updatedPlayers[i];
      if (player.folded || player.isOut) continue;

      const callAmount = currentBet - player.currentBet;
      const handStrength = evaluateHand([...player.cards, ...currentGame.communityCards.slice(0, 
        currentGame.phase === "preflop" ? 0 : 
        currentGame.phase === "flop" ? 3 : 
        currentGame.phase === "turn" ? 4 : 5
      )]);

      // Decision logic
      const random = Math.random();
      const shouldFold = handStrength.rank >= 9 && callAmount > 15 && random < 0.3;
      const shouldRaise = handStrength.rank <= 5 && random < 0.2 && player.chips > callAmount + 10;

      if (shouldFold && callAmount > 0) {
        updatedPlayers[i] = { ...player, folded: true };
      } else if (shouldRaise) {
        const raiseAmount = 10;
        const totalBet = callAmount + raiseAmount;
        const actualBet = Math.min(totalBet, player.chips);
        updatedPlayers[i] = { 
          ...player, 
          chips: player.chips - actualBet,
          currentBet: player.currentBet + actualBet
        };
        currentPot += actualBet;
        currentBet = player.currentBet + actualBet;
      } else {
        const actualCall = Math.min(callAmount, player.chips);
        updatedPlayers[i] = { 
          ...player, 
          chips: player.chips - actualCall,
          currentBet: player.currentBet + actualCall
        };
        currentPot += actualCall;
      }
    }

    return { ...updatedGame, players: updatedPlayers, pot: currentPot, currentBet };
  };

  const advancePhase = (action: "call" | "raise" | "check") => {
    setGame(prev => {
      let updatedPlayers = [...prev.players];
      let newPot = prev.pot;
      let newCurrentBet = prev.currentBet;

      // Handle player action
      const player = updatedPlayers[0];
      if (action === "call") {
        const callAmount = Math.min(prev.currentBet - player.currentBet, player.chips);
        updatedPlayers[0] = { 
          ...player, 
          chips: player.chips - callAmount,
          currentBet: player.currentBet + callAmount
        };
        newPot += callAmount;
      } else if (action === "raise") {
        const callAmount = prev.currentBet - player.currentBet;
        const raiseAmount = 10;
        const totalBet = Math.min(callAmount + raiseAmount, player.chips);
        updatedPlayers[0] = { 
          ...player, 
          chips: player.chips - totalBet,
          currentBet: player.currentBet + totalBet
        };
        newPot += totalBet;
        newCurrentBet = player.currentBet + totalBet;
      }

      // Simulate opponents
      const afterOpponents = simulateOpponents({ 
        ...prev, 
        players: updatedPlayers, 
        pot: newPot, 
        currentBet: newCurrentBet 
      });
      updatedPlayers = afterOpponents.players;
      newPot = afterOpponents.pot;

      // Check if only one player left
      const activePlayers = updatedPlayers.filter(p => !p.folded && !p.isOut);
      if (activePlayers.length === 1) {
        const winner = activePlayers[0];
        return {
          ...prev,
          players: updatedPlayers.map(p => 
            p.id === winner.id ? { ...p, chips: p.chips + newPot } : p
          ),
          pot: 0,
          phase: "roundEnd",
          message: `${winner.name} wins ${newPot} chips! Everyone else folded.`,
          lastWinner: winner.name,
        };
      }

      // Reset current bets for next phase
      updatedPlayers = updatedPlayers.map(p => ({ ...p, currentBet: 0 }));

      // Advance to next phase
      const phaseOrder: GamePhase[] = ["preflop", "flop", "turn", "river", "showdown"];
      const currentIdx = phaseOrder.indexOf(prev.phase as GamePhase);
      const nextPhase = phaseOrder[currentIdx + 1] || "showdown";

      const phaseMessages: Record<string, string> = {
        flop: "The Flop is here! Three community cards revealed!",
        turn: "The Turn card appears!",
        river: "The River - final card!",
        showdown: "Showdown time! Let's see who wins!",
      };

      return {
        ...prev,
        players: updatedPlayers,
        pot: newPot,
        currentBet: 0,
        phase: nextPhase,
        message: phaseMessages[nextPhase] || prev.message,
      };
    });
  };

  const handleShowdown = () => {
    setGame(prev => {
      const activePlayers = prev.players.filter(p => !p.folded && !p.isOut);
      
      let bestPlayer: Player | null = null;
      let bestHand = { rank: 11, name: "", highCard: 0 };

      activePlayers.forEach(player => {
        const hand = evaluateHand([...player.cards, ...prev.communityCards]);
        if (hand.rank < bestHand.rank || (hand.rank === bestHand.rank && hand.highCard > bestHand.highCard)) {
          bestHand = hand;
          bestPlayer = player;
        }
      });

      if (!bestPlayer) return prev;

      const updatedPlayers = prev.players.map(p => 
        p.id === bestPlayer!.id ? { ...p, chips: p.chips + prev.pot } : p
      );

      return {
        ...prev,
        players: updatedPlayers,
        phase: "roundEnd",
        pot: 0,
        message: `${bestPlayer.name} wins with ${bestHand.name}!`,
        lastWinner: bestPlayer.name,
        winningHand: bestHand.name,
      };
    });
  };

  const startNextRound = () => {
    setGame(prev => {
      // Mark players with 0 chips as out
      const updatedPlayers = prev.players.map(p => ({
        ...p,
        isOut: p.chips <= 0,
        folded: false,
        currentBet: 0,
        cards: [],
      }));

      // Check if game is over
      const activePlayers = updatedPlayers.filter(p => !p.isOut);
      if (activePlayers.length <= 1 || updatedPlayers[0].isOut) {
        const winner = updatedPlayers[0].isOut 
          ? activePlayers[0] 
          : updatedPlayers[0];
        return {
          ...prev,
          players: updatedPlayers,
          phase: "gameOver",
          message: winner?.id === 0 
            ? "🎉 You won the entire game! Amazing!" 
            : `Game Over! ${winner?.name || "Opponent"} wins the game!`,
        };
      }

      const newDealerIdx = (prev.dealerIndex + 1) % updatedPlayers.length;
      const newRoundNum = prev.roundNumber + 1;

      // Deal new round
      setTimeout(() => dealNewRound(updatedPlayers, newDealerIdx, newRoundNum), 100);

      return {
        ...prev,
        players: updatedPlayers,
        phase: "preflop",
        message: `Starting Round ${newRoundNum}...`,
      };
    });
  };

  const resetGame = () => {
    setGame({
      phase: "setup",
      players: [],
      communityCards: [],
      pot: 0,
      currentBet: 0,
      dealerIndex: 0,
      roundNumber: 0,
      message: "Choose how many opponents you want to play against!",
      lastWinner: "",
      winningHand: "",
    });
  };

  const player = game.players[0];
  const canCheck = game.currentBet === 0 || (player?.currentBet || 0) >= game.currentBet;
  const callAmount = game.currentBet - (player?.currentBet || 0);

  return (
    <div className="bg-card rounded-3xl p-6 md:p-8 border-2 border-border card-shadow">
      {/* Header with Chip */}
      <div className="flex items-start gap-4 mb-6">
        <ChipMascot size="md" animate={game.phase !== "gameOver"} />
        <div className="flex-1 bg-muted rounded-2xl p-4">
          <p className="text-foreground font-medium">{game.message}</p>
          {game.roundNumber > 0 && game.phase !== "setup" && game.phase !== "gameOver" && (
            <p className="text-sm text-muted-foreground mt-1">
              Round {game.roundNumber} • Pot: {game.pot} chips
            </p>
          )}
        </div>
      </div>

      {/* Setup Screen */}
      <AnimatePresence mode="wait">
        {game.phase === "setup" && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="font-fredoka font-bold text-xl mb-4 flex items-center justify-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                How many opponents?
              </h3>
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4].map(num => (
                  <motion.button
                    key={num}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setNumOpponents(num)}
                    className={`w-16 h-16 rounded-2xl font-fredoka font-bold text-2xl transition-all ${
                      numOpponents === num
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {num}
                  </motion.button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                You'll play against {numOpponents} opponent{numOpponents > 1 ? "s" : ""}
              </p>
            </div>

            <div className="bg-muted/50 rounded-2xl p-4">
              <h4 className="font-semibold mb-2">Game Rules:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Everyone starts with {STARTING_CHIPS} chips</li>
                <li>• Small blind: {SMALL_BLIND}, Big blind: {BIG_BLIND}</li>
                <li>• Play until one player has all the chips!</li>
              </ul>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={startGame}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-fredoka font-bold text-lg py-4 rounded-2xl button-shadow"
            >
              Start Playing! <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}

        {/* Game Screen */}
        {game.phase !== "setup" && game.phase !== "gameOver" && (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Players chips display */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {game.players.map((p, i) => (
                <div
                  key={p.id}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium flex items-center gap-2 ${
                    p.isOut
                      ? "bg-muted/50 text-muted-foreground line-through"
                      : p.folded
                      ? "bg-muted text-muted-foreground"
                      : i === 0
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <span>{playerEmojis[i]}</span>
                  <span>{p.name}</span>
                  <span className="font-bold">{p.chips}</span>
                  {p.folded && !p.isOut && <span className="text-xs">(folded)</span>}
                  {p.isOut && <span className="text-xs">(out)</span>}
                </div>
              ))}
            </div>

            {/* Game Table */}
            <div className="bg-success/90 rounded-[40px] p-4 md:p-6 border-8 border-success/70 shadow-xl mb-6">
              <div className="bg-success/80 rounded-[30px] p-4 border-4 border-success/50">
                {/* Opponents cards */}
                <div className="flex justify-center gap-4 mb-4 flex-wrap">
                  {game.players.slice(1).map((opponent, idx) => (
                    <div key={opponent.id} className={`text-center ${opponent.isOut || opponent.folded ? "opacity-40" : ""}`}>
                      <p className="text-primary-foreground/80 text-xs font-semibold mb-1">
                        {playerEmojis[idx + 1]} {opponent.name}
                      </p>
                      <div className="flex gap-1 justify-center">
                        {game.phase === "roundEnd" || game.phase === "showdown" ? (
                          opponent.folded || opponent.isOut ? (
                            <span className="text-xs text-primary-foreground/50">Folded</span>
                          ) : (
                            opponent.cards.map((card, i) => (
                              <PlayingCard key={i} suit={card.suit} value={card.value} size="sm" />
                            ))
                          )
                        ) : (
                          opponent.folded || opponent.isOut ? (
                            <span className="text-xs text-primary-foreground/50">Folded</span>
                          ) : (
                            <>
                              <PlayingCard suit="spades" value="" faceDown size="sm" />
                              <PlayingCard suit="spades" value="" faceDown size="sm" />
                            </>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Community Cards */}
                <div className="flex justify-center gap-2 my-4">
                  {game.communityCards.slice(0, 3).map((card, i) => (
                    <motion.div
                      key={`flop-${i}`}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ 
                        opacity: ["flop", "turn", "river", "showdown", "roundEnd"].includes(game.phase) ? 1 : 0.3,
                        scale: ["flop", "turn", "river", "showdown", "roundEnd"].includes(game.phase) ? 1 : 0.9
                      }}
                    >
                      {["flop", "turn", "river", "showdown", "roundEnd"].includes(game.phase) ? (
                        <PlayingCard suit={card.suit} value={card.value} size="sm" />
                      ) : (
                        <div className="w-10 h-14 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20" />
                      )}
                    </motion.div>
                  ))}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ 
                      opacity: ["turn", "river", "showdown", "roundEnd"].includes(game.phase) ? 1 : 0.3,
                      scale: ["turn", "river", "showdown", "roundEnd"].includes(game.phase) ? 1 : 0.9
                    }}
                  >
                    {["turn", "river", "showdown", "roundEnd"].includes(game.phase) ? (
                      <PlayingCard suit={game.communityCards[3]?.suit} value={game.communityCards[3]?.value} size="sm" />
                    ) : (
                      <div className="w-10 h-14 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20" />
                    )}
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ 
                      opacity: ["river", "showdown", "roundEnd"].includes(game.phase) ? 1 : 0.3,
                      scale: ["river", "showdown", "roundEnd"].includes(game.phase) ? 1 : 0.9
                    }}
                  >
                    {["river", "showdown", "roundEnd"].includes(game.phase) ? (
                      <PlayingCard suit={game.communityCards[4]?.suit} value={game.communityCards[4]?.value} size="sm" />
                    ) : (
                      <div className="w-10 h-14 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20" />
                    )}
                  </motion.div>
                </div>

                {/* Pot display */}
                <div className="text-center mb-3">
                  <span className="bg-secondary px-4 py-1 rounded-full text-secondary-foreground font-fredoka font-bold text-sm">
                    Pot: {game.pot}
                  </span>
                </div>

                {/* Player's Cards */}
                <div className="flex justify-center">
                  <div className="text-center">
                    <p className="text-primary-foreground/80 text-xs font-semibold mb-1">Your Cards</p>
                    <div className="flex gap-2 justify-center">
                      {player?.cards.map((card, i) => (
                        <motion.div
                          key={i}
                          initial={{ y: 30, opacity: 0 }}
                          animate={{ y: 0, opacity: player.folded ? 0.4 : 1 }}
                        >
                          <PlayingCard suit={card.suit} value={card.value} size="md" />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              {["preflop", "flop", "turn", "river"].includes(game.phase) && !player?.folded && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleFold}
                    className="bg-accent text-accent-foreground font-fredoka font-bold px-5 py-3 rounded-xl shadow-lg"
                  >
                    Fold
                  </motion.button>

                  {canCheck ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => advancePhase("check")}
                      className="bg-muted text-foreground font-fredoka font-bold px-5 py-3 rounded-xl shadow-lg"
                    >
                      Check
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => advancePhase("call")}
                      className="bg-primary text-primary-foreground font-fredoka font-bold px-5 py-3 rounded-xl button-shadow"
                    >
                      Call {callAmount}
                    </motion.button>
                  )}

                  {player && player.chips > callAmount && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => advancePhase("raise")}
                      className="bg-secondary text-secondary-foreground font-fredoka font-bold px-5 py-3 rounded-xl shadow-lg"
                    >
                      Raise +10
                    </motion.button>
                  )}
                </>
              )}

              {game.phase === "showdown" && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShowdown}
                  className="flex items-center gap-2 bg-secondary text-secondary-foreground font-fredoka font-bold px-6 py-3 rounded-xl shadow-lg"
                >
                  Reveal Winner! <Trophy className="w-5 h-5" />
                </motion.button>
              )}

              {game.phase === "roundEnd" && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startNextRound}
                  className="flex items-center gap-2 bg-primary text-primary-foreground font-fredoka font-bold px-6 py-3 rounded-xl button-shadow"
                >
                  Next Round <ChevronRight className="w-5 h-5" />
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {/* Game Over Screen */}
        {game.phase === "gameOver" && (
          <motion.div
            key="gameover"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            {game.players[0]?.chips > 0 && !game.players[0]?.isOut ? (
              <div className="space-y-4">
                <motion.div
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5, repeat: 3 }}
                >
                  <Crown className="w-20 h-20 text-secondary mx-auto" />
                </motion.div>
                <h2 className="font-fredoka font-bold text-3xl text-primary">You Won!</h2>
                <p className="text-muted-foreground">
                  Amazing job! You beat all {numOpponents} opponent{numOpponents > 1 ? "s" : ""}!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <Frown className="w-20 h-20 text-muted-foreground mx-auto" />
                <h2 className="font-fredoka font-bold text-3xl">Game Over</h2>
                <p className="text-muted-foreground">
                  You ran out of chips! Better luck next time!
                </p>
              </div>
            )}

            <div className="mt-6 bg-muted rounded-2xl p-4">
              <p className="text-sm text-muted-foreground mb-2">Final Results:</p>
              <div className="space-y-1">
                {game.players
                  .sort((a, b) => b.chips - a.chips)
                  .map((p, i) => (
                    <div
                      key={p.id}
                      className={`flex justify-between items-center px-3 py-1 rounded-lg ${
                        i === 0 ? "bg-secondary/20" : ""
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {i === 0 && <Crown className="w-4 h-4 text-secondary" />}
                        {playerEmojis[p.id]} {p.name}
                      </span>
                      <span className="font-bold">{p.chips} chips</span>
                    </div>
                  ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={resetGame}
              className="mt-6 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-fredoka font-bold px-6 py-3 rounded-xl button-shadow mx-auto"
            >
              <RotateCcw className="w-5 h-5" /> Play Again
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FullPokerGame;
