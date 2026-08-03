import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import { RolFormularioModelo, RolesModuloServicio } from "./RolesModuloServicio";

const PERMISOS = [
  { value: "read", label: "Leer" },
  { value: "create", label: "Crear" },
  { value: "edit", label: "Editar" },
  { value: "remove", label: "Eliminar" },
  { value: "send", label: "Enviar" },
  { value: "download", label: "Descargar" },
  { value: "approve", label: "Aprobar" }
];

const MODULOS = [
  { id: "usuarios", name: "usuarios", path: "/usuarios", title: "Usuarios", icon: "usuarios", color: "primary" },
  { id: "roles", name: "roles", path: "/roles", title: "Roles", icon: "roles", color: "primary" }
];

const emptyForm: RolFormularioModelo = {
  nombre: "",
  tipo: "",
  permisos: ["read"],
  modulos: []
};

type Props = {
  open: boolean;
  formModel?: RolFormularioModelo;
  onCancel: () => void;
  onComplete: () => void;
  onError: (message: string) => void;
};

export const RolFormularioDialog = ({ open, formModel, onCancel, onComplete, onError }: Props) => {
  const [form, setForm] = useState<RolFormularioModelo>(emptyForm);

  useEffect(() => {
    if (!open) return;
    setForm(formModel || emptyForm);
  }, [formModel, open]);

  const togglePermiso = (value: string): void => {
    setForm((current) => ({
      ...current,
      permisos: current.permisos.includes(value)
        ? current.permisos.filter((item) => item !== value)
        : current.permisos.concat(value)
    }));
  };

  const toggleModulo = (id: string): void => {
    setForm((current) => {
      const exists = current.modulos.some((item) => item.id === id || item.name === id);
      return {
        ...current,
        modulos: exists ? current.modulos.filter((item) => item.id !== id && item.name !== id) : current.modulos.concat(MODULOS.find((item) => item.id === id)!)
      };
    });
  };

  const handleSubmit = async (): Promise<void> => {
    if (!form.nombre.trim()) {
      onError("El nombre del rol es requerido");
      return;
    }

    const result = form.id ? await RolesModuloServicio.actualizarRol(form) : await RolesModuloServicio.crearRol(form);
    if (!result.success) {
      onError(result.msg);
      return;
    }
    onComplete();
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{form.id ? "Editar rol" : "Agregar rol"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="Nombre del rol"
            value={form.nombre}
            onChange={(event) => setForm((current) => ({ ...current, nombre: event.target.value }))}
            fullWidth
          />
          <TextField
            label="Tipo"
            value={form.tipo || ""}
            onChange={(event) => setForm((current) => ({ ...current, tipo: event.target.value }))}
            helperText="Si se deja vacio, el backend lo genera desde el nombre."
            fullWidth
          />
          <Stack>
            <Typography variant="subtitle2">Permisos</Typography>
            <Stack
              direction="row"
              sx={{
                flexWrap: "wrap",
                columnGap: 2
              }}>
              {PERMISOS.map((permiso) => (
                <FormControlLabel
                  key={permiso.value}
                  control={<Checkbox checked={form.permisos.includes(permiso.value)} onChange={() => togglePermiso(permiso.value)} />}
                  label={permiso.label}
                />
              ))}
            </Stack>
          </Stack>
          <Stack>
            <Typography variant="subtitle2">Modulos del dashboard</Typography>
            <Stack
              direction="row"
              sx={{
                flexWrap: "wrap",
                columnGap: 2
              }}>
              {MODULOS.map((modulo) => (
                <FormControlLabel
                  key={modulo.id}
                  control={
                    <Checkbox
                      checked={form.modulos.some((item) => item.id === modulo.id || item.name === modulo.id)}
                      onChange={() => toggleModulo(modulo.id)}
                    />
                  }
                  label={modulo.title}
                />
              ))}
            </Stack>
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
