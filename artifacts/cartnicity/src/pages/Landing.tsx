import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  Users, 
  Leaf, 
  MapPin, 
  Truck, 
  ShieldCheck, 
  ArrowRight,
  ChevronRight,
  Star,
  Quote,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logoFull from "@assets/logo_2_1775132861869.png";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const JOIN_FORM_ID = "4f7a987a-0a4a-4e5f-bc06-2c79b7e14c94";
const START_FORM_ID = "6f322199-c192-4f19-bfc0-365e1491331c";
const PORTAL_ID = "148134075";

function HubSpotFormModal({
  open,
  onClose,
  formId,
  title
}: {
  open: boolean;
  onClose: () => void;
  formId: string;
  title: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !containerRef.current) return;

    containerRef.current.innerHTML = "";

    const div = document.createElement("div");
    div.className = "hs-form-frame";
    div.setAttribute("data-region", "eu1");
    div.setAttribute("data-form-id", formId);
    div.setAttribute("data-portal-id", PORTAL_ID);
    containerRef.current.appendChild(div);

    const existingScript = document.querySelector(
      `script[src="https://js-eu1.hsforms.net/forms/embed/${PORTAL_ID}.js"]`
    );
    if (existingScript) {
      existingScript.dispatchEvent(new Event("load"));
    }
  }, [open, formId]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25 }}
        className="relative z-10 bg-background rounded-3xl shadow-2xl border w-full max-w-xl max-h-[90vh] overflow-y-auto p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <img src={logoFull} alt="Cartnicity" className="h-10 object-contain" />
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            aria-label="Close"
            data-testid="btn-close-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <h2 className="text-2xl font-display font-bold mb-2">{title}</h2>
        <p className="text-muted-foreground mb-6 text-sm">Fill out the form below and we'll be in touch shortly.</p>
        <div ref={containerRef} className="min-h-[300px]" />
      </motion.div>
    </div>
  );
}

export default function Landing() {
  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  const [joinOpen, setJoinOpen] = useState(false);
  const [startOpen, setStartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Modals */}
      <HubSpotFormModal
        open={joinOpen}
        onClose={() => setJoinOpen(false)}
        formId={JOIN_FORM_ID}
        title="Join the Next Sweep"
      />
      <HubSpotFormModal
        open={startOpen}
        onClose={() => setStartOpen(false)}
        formId={START_FORM_ID}
        title="Start the Next Sweep"
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center">
            <img src={logoFull} alt="Cartnicity" className="h-14 object-contain" data-testid="nav-logo" />
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">How it Works</a>
            <a href="#communities" className="text-sm font-medium hover:text-primary transition-colors">Communities</a>
            <a href="#products" className="text-sm font-medium hover:text-primary transition-colors">Products</a>
            <a href="#farmers" className="text-sm font-medium hover:text-primary transition-colors">Farmers</a>
          </div>
          <div className="flex items-center gap-4">
            <Button
              data-testid="btn-join-nav"
              onClick={() => setJoinOpen(true)}
            >
              Join the Next Sweep
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <motion.img 
            style={{ y: yHero }}
            src="/images/hero-community.png" 
            alt="Vibrant multicultural community market" 
            className="w-full h-full object-cover opacity-20 dark:opacity-30 mix-blend-multiply"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/95 to-background" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent-foreground font-medium mb-8 border border-accent/20">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
              </span>
              Lifetime free membership for first 1,000 members (300 slots remaining)
            </motion.div>
            
            <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-8 text-foreground leading-[1.1]">
              When your community buys together, <span className="text-primary italic">markets bend.</span>
            </motion.h1>
            
            <motion.p variants={fadeIn} className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Join 5,000+ immigrants across Canada aggregating demand to negotiate wholesale prices directly with Ontario farmers. Save 30%+ on authentic ethnic groceries.
            </motion.p>
            
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="w-full sm:w-auto text-lg h-14 px-8 rounded-full shadow-lg hover-elevate"
                data-testid="btn-hero-join"
                onClick={() => setJoinOpen(true)}
              >
                Join the Next Sweep <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-lg h-14 px-8 rounded-full border-2 hover-elevate"
                data-testid="btn-hero-start"
                onClick={() => setStartOpen(true)}
              >
                Start a Bloc — Get $50
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-primary-foreground/20">
            <div className="text-center px-4">
              <div className="text-4xl font-display font-bold mb-2">$47.3k+</div>
              <div className="text-sm font-medium opacity-90 uppercase tracking-wider">Saved Monthly (Toronto)</div>
            </div>
            <div className="text-center px-4">
              <div className="text-4xl font-display font-bold mb-2">5,000+</div>
              <div className="text-sm font-medium opacity-90 uppercase tracking-wider">Active Members</div>
            </div>
            <div className="text-center px-4">
              <div className="text-4xl font-display font-bold mb-2">30%</div>
              <div className="text-sm font-medium opacity-90 uppercase tracking-wider">Average Savings</div>
            </div>
            <div className="text-center px-4">
              <div className="text-4xl font-display font-bold mb-2">4</div>
              <div className="text-sm font-medium opacity-90 uppercase tracking-wider">Active Cities</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
            <h2 className="text-sm font-bold tracking-widest text-secondary uppercase mb-4">The Block Sweep</h2>
            <h3 className="text-4xl md:text-5xl font-display font-bold mb-6">How neighbourhood groups unlock wholesale power</h3>
            <p className="text-lg text-muted-foreground">It's simple: we aggregate our grocery lists, approach farmers as a single massive buyer, and pass the savings directly to you.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="absolute top-12 left-[10%] right-[10%] h-0.5 bg-border hidden md:block"></div>
            
            {[
              {
                icon: Users,
                title: "1. Join your city's Bloc",
                desc: "Connect with your local community group in Toronto, Brampton, Calgary, or Winnipeg."
              },
              {
                icon: ShieldCheck,
                title: "2. We negotiate in bulk",
                desc: "When the Bloc reaches critical mass, we trigger a 'Sweep' and buy directly from Ontario farmers at wholesale."
              },
              {
                icon: Truck,
                title: "3. Save & get it delivered",
                desc: "Get fresh, authentic groceries delivered next-day while earning cash back rewards for your community."
              }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="relative z-10 bg-card p-8 rounded-3xl border shadow-sm hover-elevate transition-all"
              >
                <div className="w-16 h-16 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center mb-6 border border-secondary/20">
                  <step.icon className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold mb-3">{step.title}</h4>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* City Communities */}
      <section id="communities" className="py-24 bg-muted/50 border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Communities pulling their weight</h2>
              <p className="text-lg text-muted-foreground">Real groups aggregating demand and taking back control of their grocery bills.</p>
            </div>
            <Button
              variant="outline"
              className="rounded-full"
              data-testid="btn-view-cities"
              onClick={() => setJoinOpen(true)}
            >
              View All Active Blocs <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { city: "Toronto", group: "African Community", savings: "$47,300", color: "bg-primary text-primary-foreground" },
              { city: "Brampton", group: "Indian Community", savings: "20% Avg", color: "bg-secondary text-secondary-foreground" },
              { city: "Calgary", group: "Caribbean Community", savings: "$18,900", color: "bg-accent text-accent-foreground" },
              { city: "Winnipeg", group: "Filipino Community", savings: "$9,800", color: "bg-foreground text-background" }
            ].map((bloc, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-8 rounded-3xl ${bloc.color} flex flex-col justify-between aspect-square hover-elevate cursor-pointer`}
                onClick={() => setJoinOpen(true)}
                data-testid={`card-community-${i}`}
              >
                <div>
                  <MapPin className="w-6 h-6 mb-4 opacity-80" />
                  <h4 className="text-2xl font-bold mb-1">{bloc.city}</h4>
                  <p className="font-medium opacity-90">{bloc.group}</p>
                </div>
                <div>
                  <p className="text-sm font-medium opacity-80 uppercase tracking-wide mb-1">Monthly Savings</p>
                  <p className="text-3xl font-display font-bold">{bloc.savings}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products & Farmers */}
      <section id="products" className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-secondary/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl border"
              >
                <img src="/images/groceries-box.png" alt="Fresh authentic groceries" className="w-full h-full object-cover" />
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="absolute -bottom-8 -right-8 md:-right-12 bg-card p-6 rounded-2xl shadow-xl border max-w-xs"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <Leaf className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-bold">Proudly Canadian</h5>
                    <p className="text-sm text-muted-foreground">Ontario family farms</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed">Partnered with trusted multi-generation farms to bring you farm-to-doorstep freshness.</p>
              </motion.div>
            </div>

            <div>
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-8">Premium authentic cuts, negotiated for you.</h2>
              <p className="text-lg text-muted-foreground mb-10">We focus on high-quality, culturally specific groceries that big box stores overprice.</p>

              <div className="space-y-6">
                {[
                  { title: "Fresh Meat Combos", desc: "Halal and premium cuts: Ribeye, Chicken, Lamb, Goat, and Brisket." },
                  { title: "Family Value Stack", desc: "Built for large households needing bulk staples at true wholesale prices." },
                  { title: "Value Pack Solo Plan", desc: "Optimized for students and young professionals." },
                  { title: "Commercial Partner Plan", desc: "For restaurants and caterers within the community network." }
                ].map((plan, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-muted transition-colors border border-transparent hover:border-border">
                    <div className="mt-1">
                      <div className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-1">{plan.title}</h4>
                      <p className="text-muted-foreground">{plan.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10">
                <a
                  href="https://superlative-creponne-d7c509.netlify.app/product"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="btn-view-products"
                >
                  <Button size="lg" className="rounded-full">
                    Explore Products <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Cartnicity */}
      <section id="farmers" className="py-24 md:py-32 bg-secondary text-secondary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">A movement, not a marketplace.</h2>
            <p className="text-lg opacity-90">Cartnicity isn't just a delivery app. We're rebuilding community economics from the ground up.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Built for Culture", desc: "Designed specifically for multicultural communities and their unique grocery needs." },
              { title: "Price Control", desc: "By buying together, we dictate terms instead of accepting whatever supermarkets charge." },
              { title: "Smart Logistics", desc: "Efficient next-day delivery straight from farm to your doorstep." },
              { title: "Circular Rewards", desc: "Earn CartnicityPoints redeemable across other community-owned businesses." }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-secondary-foreground/10 p-8 rounded-3xl backdrop-blur-sm border border-secondary-foreground/20 hover:bg-secondary-foreground/20 transition-colors"
              >
                <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
                <p className="opacity-80 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 bg-card border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold mb-6">The Movement is Real</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Don't just take our word for it. Hear from community members who are saving thousands together.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Emeka Obi", loc: "Mississauga, ON", text: "We used to spend $1,200 a month on groceries. With the local Bloc, we're down to $850 for better quality meat." },
              { name: "David Lee", loc: "Etobicoke, ON", text: "The quality of the brisket and ribs is incredible. You can tell it's coming straight from the farm." },
              { name: "Sarah Chen", loc: "Toronto, ON", text: "Finally, a platform that understands how our community cooks and eats. The savings are just the bonus." },
              { name: "Nicole Adams", loc: "Calgary, AB", text: "Started my own Bloc in our neighborhood. The $50 voucher was nice, but bringing everyone together was better." }
            ].map((review, i) => (
              <div key={i} className="p-6 rounded-3xl bg-muted/50 border hover-elevate transition-all" data-testid={`card-testimonial-${i}`}>
                <div className="flex text-accent mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current" />)}
                </div>
                <Quote className="w-8 h-8 text-primary/20 mb-4" />
                <p className="text-foreground/90 italic mb-6">"{review.text}"</p>
                <div>
                  <h5 className="font-bold">{review.name}</h5>
                  <p className="text-sm text-muted-foreground">{review.loc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/community-feast.png" 
            alt="Community feast" 
            className="w-full h-full object-cover opacity-30 dark:opacity-40"
          />
          <div className="absolute inset-0 bg-primary/90 dark:bg-primary/95 mix-blend-multiply" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-primary-foreground">
          <h2 className="text-5xl md:text-7xl font-display font-bold mb-8">Ready to bend the market?</h2>
          <p className="text-xl md:text-2xl mb-12 opacity-90">Join your local Bloc today. The next sweep is happening soon.</p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button
              size="lg"
              variant="secondary"
              className="w-full sm:w-auto text-lg h-14 px-10 rounded-full shadow-xl hover-elevate text-secondary-foreground bg-secondary"
              data-testid="btn-bottom-join"
              onClick={() => setJoinOpen(true)}
            >
              Join the Next Sweep
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto text-lg h-14 px-10 rounded-full border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary transition-colors"
              data-testid="btn-bottom-start"
              onClick={() => setStartOpen(true)}
            >
              Start the Next Sweep
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background py-12 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center">
            <img src={logoFull} alt="Cartnicity" className="h-12 object-contain" />
          </div>
          <p className="text-muted-foreground text-sm text-center md:text-left">
            © {new Date().getFullYear()} Cartnicity. A movement, not a marketplace. Proudly Canadian.
          </p>
          <div className="flex gap-4 text-sm font-medium">
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
