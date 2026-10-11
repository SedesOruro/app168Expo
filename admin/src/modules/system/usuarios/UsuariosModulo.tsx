import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import { Box, Chip, IconButton, Paper, Stack, Tooltip, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DataTable, TableHeader, UpdateParams } from "../../../components/core/DataTable";
import { UsuarioFormularioDialog } from "./UsuarioFormularioDialog";
import { UsuarioFormModel, UsuarioTablaModelo, UsuariosModuloServicio } from "./UsuariosModuloServicio";

const initialParams: UpdateParams<UsuarioTablaModelo> = {
  rows: [],
  count: 0,
  rowsPerPage: 5,
  page: 1,
  order: "asc",
  orderBy: "nombre"
};

export const UsuariosModulo = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [params, setParams] = useState(initialParams);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formModel, setFormModel] = useState<UsuarioFormModel | undefined>();

  const refresh = useCallback(async (nextParams: UpdateParams<UsuarioTablaModelo>) => {
    setLoading(true);
    const result = await UsuariosModuloServicio.obtenerTablaUsuarios({
      rowsPerPage: nextParams.rowsPerPage,
      page: nextParams.page,
      searchText: nextParams.searchText,
      order: nextParams.order,
      orderBy: nextParams.orderBy ? String(nextParams.orderBy) : undefined,
      filters: nextParams.filters
    });
    setParams({ ...nextParams, rows: result.rows || [], count: result.count || 0 });
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh(initialParams);
  }, [refresh]);

  const handleEdit = async (id: string): Promise<void> => {
    const result = await UsuariosModuloServicio.obtenerDatosFormularioUsuario(id);
    if (!result.success || !result.data) {
      enqueueSnackbar(result.msg, { variant: "error" });
      return;
    }
    setFormModel(result.data);
    setFormOpen(true);
  };

  const handleDelete = async (id: string): Promise<void> => {
    const result = await UsuariosModuloServicio.eliminarUsuario(id);
    enqueueSnackbar(result.success ? "Usuario eliminado" : result.msg, { variant: result.success ? "success" : "error" });
    if (result.success) refresh(params);
  };

  const handleActive = async (row: UsuarioTablaModelo): Promise<void> => {
    const result = await UsuariosModuloServicio.actualizarEstadoUsuario(row.id, !row.activo);
    enqueueSnackbar(result.success ? "Estado actualizado" : result.msg, { variant: result.success ? "success" : "error" });
    if (result.success) refresh(params);
  };

  const headers = useMemo<TableHeader<UsuarioTablaModelo>[]>(
    () => [
      {
        id: "actions",
        label: "Acciones",
        render: (row) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Editar">
              <IconButton size="small" onClick={() => handleEdit(row.id)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={row.activo ? "Desactivar" : "Activar"}>
              <IconButton size="small" color={row.activo ? "success" : "default"} onClick={() => handleActive(row)}>
                {row.activo ? <ToggleOnIcon fontSize="small" /> : <ToggleOffIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar">
              <IconButton size="small" color="error" onClick={() => handleDelete(row.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        )
      },
      { id: "nombre", label: "Nombre completo / CI", sort: true },
      { id: "email", label: "Correo electronico", sort: true },
      { id: "rol", label: "Rol", sort: true },
      {
        id: "estado",
        label: "Estado",
        render: (row) => <Chip size="small" label={row.estado} color={row.estado === "ACTIVO" ? "success" : "warning"} />
      }
    ],
    [params, refresh]
  );

  return (
    <>
      <UsuarioFormularioDialog
        open={formOpen}
        formModel={formModel}
        onCancel={() => setFormOpen(false)}
        onError={(message) => enqueueSnackbar(message, { variant: "error" })}
        onComplete={() => {
          setFormOpen(false);
          enqueueSnackbar(formModel ? "Usuario modificado" : "Usuario creado", { variant: "success" });
          refresh(params);
        }}
      />
      <DataTable
        headers={headers}
        updateParams={params}
        isLoading={loading}
        onUpdate={refresh}
        mobileComponent={(row) => (
          <Paper variant="outlined" square sx={{ p: 1.5, m: 1 }}>
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} sx={{
                justifyContent: "space-between"
              }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" noWrap sx={{
                    fontWeight: 800
                  }}>
                    {row.nombre}
                  </Typography>
                  <Typography variant="caption" noWrap component="div" sx={{
                    color: "text.secondary"
                  }}>
                    {row.email}
                  </Typography>
                </Box>
                <Chip size="small" label={row.estado} color={row.estado === "ACTIVO" ? "success" : "warning"} />
              </Stack>
              <Typography variant="body2" sx={{
                color: "text.secondary"
              }}>
                Rol: {row.rol || "-"}
              </Typography>
              <Stack direction="row" spacing={0.5}>
                <Tooltip title="Editar">
                  <IconButton size="small" onClick={() => handleEdit(row.id)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={row.activo ? "Desactivar" : "Activar"}>
                  <IconButton size="small" color={row.activo ? "success" : "default"} onClick={() => handleActive(row)}>
                    {row.activo ? <ToggleOnIcon fontSize="small" /> : <ToggleOffIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar">
                  <IconButton size="small" color="error" onClick={() => handleDelete(row.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </Paper>
        )}
        onActionAddClick={() => {
          setFormModel(undefined);
          setFormOpen(true);
        }}
      />
    </>
  );
};
