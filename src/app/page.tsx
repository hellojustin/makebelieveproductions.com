import Box from "@mui/joy/Box";
import Nav from "@/components/Nav";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";

export default function Home() {
  return (
    <Box component="main" sx={{ position: "relative" }}>
      <Nav />
      <HeroSection />
      <div className="content-fade" />
      <ServicesSection />
    </Box>
  );
}
