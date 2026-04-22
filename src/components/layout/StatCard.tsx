import { Stack, Typography } from "@mui/joy";

interface StatCardProps {
  value: string;
  label: string;
}

export default function StatCard({value, label}: StatCardProps) {
  return (
    <Stack

      sx={{
        p: 2,
        height: '6rem',
        flex: '1 1 0',
        textAlign: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.25)',
        borderRadius: '1.5rem'
      }}>
      <Typography
        component='div'
        fontWeight={700}
        fontSize={{xs: '1.6rem', sm:'1.8rem', lg: '2rem'}}
        lineHeight='normal'
      >
        {value}
      </Typography>
      <Typography
        component='div'
        fontSize={{xs: '0.8rem', sm:'0.9rem', lg: '1rem'}}
        lineHeight='normal'
      >
        {label}
      </Typography>
    </Stack>
  );
}