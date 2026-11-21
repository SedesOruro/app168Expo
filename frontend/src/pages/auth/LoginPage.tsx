import { type FormEvent, type ReactElement, useState } from 'react';
import { Button, Stack, TextField } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useLocation, useNavigate } from 'react-router';
import { rutas } from '../../constants/rutas';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout } from '../../layouts/AuthLayout';
import { isValidEmail } from '../../utils/validators';

export const LoginPage = (): ReactElement => {
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const { signIn } = useAuth();
  const [email, setEmail] = useState<string>((location.state as { email?: string } | null)?.email ?? '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (evento: FormEvent): Promise<void> => {
    evento.preventDefault();
    if (!isValidEmail(email)) {
      enqueueSnackbar('Ingrese un correo electronico valido.', { variant: 'warning' });
      return;
    }
    setLoading(true);
    try {
      await signIn({ email, password });
    } catch (error) {
      enqueueSnackbar(error instanceof Error ? error.message : 'Revise sus credenciales.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="EMERGENCIAS 168" subtitle="Ingrese con su cuenta para solicitar y seguir asistencia.">
      <Stack component="form" spacing={2} onSubmit={onSubmit} noValidate>
        <TextField
          label="Correo electronico"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Contrasena"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" variant="contained" size="large" loading={loading}>
          Ingresar
        </Button>
        <Button onClick={() => navigate(rutas.registro)} sx={{ color: 'primary.dark' }}>
          Crear cuenta
        </Button>
      </Stack>
    </AuthLayout>
  );
};
