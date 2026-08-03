import LogoutIcon from "@mui/icons-material/Logout";
import { Box, Button, Paper, Stack, Tab, Tabs, Typography } from "@mui/material";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { RolesModulo } from "./roles";
import { UsuariosModulo } from "./usuarios";

export const SecurityPage = () => {
  const { logout } = useAuth();
  const [tab, setTab] = useState(0);

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} sx={{
        alignItems: "center"
      }}>
        <Typography variant="h6" sx={{
          flexGrow: 1
        }}>
          Seguridad
        </Typography>
        <Button startIcon={<LogoutIcon />} onClick={logout}>
          Salir
        </Button>
      </Stack>
      <Paper variant="outlined" square>
        <Tabs value={tab} onChange={(_event, value) => setTab(value)}>
          <Tab label="Usuarios" />
          <Tab label="Roles" />
        </Tabs>
      </Paper>
      <Box sx={{ height: { xs: "70vh", md: "calc(100vh - 230px)" } }}>{tab === 0 ? <UsuariosModulo /> : <RolesModulo />}</Box>
    </Stack>
  );
};
