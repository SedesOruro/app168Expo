import type { ReactElement } from 'react';
import { Box, Button, ButtonBase, CircularProgress, Fab, Typography } from '@mui/material';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import EditNoteIcon from '@mui/icons-material/EditNote';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import LockResetIcon from '@mui/icons-material/LockReset';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import MedicationOutlinedIcon from '@mui/icons-material/MedicationOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlineOutlined';
import ReportGmailerrorredIcon from '@mui/icons-material/ReportGmailerrorred';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { BottomTabBar } from '../../components/BottomTabBar';
import { rutas } from '../../constants/rutas';
import { PageContainer } from '../../layouts/PageContainer';
import { emergencyApi } from '../../services/emergencias/EmergenciasService';
import { type PreferenciaTema, useTemaApp } from '../../theme';
import { shadows } from '../../theme/tokens';

const opcionesApariencia: { valor: PreferenciaTema; etiqueta: string }[] = [
  { valor: 'claro', etiqueta: 'Claro' },
  { valor: 'oscuro', etiqueta: 'Oscuro' },
  { valor: 'sistema', etiqueta: 'Sistema' },
];

export const PerfilPage = (): ReactElement => {
  const navigate = useNavigate();
  const { preferencia, cambiarPreferencia } = useTemaApp();
  const query = useQuery({ queryKey: ['emergency-profile'], queryFn: emergencyApi.getProfile });
  const data = query.data;
  const contact = data?.contacts?.[0];

  const profileRows = [
    {
      Icono: PersonOutlineIcon,
      label: 'Nombre / CI / Celular',
      value: data
        ? `${data.profile.nombres} ${data.profile.apellidos} | ${data.profile.cedula_identidad}${data.profile.complemento_ci ? `-${data.profile.complemento_ci}` : ''} | ${data.phone}`
        : 'Sin datos',
    },
    { Icono: HomeOutlinedIcon, label: 'Direccion', value: data?.profile.direccion || 'No registrada' },
    { Icono: BloodtypeIcon, label: 'Grupo sanguineo', value: data?.profile.tipo_sangre || 'No registrado' },
    { Icono: ReportGmailerrorredIcon, label: 'Alergias', value: data?.profile.alergias || 'No registradas' },
    { Icono: MedicalServicesOutlinedIcon, label: 'Enfermedades', value: data?.profile.enfermedades_cronicas || 'No registradas' },
    { Icono: MedicationOutlinedIcon, label: 'Medicamentos', value: data?.profile.medicamentos_actuales || 'No registrados' },
    { Icono: FavoriteBorderIcon, label: 'Contacto referencia', value: contact ? `${contact.nombre_completo} | ${contact.telefono}` : 'No registrado' },
  ];

  return (
    <PageContainer conBarraInferior>
      <Box sx={{ px: '24px', pt: '50px' }}>
        <Typography component="h1" sx={{ color: 'app.accentText', fontSize: 29, lineHeight: '35px', fontWeight: 700, textAlign: 'center' }}>
          Mi perfil de emergencia
        </Typography>
        <Typography color="text.secondary" sx={{ mt: '10px', textAlign: 'center' }}>
          Datos guardados una sola vez para ayudar al operador.
        </Typography>

        {query.isLoading ? (
          <Box sx={{ display: 'grid', placeItems: 'center', mt: 3 }}>
            <CircularProgress size={40} sx={{ color: 'app.accentText' }} />
          </Box>
        ) : null}

        <Box sx={{ mt: '28px', bgcolor: 'app.surface', borderRadius: '8px', border: 1, borderColor: 'divider', px: '18px', py: '12px', boxShadow: shadows.md }}>
          <Box component="dl" sx={{ m: 0 }}>
            {profileRows.map(({ Icono, label, value }, index) => (
              <Box
                key={label}
                sx={{
                  minHeight: 72,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  borderBottom: index < profileRows.length - 1 ? 1 : 0,
                  borderColor: 'app.surfaceMuted',
                }}
              >
                <Icono sx={{ fontSize: 27, color: 'app.accentText' }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography component="dt" sx={{ color: 'text.secondary', fontSize: 13, lineHeight: '18px', fontWeight: 600 }}>
                    {label}
                  </Typography>
                  <Typography component="dd" sx={{ m: 0, mt: '3px', fontSize: 17, lineHeight: '22px', fontWeight: 700, overflowWrap: 'anywhere' }}>
                    {value}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* El modo oscuro es opcional: arranca en claro y solo cambia si se elige aqui. */}
        <Box sx={{ mt: '20px' }}>
          <Typography component="h2" sx={{ fontSize: 18, lineHeight: '24px', fontWeight: 700 }}>
            Apariencia
          </Typography>
          <Box sx={{ mt: '10px', display: 'flex', gap: '10px' }}>
            {opcionesApariencia.map((opcion) => {
              const activa = opcion.valor === preferencia;
              return (
                <ButtonBase
                  key={opcion.valor}
                  aria-label={`Apariencia ${opcion.etiqueta}`}
                  aria-pressed={activa}
                  onClick={() => {
                    cambiarPreferencia(opcion.valor).catch(() => undefined);
                  }}
                  sx={{
                    flex: 1,
                    minHeight: 48,
                    borderRadius: '24px',
                    border: '1.2px solid',
                    borderColor: activa ? 'app.accentFill' : 'divider',
                    bgcolor: activa ? 'app.accentFill' : 'app.surface',
                    color: activa ? 'app.onFill' : 'text.primary',
                    fontWeight: 700,
                    fontSize: 15,
                  }}
                >
                  {opcion.etiqueta}
                </ButtonBase>
              );
            })}
          </Box>
        </Box>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<LockResetIcon />}
          onClick={() => navigate(rutas.cambiarContrasena)}
          sx={{ mt: '20px', minHeight: 52, borderRadius: '8px', borderWidth: 1.2, borderColor: 'app.accentText', color: 'app.accentText', fontWeight: 700 }}
        >
          Cambiar contrasena
        </Button>
      </Box>

      <Fab
        aria-label="Editar perfil de emergencia"
        onClick={() => navigate(rutas.perfilEditar)}
        sx={{
          position: 'fixed',
          right: 'max(34px, calc(50% - 240px + 34px))',
          bottom: 'calc(152px + env(safe-area-inset-bottom))',
          width: 62,
          height: 62,
          borderRadius: '18px',
          bgcolor: 'app.accentFill',
          color: 'app.onFill',
          '&:hover': { bgcolor: 'app.accentFill' },
        }}
      >
        <EditNoteIcon sx={{ fontSize: 30 }} />
      </Fab>
      <BottomTabBar active="Profile" />
    </PageContainer>
  );
};
