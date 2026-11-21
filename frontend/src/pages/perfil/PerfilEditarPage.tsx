import { type FormEvent, type ReactElement, useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Stack, TextField, Typography } from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router';
import { CabeceraFlujo } from '../../components/CabeceraFlujo';
import { PageContainer } from '../../layouts/PageContainer';
import { emergencyApi } from '../../services/emergencias/EmergenciasService';
import { spacing } from '../../theme/tokens';

type FormState = {
  document: string;
  names: string;
  surnames: string;
  birthDate: string;
  phone: string;
  address: string;
  bloodType: string;
  allergies: string;
  conditions: string;
  medicines: string;
  contactName: string;
  contactPhone: string;
};

const initialForm: FormState = {
  document: '',
  names: '',
  surnames: '',
  birthDate: '',
  phone: '',
  address: '',
  bloodType: '',
  allergies: '',
  conditions: '',
  medicines: '',
  contactName: '',
  contactPhone: '',
};

const fields: { key: keyof FormState; label: string; editable?: boolean; type?: string }[] = [
  { key: 'document', label: 'Cedula de identidad', editable: false },
  { key: 'names', label: 'Nombres*' },
  { key: 'surnames', label: 'Apellidos*' },
  { key: 'birthDate', label: 'Fecha de nacimiento*', type: 'date' },
  { key: 'phone', label: 'Numero de celular*', type: 'tel' },
  { key: 'address', label: 'Direccion de domicilio*' },
  { key: 'bloodType', label: 'Grupo sanguineo' },
  { key: 'allergies', label: 'Alergias' },
  { key: 'conditions', label: 'Enfermedades' },
  { key: 'medicines', label: 'Medicamentos' },
  { key: 'contactName', label: 'Nombre del contacto*' },
  { key: 'contactPhone', label: 'Telefono del contacto*', type: 'tel' },
];

export const PerfilEditarPage = (): ReactElement => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['emergency-profile'], queryFn: emergencyApi.getProfile });
  const [form, setForm] = useState<FormState>(initialForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!query.data) return;
    const contact = query.data.contacts[0];
    // El formulario solo puede inicializarse cuando finaliza la consulta remota.
    setForm({
      document: query.data.profile.cedula_identidad,
      names: query.data.profile.nombres,
      surnames: query.data.profile.apellidos,
      birthDate: (query.data.profile.fecha_nacimiento || '').slice(0, 10),
      phone: query.data.phone || '',
      address: query.data.profile.direccion || '',
      bloodType: query.data.profile.tipo_sangre || '',
      allergies: query.data.profile.alergias || '',
      conditions: query.data.profile.enfermedades_cronicas || '',
      medicines: query.data.profile.medicamentos_actuales || '',
      contactName: contact?.nombre_completo || '',
      contactPhone: contact?.telefono || '',
    });
  }, [query.data]);

  const setField = (field: keyof FormState, value: string): void => setForm((current) => ({ ...current, [field]: value }));

  const save = async (evento: FormEvent): Promise<void> => {
    evento.preventDefault();
    if (!form.names || !form.surnames || !form.phone || !form.address) {
      enqueueSnackbar('Datos incompletos. Complete nombres, apellidos, telefono y direccion.', { variant: 'warning' });
      return;
    }
    setSaving(true);
    try {
      await emergencyApi.updateProfile({
        nombres: form.names,
        apellidos: form.surnames,
        fecha_nacimiento: form.birthDate,
        phone: form.phone,
        direccion: form.address,
        tipo_sangre: form.bloodType,
        alergias: form.allergies,
        enfermedades_cronicas: form.conditions,
        medicamentos_actuales: form.medicines,
        contact: { name: form.contactName, phone: form.contactPhone },
      });
      await queryClient.invalidateQueries({ queryKey: ['emergency-profile'] });
      enqueueSnackbar('Perfil actualizado. Los datos fueron guardados correctamente.', { variant: 'success' });
      navigate(-1);
    } catch (error) {
      enqueueSnackbar(`No se pudo actualizar: ${error instanceof Error ? error.message : 'Intente nuevamente.'}`, { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <CabeceraFlujo titulo="Actualizar datos" onVolver={() => navigate(-1)} />
      {query.isLoading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', mt: 6 }}>
          <CircularProgress size={48} sx={{ color: 'app.accentText' }} />
        </Box>
      ) : (
        <Stack component="form" onSubmit={(e) => void save(e)} spacing={`${spacing.md}px`} sx={{ px: `${spacing.xl}px`, pt: `${spacing.xl}px` }}>
          <Typography color="text.secondary">Mantenga actualizados los datos que vera el operador durante una emergencia.</Typography>
          {fields.map((field) => (
            <TextField
              key={field.key}
              label={field.label}
              type={field.type}
              value={form[field.key]}
              disabled={field.editable === false}
              onChange={(e) => setField(field.key, e.target.value)}
              slotProps={field.type === 'date' ? { inputLabel: { shrink: true } } : undefined}
              sx={{ '& .Mui-focused fieldset': { borderColor: 'app.accentText' }, '& label.Mui-focused': { color: 'app.accentText' } }}
            />
          ))}
          <Button
            type="submit"
            fullWidth
            disabled={saving}
            sx={{
              minHeight: 60,
              borderRadius: '8px',
              bgcolor: 'app.accentFill',
              color: 'app.onFill',
              fontSize: 18,
              fontWeight: 700,
              '&:hover': { bgcolor: 'app.accentFill' },
              '&.Mui-disabled': { bgcolor: 'app.accentFill', color: 'app.onFill', opacity: 0.6 },
            }}
          >
            {saving ? <CircularProgress size={24} sx={{ color: 'app.onFill' }} /> : 'ACTUALIZAR'}
          </Button>
        </Stack>
      )}
    </PageContainer>
  );
};
