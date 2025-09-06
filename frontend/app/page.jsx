import Footer from "./components/home/Footer";
import HeroSection from "./components/home/HeroSection";
import FeaturesSection from "./components/home/FeaturesSection";
import Contactus from "./components/home/Contactus";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      <Contactus />
      <Footer />
    </main>
  );
}
