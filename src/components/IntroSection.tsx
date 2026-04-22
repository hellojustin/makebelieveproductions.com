import {Box, Typography} from "@mui/joy"

export default function IntroSection() {
  return (
    <Box
      component="section"
      className="contentSection noHeader halfHeight"
      display='flex'
      alignItems='center'
      justifyContent='center'
      sx={{
        pt: '4rem'
      }}
    >
      <Typography textAlign='center' fontSize='1.5rem' lineHeight='1.25' maxWidth='40rem'>
        The Internet is the canvas on which visionaries paint.<br/><br/>
        We are the brush.<br/><br/>
        
        We summon a wealth of experience building in venture-backed environments to 
        internalize your vision, understand who you serve, and learn your taste.<br/><br/>

        Then we work at a level of craft that many mistake for magic.<br/><br/>

        Let's make a masterpiece together.
      </Typography>
    </Box>
  );
}