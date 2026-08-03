import { Button, Paper, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router';
import { PageContainer } from '../layouts/PageContainer';

export const Page404 = () => (
    <PageContainer>
        <Paper variant="outlined" square sx={{ p: { xs: 2, md: 3 } }}>
            <Stack spacing={2} sx={{
                alignItems: "flex-start"
            }}>
                <Typography variant="h5" sx={{
                    fontWeight: 800
                }}>
                    Página no encontrada
                </Typography>
                <Button component={RouterLink} to="/" variant="contained">
                    Volver al inicio
                </Button>
            </Stack>
        </Paper>
    </PageContainer>
);
