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


export default function ServicesSection() {
  return (
    <Box component="section" className="contentSection fullHeight">
      <Box component="header" className="contentSectionHeader">
        <Typography level="h2" component="h2">Our Services</Typography>
      </Box>
      <Grid container spacing={4}>
        
        <Grid xs={12} md={6} xl={4}>
          <Card variant="plain">
            <Typography level="title-lg">
              Product Definition
            </Typography>
              
            <Typography level="body-lg" sx={{minHeight: 90}}>
              We build a deep understanding of your vision, help you identify a minimum lovable product, 
              and forge a plan to bring it to life.
            </Typography>
              
            <Stack direction="row" spacing={2} sx={{justifyContent: 'space-between', alignItems: 'center'}}>
              <StatCard value='2-4' label='weeks' />
              <StatCard value='4-8' label='hours/week' />
              <StatCard value='$4,000' label='total' />
            </Stack>
              
            <Divider inset="none" sx={{'--Divider-childPosition':'1rem', mt: 2}}>
              Includes
            </Divider>
              
            <List sx={{minHeight: 200}}>
              <ListItem>
                <ListItemDecorator><CheckIcon /></ListItemDecorator>Product wireframes
              </ListItem>
              <ListItem>
                <ListItemDecorator><CheckIcon /></ListItemDecorator>Revenue and cost analysis
              </ListItem>
              <ListItem>
                <ListItemDecorator><CheckIcon /></ListItemDecorator>Preliminary development plan & timeline
              </ListItem>
              <ListItem>
                <ListItemDecorator><CheckIcon /></ListItemDecorator>De-risking of technical challenges
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
            <Typography level="body-lg" sx={{minHeight: 90}}>
              We work closely with your founding team to bring your product to market.
            </Typography>

            <Stack direction="row" spacing={2} sx={{justifyContent: 'space-between', alignItems: 'center'}}>
              <StatCard value='2-3' label='months' />
              <StatCard value='3' label='days/week' />
              <StatCard value='$19,500' label='per month' />
            </Stack>

            <Divider inset="none" sx={{'--Divider-childPosition': '1rem', mt: 2}}>
              Includes
            </Divider>

            <List sx={{minHeight: 200}}>
              <ListItem>
                <ListItemDecorator><CheckIcon /></ListItemDecorator>High-craft product running in production
              </ListItem>
              <ListItem>
                <ListItemDecorator><CheckIcon /></ListItemDecorator>Essential analytics to understand user behavior
              </ListItem>
              <ListItem>
                <ListItemDecorator><CheckIcon /></ListItemDecorator>Solid foundation for future development
              </ListItem>
              <ListItem>
                <ListItemDecorator><CheckIcon /></ListItemDecorator>Clear roadmap for next steps
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
            <Typography level="body-lg" sx={{minHeight: 90}}>
              We embed with your team to tackle daunting challenges that come with scale.
            </Typography>

            <Stack direction="row" spacing={2} sx={{justifyContent: 'space-between', alignItems: 'center'}}>
              <StatCard value='6+' label='months' />
              <StatCard value='1-3' label='days/week' />
              <StatCard value='$6,500+' label='per month' />
            </Stack>

            <Divider inset="none" sx={{'--Divider-childPosition':'1rem', mt: 2}}>
              Includes
            </Divider>

            <List sx={{minHeight: 200}}>
              <ListItem>
                <ListItemDecorator><CheckIcon /></ListItemDecorator>System performance improvements
              </ListItem>
              <ListItem>
                <ListItemDecorator><CheckIcon /></ListItemDecorator>Architectural transitions
              </ListItem>
              <ListItem>
                <ListItemDecorator><CheckIcon /></ListItemDecorator>Technical debt paydown
              </ListItem>
              <ListItem>
                <ListItemDecorator><CheckIcon /></ListItemDecorator>Solving operational edge-cases
              </ListItem>
              <ListItem>
                <ListItemDecorator><CheckIcon /></ListItemDecorator>Development tooling & process improvement
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
