import Box from "@mui/joy/Box";
import Nav from "@/components/Nav";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import DotCanvas from "@/components/DotCanvas";

export default function Home() {
  return (
    <Box component="main" sx={{ position: "relative" }}>
      {/* Page-wide animated background. The shell + iosChromeBg sibling is
          a workaround for an iOS 26 Safari bug that clips fixed/sticky
          elements out from behind the translucent status bar / dynamic
          island, causing scrolled content to leak through there. The shell
          is a small fixed wrapper and iosChromeBg is a CSS-backgrounded
          sibling whose color iOS uses to tint the chrome. The canvas
          paints on top, so the bg only shows behind the chrome itself.
          See globals.scss for full details. */}
      <div className="dotCanvasShell">
        <div className="iosChromeBg" aria-hidden />
        <DotCanvas className="dotCanvasBackground" />
      </div>

      <Nav />
      <HeroSection />

      {/* All post-hero sections go inside this wrapper. The wrapper carries
          the gradient transition that lets the dot field show through the
          top of the page during the seam between hero and content. */}
      <Box className="contentStack">
        <ServicesSection />
      </Box>
    </Box>
  );
}
