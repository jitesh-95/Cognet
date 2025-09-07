import Footer from "./components/home/Footer";
import HeroSection from "./components/home/HeroSection";
import FeaturesSection from "./components/home/FeaturesSection";
import Contactus from "./components/home/Contactus";
import FastLightweightSection from "./components/home/FastLightWeightSection";
import HowItWorks from "./components/home/HowItWorks";
import MultiScreenShowcase from "./components/home/MultiscreenSection";
import PrivacySection from "./components/home/PrivacySection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      <FastLightweightSection />
      <HowItWorks />
      <MultiScreenShowcase />
      <PrivacySection />
      <Contactus />
      <Footer />
    </main>
  );
}
