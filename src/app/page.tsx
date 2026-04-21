import Box from "@mui/joy/Box";
import Nav from "@/components/Nav";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import DotCanvas from "@/components/DotCanvas";

export default function Home() {
  return (
    <Box component="main" sx={{ position: "relative" }}>
      {/* Page-wide animated background. Fixed, pointer-events: none, so it
          sits behind every other element and never intercepts input. */}
      <DotCanvas className="dotCanvasBackground" />

      <Nav />
      <HeroSection />

      {/* All post-hero sections go inside this wrapper. The wrapper carries
          the gradient transition that lets the dot field show through the
          top of the page during the seam between hero and content. */}
      <div className="contentStack">
        <ServicesSection />
      </div>
    </Box>
  );
}
