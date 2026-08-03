import {
  Alert,
  Chip,
  CircularProgress,
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
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { PageContainer } from "../../layouts/PageContainer";
import { CitizenRow, OperationsService } from "../../services/operations/OperationsService";

export const CiudadanosPage = () => {
  const [rows, setRows] = useState<CitizenRow[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const result = await OperationsService.citizens({ page: page + 1, rowsPerPage, searchText: search });
    if (result.success) {
      setRows(result.rows || []);
      setCount(result.count || 0);
      setError("");
    } else setError(result.msg);
    setLoading(false);
  }, [page, rowsPerPage, search]);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (row: CitizenRow, active: boolean) => {
    const result = await OperationsService.updateCitizenStatus(row.uuid, active);
    if (!result.success) setError(result.msg);
    else await load();
  };

  return (
    <PageContainer>
      <Stack spacing={2}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between" }}>
          <Stack><Typography variant="h5" sx={{ fontWeight: 800 }}>Ciudadanos</Typography><Typography variant="body2" color="text.secondary">Cuentas registradas desde la aplicacion movil.</Typography></Stack>
          <TextField size="small" label="Buscar correo o telefono" value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} />
        </Stack>
        {error ? <Alert severity="error">{error}</Alert> : null}
        <Paper variant="outlined">
          {loading ? <Stack sx={{ alignItems: "center", py: 6 }}><CircularProgress /></Stack> : (
            <TableContainer><Table size="small">
              <TableHead><TableRow><TableCell>Nombre</TableCell><TableCell>CI</TableCell><TableCell>Correo</TableCell><TableCell>Telefono</TableCell><TableCell>Estado</TableCell><TableCell>Activo</TableCell></TableRow></TableHead>
              <TableBody>{rows.map((row) => (
                <TableRow key={row.uuid}>
                  <TableCell>{row.perfil ? `${row.perfil.nombres} ${row.perfil.apellidos}` : "-"}</TableCell>
                  <TableCell>{row.perfil?.cedula_identidad || "-"}</TableCell>
                  <TableCell>{row.email}</TableCell><TableCell>{row.telefono || "-"}</TableCell>
                  <TableCell><Chip size="small" label={row.estado} color={row.estado === "ACTIVO" ? "success" : "default"} /></TableCell>
                  <TableCell><Switch checked={row.estado === "ACTIVO"} onChange={(_event, checked) => changeStatus(row, checked)} /></TableCell>
                </TableRow>
              ))}</TableBody>
            </Table></TableContainer>
          )}
          <TablePagination component="div" count={count} page={page} rowsPerPage={rowsPerPage} onPageChange={(_event, value) => setPage(value)} onRowsPerPageChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(0); }} rowsPerPageOptions={[5, 10, 25]} />
        </Paper>
      </Stack>
    </PageContainer>
  );
};
