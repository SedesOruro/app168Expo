import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import EditIcon from "@mui/icons-material/Edit";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { PageContainer } from "../../layouts/PageContainer";
import { HealthCenterForm, HealthCenterRow, OperationsService } from "../../services/operations/OperationsService";

const emptyForm: HealthCenterForm = {
  codigo_rues: "",
  nombre: "",
  departamento: "Oruro",
  red_salud: "",
  municipio: "",
  localidad: "",
  direccion: "",
  nivel: "",
  tipo: "",
  latitud: null,
  longitud: null,
  activo: true,
};

export const CentrosSaludPage = () => {
  const [rows, setRows] = useState<HealthCenterRow[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<HealthCenterRow | null>(null);
  const [form, setForm] = useState<HealthCenterForm>(emptyForm);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await OperationsService.healthCenters({ page: page + 1, rowsPerPage, searchText: search, orderBy: "nombre", order: "asc" });
    if (result.success) {
      setRows(result.rows || []);
      setCount(result.count || 0);
      setError("");
    } else setError(result.msg);
    setLoading(false);
  }, [page, rowsPerPage, search]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (row: HealthCenterRow) => {
    setEditing(row);
    setForm({
      codigo_rues: row.codigo_rues, nombre: row.nombre, departamento: row.departamento,
      red_salud: row.red_salud, municipio: row.municipio, localidad: row.localidad || "",
      direccion: row.direccion || "", nivel: row.nivel || "", tipo: row.tipo || "",
      latitud: row.latitud ?? null, longitud: row.longitud ?? null, activo: row.activo,
    });
    setOpen(true);
  };
  const setField = (field: keyof HealthCenterForm, value: unknown) => setForm((current) => ({ ...current, [field]: value }));

  const save = async () => {
    if (!form.codigo_rues || !form.nombre || !form.red_salud || !form.municipio) {
      setError("Complete codigo RUES, nombre, red y municipio.");
      return;
    }
    setSaving(true);
    const result = editing
      ? await OperationsService.updateHealthCenter(editing.uuid, form)
      : await OperationsService.createHealthCenter(form);
    setSaving(false);
    if (!result.success) { setError(result.msg); return; }
    setOpen(false);
    await load();
  };

  const deactivate = async (row: HealthCenterRow) => {
    if (!window.confirm(`Desactivar ${row.nombre}?`)) return;
    const result = await OperationsService.deactivateHealthCenter(row.uuid);
    if (!result.success) setError(result.msg);
    else await load();
  };

  const fields: Array<{ key: keyof HealthCenterForm; label: string; type?: string; required?: boolean }> = [
    { key: "codigo_rues", label: "Codigo RUES", required: true },
    { key: "nombre", label: "Nombre", required: true },
    { key: "departamento", label: "Departamento", required: true },
    { key: "red_salud", label: "Red de salud", required: true },
    { key: "municipio", label: "Municipio", required: true },
    { key: "localidad", label: "Localidad" }, { key: "direccion", label: "Direccion" },
    { key: "nivel", label: "Nivel" }, { key: "tipo", label: "Tipo" },
    { key: "latitud", label: "Latitud", type: "number" }, { key: "longitud", label: "Longitud", type: "number" },
  ];

  return (
    <PageContainer>
      <Stack spacing={2}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between" }}>
          <Stack><Typography variant="h5" sx={{ fontWeight: 800 }}>Centros de salud</Typography><Typography variant="body2" color="text.secondary">Catalogo RUES utilizado por la aplicacion movil.</Typography></Stack>
          <Stack direction="row" spacing={1}><TextField size="small" label="Buscar" value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} /><Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Nuevo</Button></Stack>
        </Stack>
        {error ? <Alert severity="error" onClose={() => setError("")}>{error}</Alert> : null}
        <Paper variant="outlined">
          {loading ? <Stack sx={{ alignItems: "center", py: 6 }}><CircularProgress /></Stack> : (
            <TableContainer><Table size="small">
              <TableHead><TableRow><TableCell>RUES</TableCell><TableCell>Nombre</TableCell><TableCell>Red</TableCell><TableCell>Municipio</TableCell><TableCell>Nivel</TableCell><TableCell>Activo</TableCell><TableCell align="right">Acciones</TableCell></TableRow></TableHead>
              <TableBody>{rows.map((row) => <TableRow key={row.uuid}>
                <TableCell>{row.codigo_rues}</TableCell><TableCell sx={{ fontWeight: 700 }}>{row.nombre}</TableCell><TableCell>{row.red_salud}</TableCell><TableCell>{row.municipio}</TableCell><TableCell>{row.nivel || "-"}</TableCell><TableCell><Switch checked={row.activo} disabled /></TableCell>
                <TableCell align="right"><Tooltip title="Editar"><IconButton onClick={() => openEdit(row)}><EditIcon /></IconButton></Tooltip><Tooltip title="Desactivar"><IconButton color="error" onClick={() => deactivate(row)}><DeleteOutlineIcon /></IconButton></Tooltip></TableCell>
              </TableRow>)}</TableBody>
            </Table></TableContainer>
          )}
          <TablePagination component="div" count={count} page={page} rowsPerPage={rowsPerPage} onPageChange={(_event, value) => setPage(value)} onRowsPerPageChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(0); }} rowsPerPageOptions={[5, 10, 25]} />
        </Paper>
      </Stack>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{editing ? "Editar centro de salud" : "Nuevo centro de salud"}</DialogTitle>
        <DialogContent dividers>
          <Stack direction={{ xs: "column", sm: "row" }} useFlexGap spacing={2} sx={{ flexWrap: "wrap" }}>
            {fields.map((field) => <TextField key={field.key} label={field.label} required={field.required} type={field.type} value={form[field.key] ?? ""} onChange={(event) => setField(field.key, field.type === "number" ? (event.target.value === "" ? null : Number(event.target.value)) : event.target.value)} sx={{ flex: "1 1 300px" }} />)}
            <Stack direction="row" sx={{ alignItems: "center" }}><Switch checked={form.activo} onChange={(_event, checked) => setField("activo", checked)} /><Typography>Activo</Typography></Stack>
          </Stack>
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancelar</Button><Button variant="contained" disabled={saving} onClick={save}>{saving ? "Guardando..." : "Guardar"}</Button></DialogActions>
      </Dialog>
    </PageContainer>
  );
};
