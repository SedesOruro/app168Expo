import type { ReactElement, ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import imagen from '../assets/introduction_image.png';
import { radius, spacing } from '../theme/tokens';
import { PageContainer } from './PageContainer';

type AuthLayoutProps = { title: string; subtitle: string; children: ReactNode };

export const AuthLayout = ({ title, subtitle, children }: AuthLayoutProps): ReactElement => (
  <PageContainer>
    <Box
      sx={{
        minHeight: 260,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        p: `${spacing.xl}px`,
        pb: `${spacing.xl + 24}px`,
        backgroundImage: `linear-gradient(rgba(0,0,0,0.38), rgba(0,0,0,0.38)), url(${imagen})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Typography variant="h1" sx={{ color: '#fff' }}>
        {title}
      </Typography>
      <Typography sx={{ color: 'rgba(255,255,255,0.88)', mt: `${spacing.sm}px` }}>{subtitle}</Typography>
    </Box>
    <Box
      sx={{
        mt: '-24px',
        position: 'relative',
        borderTopLeftRadius: radius.xl,
        borderTopRightRadius: radius.xl,
        bgcolor: 'background.default',
        p: `${spacing.xl}px`,
      }}
    >
      {children}
    </Box>
  </PageContainer>
);
