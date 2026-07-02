import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import LessonSection from "@/components/LessonSection";
import HandRankings from "@/components/HandRankings";
import PokerTable from "@/components/PokerTable";
import ActionButtons from "@/components/ActionButtons";
import StrategyTip from "@/components/StrategyTip";
import PlayingCard from "@/components/PlayingCard";
import PracticeGame from "@/components/PracticeGame";
import FullPokerGame from "@/components/FullPokerGame";
import { motion } from "framer-motion";
import { Heart, Gamepad2, Trophy } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />

      {/* Lesson 1: What is Poker? */}
      <LessonSection
        id="what-is-poker"
        title="What is Texas Hold'em? 🎴"
        mascotMessage="Texas Hold'em is the most popular card game in the world! It's super fun and easy to learn. Let me show you how it works!"
      >
        <div className="space-y-6 text-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card rounded-2xl p-6 border-2 border-border"
          >
            <h3 className="font-fredoka font-bold text-xl mb-3 text-primary">
              🎯 The Goal
            </h3>
            <p className="text-muted-foreground">
              Make the <strong>best 5-card hand</strong> using your 2 private cards 
              (called "hole cards") and the 5 shared cards on the table 
              (called "community cards"). The player with the best hand wins!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl p-6 border-2 border-border"
          >
            <h3 className="font-fredoka font-bold text-xl mb-3 text-primary">
              👥 How Many Players?
            </h3>
            <p className="text-muted-foreground">
              Texas Hold'em is played with <strong>2 to 10 players</strong>. 
              Each player gets 2 secret cards that only they can see. Then, 
              5 cards are placed face-up in the middle for everyone to use!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl p-6 border-2 border-border"
          >
            <h3 className="font-fredoka font-bold text-xl mb-3 text-primary">
              💰 Chips and Betting
            </h3>
            <p className="text-muted-foreground">
              Players use <strong>chips</strong> instead of real money. 
              You bet chips when you think you have a good hand. 
              If everyone else gives up (folds), you win all the chips 
              in the middle (called the "pot")!
            </p>
          </motion.div>

          {/* Visual: Your cards vs community cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-primary/5 rounded-2xl p-6 border-2 border-primary/20"
          >
            <h3 className="font-fredoka font-bold text-xl mb-4 text-center">
              Your Cards vs Community Cards
            </h3>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              <div className="text-center">
                <p className="text-sm font-semibold mb-2 text-muted-foreground">
                  Your Secret Cards (Only You See!)
                </p>
                <div className="flex gap-2 justify-center">
                  <PlayingCard suit="hearts" value="A" size="lg" />
                  <PlayingCard suit="spades" value="K" size="lg" />
                </div>
              </div>
              <span className="text-4xl">+</span>
              <div className="text-center">
                <p className="text-sm font-semibold mb-2 text-muted-foreground">
                  Community Cards (Everyone Sees!)
                </p>
                <div className="flex gap-1 justify-center">
                  <PlayingCard suit="hearts" value="K" size="md" />
                  <PlayingCard suit="diamonds" value="7" size="md" />
                  <PlayingCard suit="clubs" value="2" size="md" />
                  <PlayingCard suit="hearts" value="Q" size="md" />
                  <PlayingCard suit="spades" value="J" size="md" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </LessonSection>

      {/* Lesson 2: Hand Rankings */}
      <LessonSection
        id="hand-rankings"
        title="Hand Rankings - Best to Worst! 🏆"
        mascotMessage="This is the most important part! Memorize these hands from best (#1) to worst (#10). The better your hand, the more likely you'll win!"
        bgVariant="alt"
      >
        <HandRankings />
      </LessonSection>

      {/* Lesson 3: How to Play */}
      <LessonSection
        id="how-to-play"
        title="The Game Rounds 🔄"
        mascotMessage="A poker hand has 4 rounds of betting. Let me explain each one!"
      >
        <div className="space-y-8">
          {/* Blinds explanation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-secondary/10 rounded-2xl p-6 border-2 border-secondary/30"
          >
            <h3 className="font-fredoka font-bold text-xl mb-3">
              🎟️ First: The Blinds
            </h3>
            <p className="text-muted-foreground mb-4">
              Before cards are dealt, two players must put chips in. These are 
              called <strong>"blinds"</strong>:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-secondary font-bold">•</span>
                <span><strong>Small Blind:</strong> The player to the left of the dealer puts in a small amount</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-secondary font-bold">•</span>
                <span><strong>Big Blind:</strong> The next player puts in double that amount</span>
              </li>
            </ul>
            <p className="text-muted-foreground mt-3 text-sm">
              💡 The blinds make sure there's always something to play for!
            </p>
          </motion.div>

          {/* Poker table visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="my-8"
          >
            <PokerTable />
          </motion.div>

          {/* The 4 rounds */}
          <div className="grid gap-4 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-card rounded-2xl p-5 border-2 border-border"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-fredoka font-bold flex items-center justify-center">
                  1
                </span>
                <h4 className="font-fredoka font-bold text-lg">Pre-Flop</h4>
              </div>
              <p className="text-muted-foreground text-sm">
                You get your 2 secret cards. Look at them (but don't show anyone!). 
                First betting round happens. Should you play or fold?
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-2xl p-5 border-2 border-border"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-fredoka font-bold flex items-center justify-center">
                  2
                </span>
                <h4 className="font-fredoka font-bold text-lg">The Flop</h4>
              </div>
              <p className="text-muted-foreground text-sm">
                3 community cards are placed face-up on the table. 
                Everyone can use these! Another betting round happens.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl p-5 border-2 border-border"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-fredoka font-bold flex items-center justify-center">
                  3
                </span>
                <h4 className="font-fredoka font-bold text-lg">The Turn</h4>
              </div>
              <p className="text-muted-foreground text-sm">
                A 4th community card is added. Your hand might be getting better! 
                Another betting round follows.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-2xl p-5 border-2 border-border"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-fredoka font-bold flex items-center justify-center">
                  4
                </span>
                <h4 className="font-fredoka font-bold text-lg">The River</h4>
              </div>
              <p className="text-muted-foreground text-sm">
                The 5th and final community card appears. Last betting round! 
                Then remaining players show their cards. Best hand wins!
              </p>
            </motion.div>
          </div>

          {/* Showdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-success/10 rounded-2xl p-6 border-2 border-success/30"
          >
            <h3 className="font-fredoka font-bold text-xl mb-3 text-success">
              🎉 The Showdown!
            </h3>
            <p className="text-muted-foreground">
              After the final betting round, if more than one player is still in, 
              it's time for the <strong>Showdown</strong>! Everyone shows their cards, 
              and the player with the best 5-card hand wins all the chips in the pot!
            </p>
          </motion.div>
        </div>
      </LessonSection>

      {/* Lesson 4: Actions */}
      <LessonSection
        id="actions"
        title="Your Turn - What Can You Do? 🤔"
        mascotMessage="When it's your turn to act, you have 4 choices. Let's learn what each one means!"
        bgVariant="alt"
      >
        <ActionButtons />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 bg-card rounded-2xl p-6 border-2 border-border"
        >
          <h3 className="font-fredoka font-bold text-xl mb-4">
            🎓 Quick Example!
          </h3>
          <p className="text-muted-foreground">
            Imagine the big blind is 10 chips, and someone bets 30 chips. 
            Now it's your turn! You can:
          </p>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold">Fold:</span>
              <span>Give up and wait for the next hand (costs you nothing more)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">Call:</span>
              <span>Put in 30 chips to match and stay in the hand</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-secondary font-bold">Raise:</span>
              <span>Put in more than 30 (like 60 or 100) to make others pay more!</span>
            </li>
          </ul>
        </motion.div>
      </LessonSection>

      {/* Lesson 5: Strategy Tips */}
      <LessonSection
        id="strategy"
        title="Tips to Win! 🌟"
        mascotMessage="Now you know the rules! Here are my best tips to help you play smart and win more games!"
      >
        <div className="space-y-4">
          <StrategyTip
            index={0}
            title="Be Patient!"
            tip="Don't play every hand! Wait for good cards. If your starting cards are bad (like 2 and 7 of different suits), just fold and wait for better cards."
            level="beginner"
          />
          
          <StrategyTip
            index={1}
            title="Position is Power"
            tip="Players who act last have a big advantage because they can see what everyone else does first. When you're in late position (near the dealer button), you can play more hands!"
            level="beginner"
          />
          
          <StrategyTip
            index={2}
            title="Start with Strong Pairs"
            tip="Pairs like AA, KK, QQ, and JJ are amazing starting hands! Also great: AK, AQ (same suit is even better!). These hands win often!"
            level="beginner"
          />
          
          <StrategyTip
            index={3}
            title="Watch Your Opponents"
            tip="Pay attention to how others play. Do they bet big only with good hands? Do they bluff a lot? This information helps you make better decisions!"
            level="intermediate"
          />
          
          <StrategyTip
            index={4}
            title="Protect Your Chips"
            tip="Don't bet all your chips on one hand unless you're super confident. It's okay to fold and try again next hand. Good players lose small and win big!"
            level="intermediate"
          />
          
          <StrategyTip
            index={5}
            title="Learn to Bluff (Sometimes!)"
            tip="A bluff is when you bet like you have a great hand, even if you don't. But don't bluff too much! If people catch you bluffing, they won't believe you later."
            level="advanced"
          />
        </div>

        {/* Best starting hands */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 bg-primary/5 rounded-2xl p-6 border-2 border-primary/20"
        >
          <h3 className="font-fredoka font-bold text-xl mb-4 text-center">
            🃏 Best Starting Hands to Play!
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex gap-1 justify-center mb-2">
                <PlayingCard suit="spades" value="A" size="sm" />
                <PlayingCard suit="hearts" value="A" size="sm" />
              </div>
              <span className="text-sm font-semibold text-primary">Pocket Aces</span>
              <p className="text-xs text-muted-foreground">The best!</p>
            </div>
            <div className="text-center">
              <div className="flex gap-1 justify-center mb-2">
                <PlayingCard suit="clubs" value="K" size="sm" />
                <PlayingCard suit="diamonds" value="K" size="sm" />
              </div>
              <span className="text-sm font-semibold text-primary">Pocket Kings</span>
              <p className="text-xs text-muted-foreground">Super strong!</p>
            </div>
            <div className="text-center">
              <div className="flex gap-1 justify-center mb-2">
                <PlayingCard suit="hearts" value="A" size="sm" />
                <PlayingCard suit="hearts" value="K" size="sm" />
              </div>
              <span className="text-sm font-semibold text-primary">Ace-King Suited</span>
              <p className="text-xs text-muted-foreground">Big Slick!</p>
            </div>
            <div className="text-center">
              <div className="flex gap-1 justify-center mb-2">
                <PlayingCard suit="spades" value="Q" size="sm" />
                <PlayingCard suit="clubs" value="Q" size="sm" />
              </div>
              <span className="text-sm font-semibold text-primary">Pocket Queens</span>
              <p className="text-xs text-muted-foreground">Ladies rule!</p>
            </div>
          </div>
        </motion.div>
      </LessonSection>

      {/* Lesson 6: Practice Mode */}
      <section id="practice" className="py-16 md:py-24 bg-muted/50">
        <div className="container max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-secondary/20 text-secondary-foreground px-4 py-2 rounded-full mb-4">
              <Gamepad2 className="w-5 h-5 text-secondary" />
              <span className="font-semibold">Practice Mode</span>
            </div>
            <h2 className="font-fredoka font-bold text-3xl md:text-4xl mb-4">
              Time to Play! 🎮
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Now it's your turn! Practice playing a real hand against an opponent. 
              Chip will guide you through each step. Don't worry - these are just practice chips!
            </p>
          </motion.div>

          <PracticeGame />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 bg-primary/5 rounded-2xl p-6 border-2 border-primary/20 text-center"
          >
            <h3 className="font-fredoka font-bold text-xl mb-2">💡 Practice Tips</h3>
            <ul className="text-muted-foreground text-sm space-y-1">
              <li>• Look at your cards and think about what hands you could make</li>
              <li>• Watch how the community cards change your options</li>
              <li>• It's okay to fold if your cards aren't good!</li>
              <li>• Play many hands to learn which starting cards are best</li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Lesson 7: Full Game - Play it! */}
      <section id="play" className="py-16 md:py-24 bg-background">
        <div className="container max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full mb-4">
              <Trophy className="w-5 h-5" />
              <span className="font-semibold">Full Game Mode</span>
            </div>
            <h2 className="font-fredoka font-bold text-3xl md:text-4xl mb-4">
              Play it! 🏆
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ready for a real challenge? Play a complete game against AI opponents! 
              Choose how many players you want to face, and play until someone wins all the chips!
            </p>
          </motion.div>

          <FullPokerGame />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 grid md:grid-cols-3 gap-4"
          >
            <div className="bg-success/10 rounded-2xl p-4 border border-success/30 text-center">
              <span className="text-2xl">🎯</span>
              <h4 className="font-fredoka font-bold mt-2">Goal</h4>
              <p className="text-sm text-muted-foreground">Win all the chips from your opponents!</p>
            </div>
            <div className="bg-secondary/10 rounded-2xl p-4 border border-secondary/30 text-center">
              <span className="text-2xl">💰</span>
              <h4 className="font-fredoka font-bold mt-2">Blinds</h4>
              <p className="text-sm text-muted-foreground">Small: 5 chips, Big: 10 chips</p>
            </div>
            <div className="bg-primary/10 rounded-2xl p-4 border border-primary/30 text-center">
              <span className="text-2xl">🤖</span>
              <h4 className="font-fredoka font-bold mt-2">Opponents</h4>
              <p className="text-sm text-muted-foreground">Choose 1-4 AI players to compete against</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 py-12 border-t border-border">
        <div className="container max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="font-fredoka text-xl mb-2">
              Great job learning with Chip! 🎉
            </p>
            <p className="text-muted-foreground mb-4">
              Remember: Poker is about having fun and making smart decisions.
              Practice with friends and family using chips (not real money)!
            </p>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              Made with <Heart className="w-4 h-4 text-accent fill-accent" /> for young learners
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
