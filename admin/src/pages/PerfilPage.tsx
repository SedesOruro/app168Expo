import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import BadgeIcon from "@mui/icons-material/Badge";
import MailIcon from "@mui/icons-material/Mail";
import PhoneIcon from "@mui/icons-material/Phone";
import SecurityIcon from "@mui/icons-material/Security";
import { Avatar, Box, Chip, Divider, List, ListItem, ListItemIcon, ListItemText, Paper, Stack, Typography } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { PageContainer } from "../layouts/PageContainer";

export const PerfilPage = () => {
  const { session } = useAuth();

  return (
    <PageContainer>
      <Stack spacing={2}>
        <Typography variant="h5" sx={{
          fontWeight: 800
        }}>
          Perfil
        </Typography>
        <Paper variant="outlined" square sx={{ p: { xs: 2, md: 3 } }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={3} sx={{
            alignItems: { xs: "flex-start", sm: "center" }
          }}>
            <Avatar sx={{ width: 72, height: 72, bgcolor: "primary.main" }}>
              <AccountCircleIcon sx={{ fontSize: 48 }} />
            </Avatar>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography variant="h6" noWrap sx={{
                fontWeight: 800
              }}>
                {session?.nombre || session?.username || "Usuario"}
              </Typography>
              <Typography variant="body2" noWrap sx={{
                color: "text.secondary"
              }}>
                {session?.username || "Sin correo registrado"}
              </Typography>
            </Box>
            <Chip label={session?.rol || "sin rol"} color="primary" variant="outlined" />
          </Stack>

          <Divider sx={{ my: 3 }} />

          <List disablePadding>
            <ListItem disableGutters>
              <ListItemIcon>
                <MailIcon />
              </ListItemIcon>
              <ListItemText primary="Correo" secondary={session?.username || "-"} />
            </ListItem>
            <ListItem disableGutters>
              <ListItemIcon>
                <BadgeIcon />
              </ListItemIcon>
              <ListItemText primary="Nombre" secondary={session?.nombre || "-"} />
            </ListItem>
            <ListItem disableGutters>
              <ListItemIcon>
                <PhoneIcon />
              </ListItemIcon>
              <ListItemText primary="Celular" secondary={session?.celular || "-"} />
            </ListItem>
            <ListItem disableGutters>
              <ListItemIcon>
                <SecurityIcon />
              </ListItemIcon>
              <ListItemText primary="Permisos" secondary={Object.keys(session?.permisos || {}).join(", ") || "-"} />
            </ListItem>
          </List>
        </Paper>
      </Stack>
    </PageContainer>
  );
};
