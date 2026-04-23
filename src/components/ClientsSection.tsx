import { Box, Stack, Typography } from "@mui/joy";
import SectionHeader from "./layout/SectionHeader";

const clients = [
  { name: "Modern Treasury", logo: "/img/modern-treasury-logo.png" },
  { name: "Seam", logo: "/img/seam-logo.png" },
  { name: "Geek", logo: "/img/geek-logo.png" },
  { name: "Caroga Arts Collective", logo: "/img/caroga-arts-logo.png" },
  { name: "Teleport", logo: "/img/teleport-logo.png" },
];

export default function ClientsSection() {
  return (
    <Stack component="section" className="contentSection halfHeight">
      <Box>
        <SectionHeader title="Proudly Serving">
          <Typography level="body-lg" sx={{mt: 2}}>
            We're honored to have worked alongside these inspiring founders and teams.
          </Typography>
        </SectionHeader>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: { xs: "wrap", md: "nowrap" },
          alignItems: "center",
          justifyContent: "center",
          gap: { xs: 4, md: 6 },
        }}
      >
        {clients.map((client) => (
          <Box
            key={client.name}
            sx={{
              flex: { xs: "0 0 calc(50% - 16px)", md: 1 },
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Box
              role="img"
              aria-label={`${client.name} logo`}
              sx={{
                width: "100%",
                maxWidth: 252,
                aspectRatio: { xs: "3 / 1", md: "3 / 2" },
                opacity: 0.75,
                // Tint the white logo to violet while preserving its internal
                // shading: `multiply` blends the logo image with the violet
                // background-color, and the mask clips transparent PNG areas
                // so we don't render a violet rectangle behind it.
                backgroundColor: "var(--mbp-palette-primary-300)",
                backgroundImage: `url(${client.logo})`,
                backgroundBlendMode: "multiply",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundSize: "contain",
                WebkitMaskImage: `url(${client.logo})`,
                maskImage: `url(${client.logo})`,
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
                WebkitMaskSize: "contain",
                maskSize: "contain",
              }}
            />
          </Box>
        ))}
      </Box>
    </Stack>
  );
}
