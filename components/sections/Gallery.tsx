import SectionWrapper from "@/components/ui/SectionWrapper";
import AnimatedSection from "@/components/ui/AnimatedSection";

// Real project photos, pulled from the shared Google Drive folder. Hosted
// directly via Google's file-serving URL (the files are shared "Anyone with
// the link") rather than copied into /public — see the note below the
// component for the tradeoff and how to switch to self-hosted images later.
const DRIVE_IDS = [
  "1KbegUwSyhyxafPS7mLS19rFLTOCAeRAu",
  "1ZIOwoHhA-C0VpiWDTU1pAMl9BxaAcol_",
  "1kLdX44_IqgTnbKwjp9zfZnByHUhp7j_X",
  "1Q7V7o3UogTaGgzVIJ4gqgKcUKKAZ-1nx",
  "1aeUbqELqo4hlYfx9jv1Wzkpm4_Ya_3Qn",
  "1budIlFotDeFxd6e_Ye6pbNWVy1j55VgL",
  "1cc622nqDaCC7FBq-OFRR23bzkz5whBLc",
  "13usHAEkU4oHd9JJN9ddyhadyJelWooyg",
  "14AhObln6ENQZAVsXrpUteUYE4bdjtjDd",
  "1OkiJ5IXhRsUNgiXHRrtQSbsomYaj8Wft",
  "1m38z3vN7soAtkoyL-7Op37A0-a6wo6XK",
  "1YjKhErmixiPFRcAEcDHbHbu7kTzgKPUQ",
  "1AlKUKj0nW9XGA7mSSxxEXaSWSJthcPjw",
  "1nvwHgpRXCepcrd3X76p_Dp4AWX75o5Mf",
  "1787FqPB2dcHyJ2HKXZ4OC13DHLpavCsq",
  "1sR07d91DyHAscEjOigF1G_4paoUPwPq3",
  "1lx2e70OWXhBR-MnZIvadd1wTsTS3xnXk",
];

const HEIGHTS = ["h-64", "h-80", "h-56", "h-72", "h-60"];

const projects = DRIVE_IDS.map((id, i) => ({
  src: `https://lh3.googleusercontent.com/d/${id}=w1200`,
  height: HEIGHTS[i % HEIGHTS.length],
}));

export default function Gallery() {
  return (
    <SectionWrapper id="gallery" className="bg-ivory py-20">
      <AnimatedSection>
        <div className="text-center mb-12">
          <span className="font-inter text-[11px] uppercase tracking-[0.18em] text-warm-brown/70 mb-3 block">Portfolio</span>
          <h2 className="font-playfair text-3xl sm:text-[42px] font-bold text-charcoal leading-tight">
            Our Work Speaks
          </h2>
        </div>
      </AnimatedSection>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
        {projects.map((project, i) => (
          <AnimatedSection key={i} className="break-inside-avoid">
            <div className={`relative group rounded-xl overflow-hidden ${project.height} cursor-pointer bg-sand`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.src}
                alt="EnNaksha completed home project"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/50 transition-all duration-300 flex items-center justify-center">
                <span className="text-ivory font-inter font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-ivory px-6 py-3 rounded-xl">
                  View Project →
                </span>
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>
      <div className="text-center mt-10">
        <a
          href="#"
          className="font-inter text-sm font-semibold text-charcoal border border-charcoal rounded-lg px-6 py-3 hover:bg-charcoal hover:text-ivory transition-all inline-block"
        >
          See All Projects →
        </a>
      </div>
    </SectionWrapper>
  );
}
