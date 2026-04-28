import Box from "@mui/joy/Box";
import Nav from "@/components/Nav";
import HeroSection from "@/components/HeroSection";
import IntroSection from "@/components/IntroSection";
import ServicesSection from "@/components/ServicesSection";
import ClientsSection from "@/components/ClientsSection";
import DotCanvasShell from "@/components/DotCanvasShell";

export default function Home() {
  return (
    <Box component="main" sx={{ position: "relative" }}>
      {/* Page-wide animated dot field. The shell handles the iOS 26
          Safari chrome workaround (see globals.scss for the full
          explanation) and renders the canvas at 100svh by default —
          which is what the homepage hero wants. */}
      <DotCanvasShell />

      <Nav />
      <HeroSection />

      {/* All post-hero sections go inside this wrapper. The wrapper carries
          the gradient transition that lets the dot field show through the
          top of the page during the seam between hero and content. */}
      <Box className="contentStack">
        <IntroSection />
        <ServicesSection />
        <ClientsSection />
      </Box>
    </Box>
  );
}
