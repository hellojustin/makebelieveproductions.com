"use client";

import Box from "@mui/joy/Box";
import Card from "@mui/joy/Card";
import Typography from "@mui/joy/Typography";

const services = [
  {
    name: "Technical Advising",
    description:
      "We learn about your project and give you a clear direction. One conversation, one concrete next step.",
  },
  {
    name: "Project Bootstrap",
    description:
      "We take you from idea to revenue. Zero to one in a matter of months.",
  },
  {
    name: "Team Embedding",
    description:
      "We join your team and work through complex architecture or product challenges alongside you.",
  },
];

export default function ServicesSection() {
  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        width: "100%",
        py: 16,
        px: 4,
        height: "200vh",
      }}
    >
      <Box sx={{ maxWidth: "72rem", mx: "auto" }}>
        <Typography
          sx={{
            fontSize: "0.75rem",
            letterSpacing: "0.3em",
            color: "rgba(167, 139, 250, 0.6)",
            textTransform: "uppercase",
            mb: 8,
          }}
        >
          What we do
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 4,
          }}
        >
          {services.map((service) => (
            <Card
              key={service.name}
              variant="outlined"
              sx={{
                background: "transparent",
                borderColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "1rem",
                p: 4,
                gap: 2,
              }}
            >
              <Typography
                sx={{
                  color: "common.white",
                  fontWeight: 300,
                  fontSize: "1.25rem",
                  letterSpacing: "0.025em",
                }}
              >
                {service.name}
              </Typography>
              <Typography
                sx={{
                  color: "rgba(221, 214, 254, 0.5)",
                  fontSize: "0.875rem",
                  lineHeight: 1.7,
                }}
              >
                {service.description}
              </Typography>
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
