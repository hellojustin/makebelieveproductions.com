import { Box, Divider, Grid, Typography } from "@mui/joy";

interface SectionHeaderProps {
  title: string;
  children: React.ReactNode;
}

export default function SectionHeader({ title, children }: SectionHeaderProps) {
  return (
    <Box component="header" className="contentSectionHeader">
      <Divider inset="none" sx={{ mt: 2, '--Divider-childPosition':'1rem'}}>
        <Typography level="h3" component="h3">{title}</Typography>
      </Divider>
      <Grid container spacing={4}>
        <Grid xs={12} md={6} xl={4} sx={{pl: '2.5rem'}}>
          {children}
        </Grid>
      </Grid>
    </Box>
  );
}