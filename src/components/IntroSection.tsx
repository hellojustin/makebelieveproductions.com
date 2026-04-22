import {Box, Button, Typography} from "@mui/joy"

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
      gap={4}
      sx={{
        pt: '4rem'
      }}
    >
      <Typography textAlign='center' fontSize='1.5rem' lineHeight='1.25' maxWidth='40rem'>
        The Internet is the canvas<br/>on which visionaries paint.<br/><br/>
        We are the brush.<br/>
      </Typography>
        <Button
          variant='solid'
          size='lg'
          component='a'
          target='_blank'
          href="https://calendly.com/justin-makebelieveproductions/30min"
          sx={{
            borderRadius: '3rem',
            backgroundColor: 'var(--mbp-color-bg)',
            '&:hover > *': {
              color: '#ffffff'
            }
          }}
        >
          <Typography textAlign='center' fontSize='1.5rem' lineHeight='1.25' fontWeight='normal' maxWidth='40rem'>
            Let's create a masterpiece.
          </Typography>          
        </Button>
    </Box>
  );
}