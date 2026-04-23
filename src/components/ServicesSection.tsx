"use client";

import {
  Box, 
  Button, 
  Card, 
  Divider, 
  Grid, 
  List, 
  ListItem, 
  ListItemDecorator, 
  Stack, 
  Typography
} from "@mui/joy";
import CheckIcon from "@mui/icons-material/Check";
import StatCard from "./layout/StatCard";
import SectionHeader from "./layout/SectionHeader";

type CardPalette = { bg: string; fg: string; glow: string };

// `glow` mirrors `fg` at low alpha — used as a soft outer halo on the card
// (see boxShadow below) so each card reads as gently lit in its own hue,
// echoing the per-word halos on the IntroSection statement above it.
const cardPalettes = {
  productDefinition: {
    bg:   "rgba(253, 224, 71, 0.08)",
    fg:   "#fde68a",
    glow: "rgba(253, 230, 138, 0.18)",
  },
  buildAndLaunch: {
    bg:   "rgba(134, 239, 172, 0.08)",
    fg:   "#a7f3d0",
    glow: "rgba(167, 243, 208, 0.18)",
  },
  scalingSupport: {
    bg:   "rgba(252, 165, 165, 0.08)",
    fg:   "#fecaca",
    glow: "rgba(254, 202, 202, 0.18)",
  },
} as const satisfies Record<string, CardPalette>;

// Two-layer soft glow: a wide outer halo (48px) for atmosphere and a tight
// inner ring (12px) for edge definition. Applied to each Card via boxShadow.
const cardGlow = (color: string) =>
  `0 0 36px ${color}, 0 0 8px ${color}`;

export default function ServicesSection() {
  return (
    <Stack component="section" className="contentSection fullHeight" sx={{justifyContent: 'center', alignItems: 'center'}}>
      <Box>
        <SectionHeader title="Services">
          <Typography level="body-lg" sx={{mt: 2}}>
            We draw on a wealth of experience building in venture-backed environments 
            to meet every founder and team where they are. We internalize your vision, 
            understand who you serve, learn your taste, and chart a course that will
            deliver exceptionally high-craft work.
          </Typography>
          <Typography level="body-lg" sx={{mt: 2}}>
            Most of our engagements fall into one of these categories, at these rates.
            Consider these a framework for starting a conversation with us, and know 
            that we can often flex to find an arrangement that works for you.
          </Typography>
        </SectionHeader>
        
        <Grid container spacing={4}>
          
          <Grid xs={12} md={6} xl={4}>
            <Card
              variant="plain"
              sx={{
                bgcolor: cardPalettes.productDefinition.bg,
                color: cardPalettes.productDefinition.fg,
                borderRadius: '1.5rem',
                height: '100%',
                boxShadow: cardGlow(cardPalettes.productDefinition.glow),
              }}
            >
              <Box p={2} pb={0}>
                <Typography level="title-lg" fontSize={'1.5rem'} sx={{color: cardPalettes.productDefinition.fg, mb: 2}}>
                  Product Definition
                </Typography>
                  
                <Typography level="body-lg" sx={{color: cardPalettes.productDefinition.fg, minHeight: 90}}>
                  We build a deep understanding of your vision, help you identify a minimum lovable product, 
                  and forge a plan to bring it to life.
                </Typography>
              </Box>
                
              <Stack direction="row" spacing={2} sx={{justifyContent: 'space-between', alignItems: 'center'}}>
                <StatCard value='2-4' label='weeks' />
                <StatCard value='4-8' label='hours/week' />
                <StatCard value='$4,000' label='total' />
              </Stack>
                
              <Divider inset="none" sx={{'--Divider-childPosition':'1rem', mt: 2, color: cardPalettes.productDefinition.fg}}>
                Includes
              </Divider>
                
              <List sx={{minHeight: 200, color: cardPalettes.productDefinition.fg}}>
                <ListItem>
                  <ListItemDecorator sx={{color: cardPalettes.productDefinition.fg}}><CheckIcon /></ListItemDecorator>Product wireframes
                </ListItem>
                <ListItem>
                  <ListItemDecorator sx={{color: cardPalettes.productDefinition.fg}}><CheckIcon /></ListItemDecorator>Revenue and cost analysis
                </ListItem>
                <ListItem>
                  <ListItemDecorator sx={{color: cardPalettes.productDefinition.fg}}><CheckIcon /></ListItemDecorator>Preliminary development plan & timeline
                </ListItem>
                <ListItem>
                  <ListItemDecorator sx={{color: cardPalettes.productDefinition.fg}}><CheckIcon /></ListItemDecorator>De-risking of technical challenges
                </ListItem>
              </List>
            </Card>
          </Grid>

          <Grid xs={12} md={6} xl={4}>
            <Card
              variant="plain"
              sx={{
                bgcolor: cardPalettes.buildAndLaunch.bg,
                color: cardPalettes.buildAndLaunch.fg,
                borderRadius: '1.5rem',
                height: '100%',
                boxShadow: cardGlow(cardPalettes.buildAndLaunch.glow),
              }}
            >
              <Box p={2} pb={0}>
                <Typography level="title-lg" fontSize={'1.5rem'} sx={{color: cardPalettes.buildAndLaunch.fg, mb: 2}}>
                  Build &amp; Launch
                </Typography>
                <Typography level="body-lg" sx={{color: cardPalettes.buildAndLaunch.fg, minHeight: 90}}>
                  We work closely with your founding team to bring your product to market.
                </Typography>
              </Box>

              <Stack direction="row" spacing={2} sx={{justifyContent: 'space-between', alignItems: 'center'}}>
                <StatCard value='2-3' label='months' />
                <StatCard value='3' label='days/week' />
                <StatCard value='$19,500' label='per month' />
              </Stack>

              <Divider inset="none" sx={{'--Divider-childPosition': '1rem', mt: 2, color: cardPalettes.buildAndLaunch.fg}}>
                Includes
              </Divider>

              <List sx={{minHeight: 200, color: cardPalettes.buildAndLaunch.fg}}>
                <ListItem>
                  <ListItemDecorator sx={{color: cardPalettes.buildAndLaunch.fg}}><CheckIcon /></ListItemDecorator>High-craft product running in production
                </ListItem>
                <ListItem>
                  <ListItemDecorator sx={{color: cardPalettes.buildAndLaunch.fg}}><CheckIcon /></ListItemDecorator>Essential analytics to understand user behavior
                </ListItem>
                <ListItem>
                  <ListItemDecorator sx={{color: cardPalettes.buildAndLaunch.fg}}><CheckIcon /></ListItemDecorator>Solid foundation for future development
                </ListItem>
                <ListItem>
                  <ListItemDecorator sx={{color: cardPalettes.buildAndLaunch.fg}}><CheckIcon /></ListItemDecorator>Clear roadmap for next steps
                </ListItem>
              </List>
            </Card>
          </Grid>
          
          <Grid xs={12} md={6} xl={4}>
            <Card
              variant="plain"
              sx={{
                bgcolor: cardPalettes.scalingSupport.bg,
                color: cardPalettes.scalingSupport.fg,
                borderRadius: '1.5rem',
                height: '100%',
                boxShadow: cardGlow(cardPalettes.scalingSupport.glow),
              }}
            >
              <Box p={2} pb={0}>
                <Typography level="title-lg" fontSize={'1.5rem'} sx={{color: cardPalettes.scalingSupport.fg, mb: 2}}>
                  Scaling Support
                </Typography>
                <Typography level="body-lg" sx={{color: cardPalettes.scalingSupport.fg, minHeight: 90}}>
                  We embed with your team to tackle daunting challenges that come with scale.
                </Typography>
              </Box>

              <Stack direction="row" spacing={2} sx={{justifyContent: 'space-between', alignItems: 'center'}}>
                <StatCard value='6+' label='months' />
                <StatCard value='1-3' label='days/week' />
                <StatCard value='$6,500+' label='per month' />
              </Stack>

              <Divider inset="none" sx={{'--Divider-childPosition':'1rem', mt: 2, color: cardPalettes.scalingSupport.fg}}>
                Includes
              </Divider>

              <List sx={{minHeight: 200, color: cardPalettes.scalingSupport.fg}}>
                <ListItem>
                  <ListItemDecorator sx={{color: cardPalettes.scalingSupport.fg}}><CheckIcon /></ListItemDecorator>System performance improvements
                </ListItem>
                <ListItem>
                  <ListItemDecorator sx={{color: cardPalettes.scalingSupport.fg}}><CheckIcon /></ListItemDecorator>Architectural transitions
                </ListItem>
                <ListItem>
                  <ListItemDecorator sx={{color: cardPalettes.scalingSupport.fg}}><CheckIcon /></ListItemDecorator>Technical debt paydown
                </ListItem>
                <ListItem>
                  <ListItemDecorator sx={{color: cardPalettes.scalingSupport.fg}}><CheckIcon /></ListItemDecorator>Solving operational edge-cases
                </ListItem>
                <ListItem>
                  <ListItemDecorator sx={{color: cardPalettes.scalingSupport.fg}}><CheckIcon /></ListItemDecorator>Development tooling & process improvement
                </ListItem>
              </List>
            </Card>
          </Grid>

        </Grid>  

        <Box sx={{textAlign: 'center'}}>
          <Button 
            size='lg'
            sx={{
              m: 6,
              px: 6,
              py: 2,
              borderRadius: '3rem',
              fontSize: '1.5rem',
              bgcolor: 'var(--mbp-palette-primary-outlinedBorder)',
              // Violet halo using primary-400 (#a78bfa) — alpha matched to
              // the per-card glows above (0.18) so the button reads as part
              // of the same lit-from-within family rather than competing.
              boxShadow: `0 0 48px rgba(167, 139, 250, 0.18), 0 0 12px rgba(167, 139, 250, 0.18)`,
              transform: 'translateY(0)',
              transition: 'box-shadow 280ms ease, background-color 280ms ease, transform 280ms ease',
              '&:hover': {
                bgcolor: 'var(--mbp-palette-primary-600)',
                boxShadow: `0 0 64px rgba(167, 139, 250, 0.3), 0 0 16px rgba(167, 139, 250, 0.3)`,
                transform: 'translateY(-3px)',
              },
            }}
            component='a'
            target='_blank'
            href="https://calendly.com/justin-makebelieveproductions/30min"
          >
            Let's Chat!
          </Button>
        </Box>
      </Box>
    </Stack>
  );
}
