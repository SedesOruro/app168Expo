import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField
} from "@mui/material";
import { useEffect, useState } from "react";
import { RolOpcion, RolesModuloServicio } from "../roles";
import { UsuarioFormModel, UsuariosModuloServicio } from "./UsuariosModuloServicio";

const emptyForm: UsuarioFormModel = {
  email: "",
  password: "",
  ci: "",
  nombre: "",
  primer_apellido: "",
  segundo_apellido: "",
  direccion: "",
  telefono: "",
  is_jefe: false,
  genero: "NINGUNO",
  rol_id: ""
};

type Props = {
  open: boolean;
  formModel?: UsuarioFormModel;
  onCancel: () => void;
  onComplete: () => void;
  onError: (message: string) => void;
};

export const UsuarioFormularioDialog = ({ open, formModel, onCancel, onComplete, onError }: Props) => {
  const [form, setForm] = useState<UsuarioFormModel>(emptyForm);
  const [roles, setRoles] = useState<RolOpcion[]>([]);

  useEffect(() => {
    if (!open) return;
    setForm(
      formModel
        ? {
            ...formModel,
            password: "******",
            is_jefe: formModel.is_jefe === true || String(formModel.is_jefe) === "1"
          }
        : emptyForm
    );
    RolesModuloServicio.obtenerTodosRoles().then((result) => {
      if (result.success) setRoles(result.rows || []);
    });
  }, [formModel, open]);

  const handleSubmit = async (): Promise<void> => {
    if (!form.email.trim() || !form.nombre.trim() || !form.primer_apellido.trim() || !form.rol_id) {
      onError("Complete correo, nombre, primer apellido y rol");
      return;
    }
    if (!form.id && !form.password?.trim()) {
      onError("La contrasena es requerida para usuarios nuevos");
      return;
    }

    const result = form.id ? await UsuariosModuloServicio.actualizarUsuario(form) : await UsuariosModuloServicio.crearUsuario(form);
    if (!result.success) {
      onError(result.msg);
      return;
    }
    onComplete();
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="md" fullWidth>
      <DialogTitle>{form.id ? "Editar usuario" : "Agregar usuario"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField label="Correo electronico" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} fullWidth />
            <TextField
              label="Contrasena"
              type="password"
              value={form.password || ""}
              disabled={!!form.id}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              fullWidth
            />
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField label="CI" value={form.ci} onChange={(event) => setForm((current) => ({ ...current, ci: event.target.value }))} fullWidth />
            <FormControl fullWidth>
              <InputLabel>Rol</InputLabel>
              <Select label="Rol" value={form.rol_id} onChange={(event) => setForm((current) => ({ ...current, rol_id: event.target.value }))}>
                {roles.map((rol) => (
                  <MenuItem key={rol.id} value={rol.id}>
                    {rol.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField label="Nombre(s)" value={form.nombre} onChange={(event) => setForm((current) => ({ ...current, nombre: event.target.value }))} fullWidth />
            <TextField label="Primer apellido" value={form.primer_apellido} onChange={(event) => setForm((current) => ({ ...current, primer_apellido: event.target.value }))} fullWidth />
            <TextField label="Segundo apellido" value={form.segundo_apellido || ""} onChange={(event) => setForm((current) => ({ ...current, segundo_apellido: event.target.value }))} fullWidth />
          </Stack>
          <TextField label="Direccion" value={form.direccion || ""} onChange={(event) => setForm((current) => ({ ...current, direccion: event.target.value }))} fullWidth />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField label="Telefono" value={form.telefono} onChange={(event) => setForm((current) => ({ ...current, telefono: event.target.value }))} fullWidth />
            <FormControl fullWidth>
              <InputLabel>Genero</InputLabel>
              <Select label="Genero" value={form.genero} onChange={(event) => setForm((current) => ({ ...current, genero: event.target.value as UsuarioFormModel["genero"] }))}>
                <MenuItem value="MASCULINO">MASCULINO</MenuItem>
                <MenuItem value="FEMENINO">FEMENINO</MenuItem>
                <MenuItem value="NINGUNO">NINGUNO</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={<Checkbox checked={!!form.is_jefe} onChange={(event) => setForm((current) => ({ ...current, is_jefe: event.target.checked }))} />}
              label="Es jefe"
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
