import { Sheet, Stack, Typography } from "@mui/joy";

export default function Footer() {
  return (
    <Sheet component="footer" className="footer">
      <Stack
        className="footerContent"
        direction="column"
        justifyContent="space-between"
      >
        <Stack direction="column" spacing={1}>
          <Typography className="wordmark">Make Believe Productions</Typography>
          <Typography className="address">981 Mission Street</Typography>
          <Typography className="address">San Francisco, CA 94103</Typography>
          <Typography className="address">hello@makebelieveproductions.com</Typography>
        </Stack>
        <Typography className="address">
          &copy; {new Date().getFullYear()} Make Believe Productions, LLC. All Rights Reserved.
        </Typography>
      </Stack>
    </Sheet>
  );
}
