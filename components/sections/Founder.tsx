import Image from "next/image";
import AnimatedSection from "@/components/ui/AnimatedSection";

export default function Founder() {
  return (
    <section id="founder" className="bg-cream py-12">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8 items-center">
            {/* Left: founder photo */}
            <div className="w-full max-w-[260px] mx-auto md:mx-0 rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="/images/founder.jpg"
                alt="Founder of EnNaksha"
                width={320}
                height={400}
                className="w-full h-auto object-cover"
                priority
              />
            </div>

            {/* Right: story */}
            <div>
              {/* Label */}
              <p className="font-inter text-[11px] font-semibold uppercase tracking-widest text-warm-brown mb-3">
                From the Founder
              </p>

              <h2 className="font-playfair text-[30px] font-bold text-charcoal mb-5 leading-tight">
                I built EnNaksha because I lived the problem.
              </h2>

              <div className="font-inter text-[15px] text-charcoal/80 leading-[1.8] flex flex-col gap-3 mb-6">
                <p>
                  When I did my own home in Bangalore, I thought finding the right contractor was the hard part. It wasn&apos;t. What followed was missed timelines, materials swapped without a word, bills that kept climbing, and total silence from the team. I was running my home project like a second job — with none of the control.
                </p>
                <p>
                  As a Program Manager, I knew exactly what was missing: structure, accountability, and a single person who owned the outcome. And as someone who cares deeply about design, I also saw how cutting corners on design upfront always cost more later — through rework, wrong choices, and spaces that just did not feel right. Good design is not a cost. It is what protects your budget.
                </p>
                <p>
                  That realisation became EnNaksha — a service where your home is designed with care and managed with discipline. No chaos, no surprises, no having to chase anyone. Just a beautiful home, delivered the way it was promised.
                </p>
              </div>

              {/* Signature + LinkedIn */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="font-dancing text-[28px] font-bold text-[#1A0E06] leading-none">
                    Srutiarya Panda
                  </p>
                  <p className="font-inter text-[12px] text-charcoal/50 mt-1">
                    Founder, EnNaksha · Bangalore
                  </p>
                </div>
                <a
                  href="https://www.linkedin.com/in/srutiarya-panda-csm-758b4a374/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#0A66C2] text-white text-[13px] font-inter font-semibold px-4 py-2 rounded-lg hover:bg-[#084d93] transition-colors"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  View My Profile
                </a>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
