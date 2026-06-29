import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import AnimatedSection from "@/components/ui/AnimatedSection";

export default function Hero() {
  return (
    <section className="bg-cream min-h-[90vh] flex items-center py-16">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left column */}
          <AnimatedSection>
            <Badge variant="terracotta" className="mb-6">
              Free 2D Layout in 48 hours
            </Badge>
            <h1 className="font-playfair text-[36px] sm:text-[48px] lg:text-[56px] font-bold leading-tight text-charcoal mb-6">
              Your Dream Space.{" "}
              <span className="relative inline-block text-warm-brown">
                Zero Stress.
                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-warm-brown rounded-full" />
              </span>
            </h1>
            <p className="font-inter text-lg text-muted leading-relaxed mb-8 max-w-xl">
              A software-disciplined approach to premium home interiors — built
              for urban Indian homeowners who value their time and their budget.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" href="#contact">
                Engineer My Naksha →
              </Button>
              <Button variant="ghost" href="#gallery">
                See Our Work
              </Button>
            </div>
          </AnimatedSection>

          {/* Right column — decorative interior placeholder */}
          <AnimatedSection className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl"
              style={{
                background:
                  "linear-gradient(135deg, #C4622D 0%, #8B6914 30%, #E8E0D0 60%, #C4622D 100%)",
                minHeight: "420px",
              }}
            >
              {/* Inner decorative layers */}
              <div
                className="absolute inset-4 rounded-xl opacity-60"
                style={{
                  background:
                    "linear-gradient(160deg, #FAF7F2 0%, #E8D5B0 40%, #8B6914 100%)",
                }}
              />
              <div className="absolute inset-8 rounded-lg border-2 border-warm-brown/40 flex flex-col items-center justify-center gap-4">
                {/* Decorative furniture silhouettes */}
                <div className="w-32 h-1 bg-warm-brown/60 rounded-full mb-2" />
                <div className="flex gap-3">
                  <div className="w-16 h-20 bg-warm-brown/30 rounded-t-full border border-warm-brown/50" />
                  <div className="w-24 h-24 bg-terracotta/20 rounded-lg border border-terracotta/40 flex items-end pb-2 justify-center">
                    <div className="w-16 h-1.5 bg-terracotta/50 rounded" />
                  </div>
                  <div className="w-16 h-20 bg-warm-brown/30 rounded-t-full border border-warm-brown/50" />
                </div>
                <div className="w-40 h-0.5 bg-warm-brown/40 rounded" />
                <p className="font-inter text-xs font-semibold text-warm-brown/80 uppercase tracking-widest mt-4 bg-ivory/70 px-4 py-2 rounded-full">
                  3D Render Coming Soon
                </p>
              </div>
              {/* Corner accents */}
              <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-ivory/60 rounded-tl" />
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-ivory/60 rounded-tr" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-ivory/60 rounded-bl" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-ivory/60 rounded-br" />
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
