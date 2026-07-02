import { motion } from "framer-motion";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import ChipMascot from "./ChipMascot";
import UserMenu from "./UserMenu";

const navItems = [
  { label: "What is Poker?", href: "#what-is-poker" },
  { label: "Hand Rankings", href: "#hand-rankings" },
  { label: "How to Play", href: "#how-to-play" },
  { label: "Actions", href: "#actions" },
  { label: "Win Tips", href: "#strategy" },
  { label: "Practice", href: "#practice" },
  { label: "Play it!", href: "#play" },
];

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border"
    >
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <ChipMascot size="sm" animate={false} />
            <span className="font-fredoka font-bold text-xl text-primary">
              Chip's Poker School
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => scrollToSection(item.href)}
                className="font-nunito font-semibold text-muted-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </button>
            ))}
            <UserMenu />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <UserMenu />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-border"
          >
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => scrollToSection(item.href)}
                className="block w-full text-left py-3 font-nunito font-semibold text-muted-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navigation;
