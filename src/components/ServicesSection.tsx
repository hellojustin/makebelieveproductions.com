"use client";

import { Box, Button, Card, Divider, Grid, List, ListItem, Typography } from "@mui/joy";


export default function ServicesSection() {
  return (
    <Box component="section" className="contentSection">
      <Box component="header" className="contentSectionHeader">
        <Typography level="h2" component="h2">Our Services</Typography>
      </Box>
      <Grid container spacing={4}>
        
        <Grid xs={12} md={6} xl={4}>
          <Card variant="plain">
            <Typography level="title-lg">
              Product Definition
            </Typography>
              
            <Typography level="body-lg">
              We build a deep understanding of your vision, help you identify a minimum lovable product, 
              and forge a plan to bring it to life.
            </Typography>
              
            <Divider inset="none" sx={{'--Divider-childPosition':'1rem'}}>
              Structure
            </Divider>
              
            <List>
              <ListItem>
                2-4 weeks
              </ListItem>
              <ListItem>
                4-8 hours per week
              </ListItem>
              <ListItem>
                $4,000 total
              </ListItem>
            </List>
              
            <Divider inset="none" sx={{'--Divider-childPosition':'1rem'}}>
              Includes
            </Divider>
              
            <List>
              <ListItem>
                Product wireframes
              </ListItem>
              <ListItem>
                Revenue and cost analysis
              </ListItem>
              <ListItem>
                Preliminary development plan & timeline
              </ListItem>
              <ListItem>
                De-risking of technical challenges
              </ListItem>
            </List>

            <Button variant="outlined">
              Get Started
            </Button>
          </Card>
        </Grid>

        <Grid xs={12} md={6} xl={4}>
          <Card variant="plain">
            <Typography level="title-lg">
              Initial Build
            </Typography>
            <Typography level="body-lg">
              We work closely with your founding team to bring your product to market.
            </Typography>

            <Divider inset="none" sx={{'--Divider-childPosition':'1rem'}}>
              Structure
            </Divider>
            
            <List>
              <ListItem>
                2-3 months, depending on product complexity
              </ListItem>
              <ListItem>
                3 days per week
              </ListItem>
              <ListItem>
                $19,500 per month
              </ListItem>
            </List>

            <Divider inset="none" sx={{'--Divider-childPosition':'1rem'}}>
              Includes
            </Divider>

            <List>
              <ListItem>
                High-craft product running in production
              </ListItem>
              <ListItem>
                Essential analytics to understand user behavior
              </ListItem>
              <ListItem>
                Solid foundation for future development
              </ListItem>
              <ListItem>
                Clear roadmap for next steps
              </ListItem>
            </List>

            <Button variant='outlined'>
              Let's Go
            </Button>
          </Card>
        </Grid>
        
        <Grid xs={12} md={6} xl={4}>
          <Card variant="plain">
            <Typography level="title-lg">
              Scaling Support
            </Typography>
            <Typography level="body-lg">
              We embed with your team to tackle daunting challenges that come with scale.
            </Typography>

            <Divider inset="none" sx={{'--Divider-childPosition':'1rem'}}>
              Structure
            </Divider>
            
            <List>
              <ListItem>
                3-9 months; varies with scope of work
              </ListItem>
              <ListItem>
                1-3 days per week
              </ListItem>
              <ListItem>
                Starting at $6,500 per month
              </ListItem>
            </List>

            <Divider inset="none" sx={{'--Divider-childPosition':'1rem'}}>
              Includes
            </Divider>

            <List>
              <ListItem>
                System performance improvements
              </ListItem>
              <ListItem>
                Architectural transitions
              </ListItem>
              <ListItem>
                Technical debt paydown
              </ListItem>
              <ListItem>
                Solving operational edge-cases
              </ListItem>
              <ListItem>
                Development tooling & process improvement
              </ListItem>
            </List>

            <Button variant='outlined'>
              Let's Chat
            </Button>
          </Card>
        </Grid>

      </Grid>  
    </Box>
  );
}
