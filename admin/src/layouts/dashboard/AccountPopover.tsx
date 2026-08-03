import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import { Avatar, Box, Divider, IconButton, ListItemIcon, MenuItem, MenuList, Tooltip, Typography } from "@mui/material";
import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import MenuPopover from "../../components/MenuPopover";
import { useAuth } from "../../context/AuthContext";

export const AccountPopover = () => {
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { session, logout } = useAuth();

  const handleLogout = async (): Promise<void> => {
    setOpen(false);
    await logout();
    navigate("/login", { replace: true });
  };

  const handleProfile = (): void => {
    setOpen(false);
    navigate("/perfil");
  };

  return (
    <>
      <Tooltip title="Perfil">
        <IconButton ref={anchorRef} onClick={() => setOpen(true)} sx={{ p: 0.5 }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main" }}>
            <AccountCircleIcon />
          </Avatar>
        </IconButton>
      </Tooltip>

      <MenuPopover open={open} anchorEl={anchorRef.current} onClose={() => setOpen(false)} sx={{ width: 260 }}>
        <Box sx={{ px: 1.5, py: 1 }}>
          <Typography variant="subtitle2" noWrap>
            {session?.nombre || "Usuario"}
          </Typography>
          <Typography variant="caption" noWrap component="div" sx={{
            color: "text.secondary"
          }}>
            {session?.username || ""}
          </Typography>
        </Box>
        <Divider sx={{ borderStyle: "dashed" }} />
        <MenuList sx={{ p: 1 }}>
          <MenuItem onClick={handleProfile}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            Perfil
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Cerrar sesion
          </MenuItem>
        </MenuList>
      </MenuPopover>
    </>
  );
};
