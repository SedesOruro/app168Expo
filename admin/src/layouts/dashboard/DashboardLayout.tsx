import { Box } from '@mui/material';
import { useState } from 'react';
import { Outlet } from 'react-router';
import { DashboardNavbar } from './DashboardNavbar';
import { DRAWER_MINI_WIDTH, DRAWER_WIDTH, DashboardSidebar } from './DashboardSidebar';

export const DashboardLayout = () => {
    const [open, setOpen] = useState(false);
    const [mini, setMini] = useState(false);

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <DashboardNavbar mini={mini} onOpenSidebar={() => setOpen(true)} onToggleMini={() => setMini((value) => !value)} />
            <DashboardSidebar open={open} mini={mini} onClose={() => setOpen(false)} />
            <Box
                component="main"
                sx={{
                    minHeight: '100vh',
                    pt: { xs: 9, lg: 10 },
                    px: { xs: 1.5, sm: 2, lg: 3 },
                    pb: { xs: 2, lg: 3 },
                    ml: { lg: `${mini ? DRAWER_MINI_WIDTH : DRAWER_WIDTH}px` },
                    transition: (theme) => theme.transitions.create('margin-left')
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};
