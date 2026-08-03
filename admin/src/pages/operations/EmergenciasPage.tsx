import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { PageContainer } from "../../layouts/PageContainer";
import { EmergencyRow, OperationsService } from "../../services/operations/OperationsService";

type StatusOption = { id: number; codigo: string; nombre: string };
type OperatorOption = { id: string; fullname: string; nombre: string; celular: string };

export const EmergenciasPage = () => {
  const [rows, setRows] = useState<EmergencyRow[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<EmergencyRow | null>(null);
  const [statuses, setStatuses] = useState<StatusOption[]>([]);
  const [operators, setOperators] = useState<OperatorOption[]>([]);
  const [statusCode, setStatusCode] = useState("");
  const [operatorId, setOperatorId] = useState("");
  const [observation, setObservation] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await OperationsService.emergencies({
      page: page + 1,
      rowsPerPage,
      searchText: search,
    });
    if (result.success) {
      setRows(result.rows || []);
      setCount(result.count || 0);
      setError("");
    } else setError(result.msg);
    setLoading(false);
  }, [page, rowsPerPage, search]);

  useEffect(() => { load(); }, [load]);

  const openDetail = async (row: EmergencyRow) => {
    setSelected(row);
    setStatusCode(row.estado?.codigo || "");
    setOperatorId(row.operador?.id || "");
    const [detail, statusResult, operatorResult] = await Promise.all([
      OperationsService.emergency(row.uuid),
      OperationsService.statuses(),
      OperationsService.operators(),
    ]);
    if (detail.success && detail.data) {
      setSelected(detail.data);
      setStatusCode(detail.data.estado?.codigo || "");
      setOperatorId(detail.data.operador?.id || "");
    }
    if (statusResult.success) setStatuses(statusResult.data || []);
    if (operatorResult.success) setOperators(operatorResult.data || []);
  };

  const updateEmergency = async () => {
    if (!selected) return;
    setSaving(true);
    const result = await OperationsService.updateEmergency(selected.uuid, {
      statusCode,
      operatorId: operatorId || null,
      observation,
    });
    setSaving(false);
    if (!result.success) {
      setError(result.msg);
      return;
    }
    setSelected(null);
    setObservation("");
    await load();
  };

  return (
    <PageContainer>
      <Stack spacing={2}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>Emergencias</Typography>
            <Typography variant="body2" color="text.secondary">Seguimiento, asignacion y cambio de estado.</Typography>
          </Box>
          <TextField
            size="small"
            label="Buscar codigo o gravedad"
            value={search}
            onChange={(event) => { setPage(0); setSearch(event.target.value); }}
          />
        </Stack>
        {error ? <Alert severity="error">{error}</Alert> : null}
        <Paper variant="outlined">
          {loading ? <Stack sx={{ alignItems: "center", py: 6 }}><CircularProgress /></Stack> : (
            <TableContainer>
              <Table size="small">
                <TableHead><TableRow>
                  <TableCell>Codigo</TableCell><TableCell>Ciudadano</TableCell><TableCell>Tipo</TableCell>
                  <TableCell>Gravedad</TableCell><TableCell>Estado</TableCell><TableCell>Fecha</TableCell>
                </TableRow></TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.uuid} hover onClick={() => openDetail(row)} sx={{ cursor: "pointer" }}>
                      <TableCell sx={{ fontWeight: 800 }}>{row.codigo_publico}</TableCell>
                      <TableCell>{row.ciudadano?.perfil ? `${row.ciudadano.perfil.nombres} ${row.ciudadano.perfil.apellidos}` : row.ciudadano?.email}</TableCell>
                      <TableCell>{row.tipo?.nombre || "-"}</TableCell>
                      <TableCell>{row.gravedad || "-"}</TableCell>
                      <TableCell><Chip size="small" label={row.estado?.nombre || "Sin estado"} color={row.estado?.es_final ? "success" : "warning"} /></TableCell>
                      <TableCell>{new Date(row.created_at).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          <TablePagination
            component="div" count={count} page={page} rowsPerPage={rowsPerPage}
            onPageChange={(_event, value) => setPage(value)}
            onRowsPerPageChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(0); }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Paper>
      </Stack>

      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} fullWidth maxWidth="md">
        <DialogTitle>{selected?.codigo_publico || "Detalle de emergencia"}</DialogTitle>
        <DialogContent dividers>
          {selected ? (
            <Stack spacing={2}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
                  <Typography sx={{ fontWeight: 800 }}>Ciudadano</Typography>
                  <Typography>{selected.ciudadano?.perfil ? `${selected.ciudadano.perfil.nombres} ${selected.ciudadano.perfil.apellidos}` : selected.ciudadano?.email}</Typography>
                  <Typography variant="body2">CI: {selected.ciudadano?.perfil?.cedula_identidad || "-"}</Typography>
                  <Typography variant="body2">Telefono: {selected.ciudadano?.telefono || "-"}</Typography>
                </Paper>
                <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
                  <Typography sx={{ fontWeight: 800 }}>Clasificacion</Typography>
                  <Typography>{selected.tipo?.nombre || "-"} | {selected.gravedad || "-"}</Typography>
                  <Typography variant="body2">Estado: {selected.estado?.nombre || "-"}</Typography>
                </Paper>
              </Stack>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <FormControl fullWidth><InputLabel>Estado</InputLabel>
                  <Select label="Estado" value={statusCode} onChange={(event) => setStatusCode(event.target.value)}>
                    {statuses.map((status) => <MenuItem key={status.id} value={status.codigo}>{status.nombre}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl fullWidth><InputLabel>Operador</InputLabel>
                  <Select label="Operador" value={operatorId} onChange={(event) => setOperatorId(event.target.value)}>
                    <MenuItem value="">Sin asignar</MenuItem>
                    {operators.map((operator) => <MenuItem key={operator.id} value={operator.id}>{operator.fullname || operator.nombre}</MenuItem>)}
                  </Select>
                </FormControl>
              </Stack>
              <TextField label="Observacion" multiline minRows={2} value={observation} onChange={(event) => setObservation(event.target.value)} />
              <Typography sx={{ fontWeight: 800 }}>Triage</Typography>
              {(selected.triage || []).map((item) => <Typography key={item.id} variant="body2">{item.pregunta_texto}: <strong>{item.respuesta_texto}</strong></Typography>)}
              <Typography sx={{ fontWeight: 800 }}>Evidencias</Typography>
              {(selected.evidencias || []).map((item) => (
                <Typography key={item.id} variant="body2">
                  {item.tipo}: {item.contenido || (item.archivo_url ? <a href={item.archivo_url} target="_blank" rel="noreferrer">Abrir archivo</a> : "-")}
                </Typography>
              ))}
              {!selected.evidencias?.length ? <Typography variant="body2" color="text.secondary">Sin evidencias.</Typography> : null}
              <Typography sx={{ fontWeight: 800 }}>Historial</Typography>
              {(selected.historial || []).map((item) => <Typography key={item.id} variant="body2">{new Date(item.created_at).toLocaleString()} — {item.estadoNuevo?.nombre || "Actualizacion"} {item.observacion ? `— ${item.observacion}` : ""}</Typography>)}
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Cerrar</Button>
          <Button variant="contained" disabled={saving} onClick={updateEmergency}>{saving ? "Guardando..." : "Guardar cambios"}</Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};
