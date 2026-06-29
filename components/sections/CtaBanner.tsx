import SectionWrapper from "@/components/ui/SectionWrapper";

export default function CtaBanner() {
  return (
    <section className="bg-warm-brown py-20">
      <SectionWrapper>
        <div className="text-center">
          <h2 className="font-playfair text-3xl sm:text-5xl font-bold text-ivory mb-4">
            Ready to Engineer Your Dream Home?
          </h2>
          <p className="font-inter text-ivory/80 text-lg mb-10">
            Get a free 2D layout within 48 hours. No commitment required.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="#contact"
              className="inline-flex items-center justify-center font-inter font-semibold px-8 py-4 rounded-lg bg-ivory text-warm-brown hover:bg-opacity-90 transition-all text-base"
            >
              Start My Project →
            </a>
            <a
              href="https://wa.me/91XXXXXXXXXX"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center font-inter font-semibold px-8 py-4 rounded-lg border-2 border-ivory text-ivory hover:bg-ivory hover:text-warm-brown transition-all text-base"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </SectionWrapper>
    </section>
  );
}
