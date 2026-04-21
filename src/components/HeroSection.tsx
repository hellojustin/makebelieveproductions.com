import Box from "@mui/joy/Box";
import styles from "./HeroSection.module.scss";

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
      </div>
    </Box>
  );
}
