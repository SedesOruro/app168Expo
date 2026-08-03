import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import { AppBar, Box, IconButton, Stack, Toolbar, Tooltip, Typography } from "@mui/material";
import { useThemeMode } from "../../theme";
import { AccountPopover } from "./AccountPopover";
import { DRAWER_MINI_WIDTH, DRAWER_WIDTH } from "./DashboardSidebar";

type Props = {
  mini: boolean;
  onOpenSidebar: () => void;
  onToggleMini: () => void;
};

export const DashboardNavbar = ({ mini, onOpenSidebar, onToggleMini }: Props) => {
  const { mode, toggleMode } = useThemeMode();

  return (
    <AppBar
      elevation={0}
      color="inherit"
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        width: { lg: `calc(100% - ${mini ? DRAWER_MINI_WIDTH : DRAWER_WIDTH}px)` },
        ml: { lg: `${mini ? DRAWER_MINI_WIDTH : DRAWER_WIDTH}px` },
        bgcolor: "background.paper"
      }}
    >
      <Toolbar sx={{ minHeight: 64 }}>
        <IconButton edge="start" onClick={onOpenSidebar} sx={{ mr: 1, display: { lg: "none" } }}>
          <MenuIcon />
        </IconButton>
        <IconButton edge="start" onClick={onToggleMini} sx={{ mr: 1, display: { xs: "none", lg: "inline-flex" } }}>
          {mini ? <MenuIcon /> : <MenuOpenIcon />}
        </IconButton>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" noWrap sx={{
            fontWeight: 800
          }}>
            Central 168
          </Typography>
          <Typography variant="caption" noWrap component="div" sx={{
            color: "text.secondary"
          }}>
            Panel administrativo y operativo
          </Typography>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={0.5} sx={{
          alignItems: "center"
        }}>
          <Tooltip title={mode === "dark" ? "Tema claro" : "Tema oscuro"}>
            <IconButton onClick={toggleMode}>{mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}</IconButton>
          </Tooltip>
          <AccountPopover />
        </Stack>
      </Toolbar>
    </AppBar>
  );
};
