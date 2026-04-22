import { Box, Card, Grid, Stack, Typography } from "@mui/joy";
import SectionHeader from "./layout/SectionHeader";


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

      <Grid container spacing={4}>
        <Grid xs={6} md={4}>
          <Card variant="plain">
            <Typography level="title-lg">
              Modern Treasury
            </Typography>
          </Card>
        </Grid>
        <Grid xs={6} md={4}>
          <Card variant="plain">
            <Typography level="title-lg">
              Seam
            </Typography>
          </Card>
        </Grid>
        <Grid xs={6} md={4}>
          <Card variant="plain">
            <Typography level="title-lg">
              Geek
            </Typography>
          </Card>
        </Grid>
        <Grid xs={6} md={4}>
          <Card variant="plain">
            <Typography level="title-lg">
              ClayLab
            </Typography>
          </Card>
        </Grid>
        <Grid xs={6} md={4}>
          <Card variant="plain">
            <Typography level="title-lg">
              Caroga Arts Collective
            </Typography>
          </Card>
        </Grid>
        <Grid xs={6} md={4}>
          <Card variant="plain">
            <Typography level="title-lg">
              Teleport
            </Typography>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}