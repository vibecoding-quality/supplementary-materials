import { motion } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";
import ChipMascot from "./ChipMascot";
import PlayingCard from "./PlayingCard";

const HeroSection = () => {
  const scrollToStart = () => {
    const element = document.querySelector("#what-is-poker");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-secondary/5 rounded-full blur-3xl"
        />
      </div>

      {/* Floating cards */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute top-1/4 left-8 md:left-1/6 hidden sm:block"
      >
        <PlayingCard suit="hearts" value="A" size="lg" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute top-1/3 right-8 md:right-1/6 hidden sm:block"
      >
        <PlayingCard suit="spades" value="K" size="lg" />
      </motion.div>
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 3, 0] }}
        transition={{ duration: 3.5, repeat: Infinity }}
        className="absolute bottom-1/3 left-12 md:left-1/5 hidden md:block"
      >
        <PlayingCard suit="clubs" value="Q" size="md" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 15, 0], rotate: [0, -3, 0] }}
        transition={{ duration: 4.5, repeat: Infinity }}
        className="absolute bottom-1/4 right-12 md:right-1/5 hidden md:block"
      >
        <PlayingCard suit="diamonds" value="J" size="md" />
      </motion.div>

      {/* Main content */}
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="flex justify-center mb-8"
        >
          <ChipMascot size="xl" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-2 mb-4"
        >
          <Sparkles className="w-5 h-5 text-secondary" />
          <span className="text-secondary font-semibold">Welcome, young card shark!</span>
          <Sparkles className="w-5 h-5 text-secondary" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="font-fredoka font-bold text-4xl md:text-6xl lg:text-7xl mb-6"
        >
          Learn{" "}
          <span className="text-gradient">Texas Hold'em</span>
          <br />
          with Chip!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto"
        >
          Hi there! I'm Chip, and I'll teach you everything about Texas Hold'em poker 
          in a fun and easy way. Ready to become a poker pro?
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={scrollToStart}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-fredoka font-bold text-lg px-8 py-4 rounded-2xl button-shadow hover:brightness-110 transition-all"
        >
          Let's Start Learning!
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </motion.button>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <ChevronDown className="w-8 h-8 text-muted-foreground" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
