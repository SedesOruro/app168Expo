import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Tooltip, Typography } from '@mui/material';
import { NavLink, useLocation } from 'react-router';
import { useModulosPermitidos } from '../../context/AuthContext';
import { useThemeMode } from '../../theme';
import { navConfig } from './navConfig';

export const DRAWER_WIDTH = 280;
export const DRAWER_MINI_WIDTH = 72;

type Props = {
    open: boolean;
    mini: boolean;
    onClose: () => void;
};

export const DashboardSidebar = ({ open, mini, onClose }: Props) => {
    const { pathname } = useLocation();
    const { mode, toggleMode } = useThemeMode();
    const permiteModulo = useModulosPermitidos();
    const items = navConfig.filter((item) => permiteModulo(item.id));
    const nextThemeLabel = mode === 'dark' ? 'Tema claro' : 'Tema oscuro';

    const content = (
        <Box sx={{ height: 1, display: 'flex', flexDirection: 'column' }}>
            <Toolbar sx={{ minHeight: 64, px: mini ? 1 : 2 }}>
                <Typography variant="subtitle1" noWrap sx={{
                    fontWeight: 800
                }}>
                    {mini ? '168' : 'Emergencias 168'}
                </Typography>
            </Toolbar>
            <List sx={{ px: 1 }}>
                {items.map((item) => {
                    const active = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);
                    return (
                        <ListItemButton
                            key={item.path}
                            component={NavLink}
                            to={item.path}
                            onClick={onClose}
                            selected={active}
                            sx={{ minHeight: 44, borderRadius: 1, justifyContent: mini ? 'center' : 'flex-start', px: mini ? 1.25 : 1.5 }}
                        >
                            <ListItemIcon sx={{ minWidth: mini ? 0 : 40, color: 'inherit' }}>{item.icon}</ListItemIcon>
                            {!mini && (
                                <ListItemText
                                    primary={<Typography variant="body2" sx={{ fontWeight: active ? 700 : 500 }}>{item.title}</Typography>}
                                />
                            )}
                        </ListItemButton>
                    );
                })}
            </List>
            <Box sx={{ flexGrow: 1 }} />
            <List sx={{ px: 1, pb: 1 }}>
                <Tooltip title={mini ? nextThemeLabel : ''} placement="right">
                    <ListItemButton
                        onClick={toggleMode}
                        sx={{ minHeight: 44, borderRadius: 1, justifyContent: mini ? 'center' : 'flex-start', px: mini ? 1.25 : 1.5 }}
                    >
                        <ListItemIcon sx={{ minWidth: mini ? 0 : 40, color: 'inherit' }}>
                            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                        </ListItemIcon>
                        {!mini && (
                            <ListItemText
                                primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{nextThemeLabel}</Typography>}
                            />
                        )}
                    </ListItemButton>
                </Tooltip>
            </List>
        </Box>
    );

    return (
        <>
            <Drawer
                open={open}
                onClose={onClose}
                variant="temporary"
                ModalProps={{ keepMounted: true }}
                sx={{ display: { xs: 'block', lg: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
            >
                {content}
            </Drawer>
            <Drawer
                open
                variant="permanent"
                sx={{
                    display: { xs: 'none', lg: 'block' },
                    width: mini ? DRAWER_MINI_WIDTH : DRAWER_WIDTH,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: mini ? DRAWER_MINI_WIDTH : DRAWER_WIDTH,
                        overflowX: 'hidden',
                        transition: (theme) => theme.transitions.create('width')
                    }
                }}
            >
                {content}
            </Drawer>
        </>
    );
};
