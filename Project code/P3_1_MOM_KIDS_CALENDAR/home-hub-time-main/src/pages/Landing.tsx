import { Button } from "@/components/ui/button";
import { Calendar, Users, MessageCircle, Bell, Palette, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  const features = [
    {
      icon: Calendar,
      title: "Ühine tunniplaan",
      description: "Jälgi kooli, trenni ja muusikatunde ühes kohas. Uuenda liikvel olles.",
    },
    {
      icon: Users,
      title: "Peregrupid",
      description: "Loo perekontod, kus kõik on ühendatud ja kursis.",
    },
    {
      icon: MessageCircle,
      title: "Kommentaarid ja märkmed",
      description: "Jäta üksteisele sõnumeid iga tunniplaani kirje juurde. Püsi koordineeritud.",
    },
    {
      icon: Bell,
      title: "Kohesed teavitused",
      description: "Saa kohe teada, kui pereliige teeb muudatusi.",
    },
    {
      icon: Palette,
      title: "Isiklikud teemad",
      description: "Las iga laps valib oma värvid. Tee see tema omaks.",
    },
    {
      icon: Shield,
      title: "Ajalugu ja varukoopiand",
      description: "Kõik muudatused salvestatakse. Vaata vanemaid tunniplaane igal ajal.",
    },
  ];

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="container py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">PereTunniplaan</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/auth">Logi sisse</Link>
            </Button>
            <Button variant="hero" asChild>
              <Link to="/auth?mode=signup">Alusta</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in">
            <Bell className="w-4 h-4" />
            Ära jää enam kunagi tunniplaani muudatusest ilma
          </div>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 animate-fade-in text-balance" style={{ animationDelay: "0.1s" }}>
            Sinu pere tunniplaan,{" "}
            <span className="text-primary">alati sünkroonis</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Koolid muudavad tunniplaane. Treenerid lükkavad aegu. Muusikatunnid liiguvad ringi.
            PereTunniplaan hoiab kõiki koheselt kursis—et su lapsed teaksid alati, kuhu minna.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Button variant="hero" size="xl" asChild>
              <Link to="/auth?mode=signup">Alusta tasuta täna</Link>
            </Button>
            <Button variant="outline" size="xl" asChild>
              <Link to="/auth">Logi sisse</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Activity Preview */}
      <section className="container pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-2xl shadow-xl border border-border/50 overflow-hidden animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-destructive"></div>
                <div className="w-3 h-3 rounded-full bg-other"></div>
                <div className="w-3 h-3 rounded-full bg-training"></div>
              </div>
            </div>
            <div className="p-6 space-y-3">
              <div className="activity-school rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">Matemaatika</p>
                  <p className="text-sm text-muted-foreground">8:00 - 9:30</p>
                </div>
                <span className="text-xs bg-school/20 text-school px-2 py-1 rounded-full font-medium">Kool</span>
              </div>
              <div className="activity-training rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">Jalgpalli trenn</p>
                  <p className="text-sm text-muted-foreground">16:00 - 17:30</p>
                </div>
                <span className="text-xs bg-training/20 text-training px-2 py-1 rounded-full font-medium">Trenn</span>
              </div>
              <div className="activity-music rounded-lg p-4 flex items-center justify-between relative">
                <div>
                  <p className="font-semibold text-foreground">Klaveritund</p>
                  <p className="text-sm text-muted-foreground">18:00 - 19:00</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-destructive/20 text-destructive px-2 py-1 rounded-full font-medium animate-pulse-soft">Uuendatud!</span>
                  <span className="text-xs bg-music/20 text-music px-2 py-1 rounded-full font-medium">Muusika</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Kõik, mida su pere vajab
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Loodud vanemate poolt, kes mõistavad mitme lapse tunniplaanide haldamise kaost.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="bg-card rounded-xl p-6 border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${0.1 * index}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center bg-card rounded-3xl p-8 md:p-12 border border-border/50 shadow-xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Valmis pere tunniplaani lihtsustama?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Liitu peredega, kes ei jää enam kunagi tunniplaani muudatusest ilma. Tasuta alustada, krediitkaarti pole vaja.
          </p>
          <Button variant="hero" size="xl" asChild>
            <Link to="/auth?mode=signup">Loo oma perekonto</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container py-8 border-t border-border">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-warm flex items-center justify-center">
              <Calendar className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground">PereTunniplaan</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 PereTunniplaan. Hoiame perekondi ühenduses.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
