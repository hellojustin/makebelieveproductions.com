import {Box, Typography} from "@mui/joy"

const accent = {
  yellow: { fg: "#fde68a", glow: "rgba(253, 230, 138, 0.75)" }, // canvas
  green:  { fg: "#a7f3d0", glow: "rgba(167, 243, 208, 0.75)" }, // paint
  pink:   { fg: "#fecaca", glow: "rgba(254, 202, 202, 0.8)"  }, // brush
  sky:    { fg: "#bae6fd", glow: "rgba(186, 230, 253, 0.85)" }, // masterpiece
} as const;

type Accent = keyof typeof accent;

// Match Joy UI's body-lg text color (text.secondary in theme.ts ⇒ violet-300
// at 70%), and use a stronger violet halo so the connectors visibly glow in
// the same hue as their text rather than washing out as neutral white.
const mutedFg   = "rgba(196, 181, 253, 0.7)";
const mutedGlow = "rgba(196, 181, 253, 0.5)";

const serifFamily = "var(--font-fraunces), 'Fraunces', Georgia, serif";

const lineSx = {
  fontFamily: serifFamily,
  fontStyle: 'italic' as const,
  fontWeight: 400,
  lineHeight: 1.05,
  letterSpacing: '-0.005em',
  textAlign: 'center' as const,
  color: mutedFg,
  fontSize: 'clamp(1.75rem, 4.8vw, 3rem)',
  // Three-layer halo so the connectors actually glow (not just have a soft
  // outline). Wide outer (56px) reaches into adjacent lines for the overlap;
  // mid (18px) provides body; tight (4px) hugs the letterforms.
  textShadow: `0 0 56px ${mutedGlow}, 0 0 18px ${mutedGlow}, 0 0 4px ${mutedGlow}`,
} as const;

function Em({color, children}: {color: Accent; children: React.ReactNode}) {
  const {fg, glow} = accent[color];
  return (
    <Box
      component="span"
      sx={{
        color: fg,
        textShadow: `0 0 60px ${glow}, 0 0 20px ${glow}, 0 0 6px ${glow}`,
      }}
    >
      {children}
    </Box>
  );
}

export default function IntroSection() {
  return (
    <Box
      id="intro"
      component="section"
      className="contentSection noHeader halfHeight"
      display='flex'
      flexDirection='column'
      alignItems='center'
      justifyContent='center'
      sx={{
        pt: '4rem',
      }}
    >
      <Box
        display='flex'
        flexDirection='column'
        alignItems='center'
        // gap: 0 + tight line-height = the per-line halos bleed into each
        // other vertically, producing one continuous glow column. The breath
        // before "We are the brush" is added explicitly via mt below.
        gap={0}
        maxWidth='56rem'
      >
        <Typography sx={lineSx}>
          The Internet is the <Em color="yellow">canvas</Em>
        </Typography>
        <Typography sx={lineSx}>
          on which visionaries <Em color="green">paint</Em>.
        </Typography>
        <Typography sx={{...lineSx, mt: '2.25rem', mb: '2.25rem'}}>
          We are the <Em color="pink">brush</Em>.
        </Typography>
        <Typography
          component='a'
          href="https://calendly.com/justin-makebelieveproductions/30min"
          target='_blank'
          rel='noopener'
          sx={{
            ...lineSx,
            display: 'block',
            textDecoration: 'none',
            transform: 'translateY(0)',
            transition: 'color 280ms ease, text-shadow 280ms ease, transform 280ms ease',
            // Inline the masterpiece span styles here (rather than reusing
            // <Em>) so the hover rules below can override both the color and
            // the halo on the same selector — Em's inline sx would otherwise
            // win over a parent &:hover .child rule.
            '& .mbp-masterpiece': {
              color: accent.sky.fg,
              textShadow: `0 0 60px ${accent.sky.glow}, 0 0 20px ${accent.sky.glow}, 0 0 6px ${accent.sky.glow}`,
              transition: 'color 280ms ease, text-shadow 280ms ease',
            },
            // Hover: whole line warms to white, halos grow, and the line
            // lifts a few px to feel kinetic. Connector text picks up a
            // wider white halo while the masterpiece word keeps its
            // sky-tinted aura (now larger), so the line reads as "lit up
            // from within" rather than uniformly bright.
            '&:hover': {
              color: '#ffffff',
              textShadow: `0 0 80px rgba(255, 255, 255, 0.55), 0 0 26px rgba(255, 255, 255, 0.55), 0 0 6px rgba(255, 255, 255, 0.55)`,
              transform: 'translateY(-4px)',
            },
            '&:hover .mbp-masterpiece': {
              color: '#ffffff',
              textShadow: `0 0 96px ${accent.sky.glow}, 0 0 34px ${accent.sky.glow}, 0 0 10px ${accent.sky.glow}`,
            },
          }}
        >
          Let&apos;s create a <Box component="span" className="mbp-masterpiece">masterpiece</Box>.
        </Typography>
      </Box>
    </Box>
  );
}
