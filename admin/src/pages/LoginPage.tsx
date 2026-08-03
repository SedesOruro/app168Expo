import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LoginIcon from "@mui/icons-material/Login";
import { Alert, Avatar, Box, Button, Paper, Stack, TextField, Typography, useMediaQuery, useTheme } from "@mui/material";
import { FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

type LocationState = {
  from?: { pathname?: string };
};

export const LoginPage = () => {
  const { authenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down("md"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (authenticated) return <Navigate to="/" replace />;

  const from = ((location.state || {}) as LocationState).from?.pathname || "/";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Ingrese correo y contrasena.");
      return;
    }

    setLoading(true);
    const ok = await login(email.trim(), password);
    setLoading(false);

    if (!ok) {
      setError("Credenciales invalidas o usuario inactivo.");
      return;
    }
    navigate(from, { replace: true });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "minmax(360px, 0.92fr) minmax(380px, 1fr)" },
        bgcolor: "background.default"
      }}
    >
      {!compact && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            px: { md: 6, lg: 10 },
            color: "primary.contrastText",
            bgcolor: "primary.darker"
          }}
        >
          <Stack spacing={3} sx={{
            maxWidth: 560
          }}>
            <Typography variant="h2" sx={{
              fontWeight: 800
            }}>
              Emergencias 168
            </Typography>
            <Typography variant="h5" sx={{ color: "grey.300", lineHeight: 1.45 }}>
              Acceso para administrar ciudadanos, centros de salud y emergencias en operacion.
            </Typography>
          </Stack>
        </Box>
      )}

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: { xs: 2, sm: 4, md: 6 } }}>
        <Paper
          component="form"
          onSubmit={handleSubmit}
          variant="outlined"
          square
          sx={{ width: 1, maxWidth: 420, p: { xs: 2.5, sm: 4 } }}
        >
          <Stack spacing={2.5}>
            <Stack spacing={1} sx={{
              alignItems: "center"
            }}>
              <Avatar sx={{ bgcolor: "primary.main" }}>
                <LockOutlinedIcon />
              </Avatar>
              <Typography variant="h5" sx={{
                fontWeight: 800
              }}>
                Iniciar sesion
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  textAlign: "center"
                }}>
                Ingrese con un usuario activo registrado en la base de datos.
              </Typography>
            </Stack>

            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Correo electronico"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              fullWidth
            />
            <TextField
              label="Contrasena"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              fullWidth
            />
            <Button type="submit" variant="contained" size="large" startIcon={<LoginIcon />} disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar"}
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
};
