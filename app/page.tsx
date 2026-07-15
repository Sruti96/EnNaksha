import AnnouncementBar from "@/components/sections/AnnouncementBar";
import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import Plans from "@/components/sections/Plans";
import PainPoints from "@/components/sections/PainPoints";
import Services from "@/components/sections/Services";
import Materials from "@/components/sections/Materials";
import Founder from "@/components/sections/Founder";
import Gallery from "@/components/sections/Gallery";
import WhyEnNaksha from "@/components/sections/WhyEnNaksha";
import LeadForm from "@/components/sections/LeadForm";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <main className="pb-[72px] md:pb-0">
      <AnnouncementBar />
      <Navbar />
      <Hero />
      <Plans />
      <PainPoints />
      <Services />
      <Materials />
      <Founder />
      <Gallery />
      <WhyEnNaksha />
      <LeadForm />
      <Footer />

      {/* Mobile sticky bottom CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-ivory/95 backdrop-blur-md border-t border-sand/60 px-4 py-3 flex gap-3 shadow-[0_-4px_20px_rgba(46,27,14,0.10)]">
        <a
          href="#contact"
          className="flex-1 text-center font-inter font-bold text-[15px] bg-warm-brown text-ivory py-3.5 rounded-xl shadow-md shadow-warm-brown/25 active:scale-95 transition-all"
        >
          Get Free 2D Design →
        </a>
        <a
          href="https://wa.me/919731190902"
          target="_blank"
          rel="noopener noreferrer"
          className="relative flex-shrink-0 active:scale-95 transition-all"
          aria-label="Chat with Enzo on WhatsApp"
        >
          {/* WhatsApp badge */}
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#25D366] rounded-full flex items-center justify-center shadow z-10">
            <svg viewBox="0 0 24 24" fill="white" width="11" height="11">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
          {/* Enzo face */}
          <div className="w-12 h-12 rounded-full bg-cream border-2 border-warm-brown/30 overflow-hidden shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/enzo-face.png"
              alt="Enzo"
              className="w-full h-full object-cover"
              style={{ filter: "hue-rotate(-17deg) saturate(0.85) brightness(0.88)" }}
            />
          </div>
        </a>
      </div>

      {/* Floating Enzo (Shih Tzu mascot) WhatsApp button */}
      <a
        href="https://wa.me/919731190902"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Enzo on WhatsApp"
        className="hidden md:flex fixed bottom-6 right-6 z-50 flex-col items-center gap-1 group"
      >
        {/* WhatsApp badge */}
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#25D366] rounded-full flex items-center justify-center shadow z-10">
          <svg viewBox="0 0 24 24" fill="white" width="11" height="11">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </div>

        {/* Enzo face */}
        <div className="relative w-16 h-16 rounded-full bg-cream shadow-xl border-2 border-warm-brown/30 overflow-hidden group-hover:scale-110 transition-transform duration-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/enzo-face.png"
            alt="Enzo"
            className="w-full h-full object-cover"
            style={{ filter: "hue-rotate(-17deg) saturate(0.85) brightness(0.88)" }}
          />
        </div>

        {/* Stylish name label */}
        <span
          className="font-dancing font-bold text-[15px] text-charcoal group-hover:text-warm-brown transition-colors bg-cream/90 px-2.5 py-0.5 rounded-full shadow-sm"
          style={{ letterSpacing: "0.04em" }}
        >
          Enzo
        </span>
      </a>
    </main>
  );
}
