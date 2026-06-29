import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import PainPoints from "@/components/sections/PainPoints";
import GuaranteeGrid from "@/components/sections/GuaranteeGrid";
import Services from "@/components/sections/Services";
import HowItWorks from "@/components/sections/HowItWorks";
import LeadForm from "@/components/sections/LeadForm";
import Gallery from "@/components/sections/Gallery";
import WhyEnNaksha from "@/components/sections/WhyEnNaksha";
import Testimonials from "@/components/sections/Testimonials";
import CtaBanner from "@/components/sections/CtaBanner";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <PainPoints />
      <GuaranteeGrid />
      <Services />
      <HowItWorks />
      <LeadForm />
      <Gallery />
      <WhyEnNaksha />
      <Testimonials />
      <CtaBanner />
      <Footer />
    </main>
  );
}
