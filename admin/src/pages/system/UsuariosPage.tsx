import { Stack, Typography } from "@mui/material";
import { PageContainer } from "../../layouts/PageContainer";
import { UsuariosModulo } from "../../modules/system/usuarios";

export const UsuariosPage = () => (
  <PageContainer sx={{ height: { xs: "auto", md: "calc(100vh - 112px)" } }}>
    <Stack spacing={2} sx={{ height: 1, minHeight: { xs: 620, md: 0 } }}>
      <Typography variant="h5" sx={{
        fontWeight: 800
      }}>
        Usuarios
      </Typography>
      <UsuariosModulo />
    </Stack>
  </PageContainer>
);
