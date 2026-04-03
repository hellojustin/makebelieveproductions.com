import Nav from "@/components/Nav";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";

export default function Home() {
  return (
    <main className="relative">
      <Nav />
      <HeroSection />
      <div className='content-fade w-full h-[150px]  z-99'></div>
      <ServicesSection />
    </main>
  );
}
