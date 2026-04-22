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
            </Card>
          </Grid>

          <Grid xs={12} md={6} xl={4}>
            <Card variant="plain">
              <Typography level="title-lg">
                Build &amp; Launch
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
              fontSize: '1.5rem'
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
