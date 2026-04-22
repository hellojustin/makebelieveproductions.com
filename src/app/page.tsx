import Box from "@mui/joy/Box";
import Nav from "@/components/Nav";
import HeroSection from "@/components/HeroSection";
import IntroSection from "@/components/IntroSection";
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
        {/* CSS-rendered cover that masks scrolling content behind the dot
            strip. Sits below the canvas in source order so dots paint on
            top. Its gradient stop is driven from DotCanvas via the
            --mbp-dot-cover-stop custom property. Painting the bg here in
            CSS instead of inside the canvas avoids a Chrome wide-gamut
            color-management mismatch where canvas-painted pixels and
            CSS-painted backgrounds of the same RGB value render as
            slightly different on-screen colors. */}
        <div className="dotStripCover" aria-hidden />
        <DotCanvas className="dotCanvasBackground" />
      </div>

      <Nav />
      <HeroSection />

      {/* All post-hero sections go inside this wrapper. The wrapper carries
          the gradient transition that lets the dot field show through the
          top of the page during the seam between hero and content. */}
      <Box className="contentStack">
        <IntroSection />
        <ServicesSection />
      </Box>
    </Box>
  );
}
