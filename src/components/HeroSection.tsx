import Box from "@mui/joy/Box";
import styles from "./HeroSection.module.scss";
import Button from "@mui/joy/Button";

export default function HeroSection() {
  return (
    <Box component="section" className={styles.heroSection}>
      <div className={styles.heroText}>
        <h1 className={styles.heroHeading}>
          MAKE BELIEVE
          <br />
          PRODUCTIONS
        </h1>
        <p className={styles.heroTagline}>Magical software for visionaries</p>
        <Box marginTop={4}>
          <Button 
            size='lg'
            variant='outlined'
            sx={{
              borderRadius: '3rem',
              backgroundColor: 'var(--mbp-color-bg)',
            }}
            component='a'
            href="#intro"
          >
            Learn More
          </Button>
        </Box>
      </div>
    </Box>
  );
}
