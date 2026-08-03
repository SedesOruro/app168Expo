import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Box, Chip, IconButton, Paper, Stack, Tooltip, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DataTable, TableHeader, UpdateParams } from "../../../components/core/DataTable";
import { RolFormularioDialog } from "./RolFormularioDialog";
import { RolFormularioModelo, RolTablaModelo, RolesModuloServicio } from "./RolesModuloServicio";

const initialParams: UpdateParams<RolTablaModelo> = {
  rows: [],
  count: 0,
  rowsPerPage: 5,
  page: 1,
  order: "asc",
  orderBy: "nombre"
};

const parsePermisos = (permisos: string): string[] => {
  try {
    return Object.keys(JSON.parse(permisos || "{}"));
  } catch {
    return [];
  }
};

const formatModulos = (modulos: RolTablaModelo["modulos"] = []): string => {
  return modulos.map((item) => item.title || item.name || item.id).filter(Boolean).join(", ");
};

export const RolesModulo = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [params, setParams] = useState(initialParams);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formModel, setFormModel] = useState<RolFormularioModelo | undefined>();

  const refresh = useCallback(async (nextParams: UpdateParams<RolTablaModelo>) => {
    setLoading(true);
    const result = await RolesModuloServicio.obtenerTablaRoles({
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
    const result = await RolesModuloServicio.obtenerDatosFormularioRol(id);
    if (!result.success || !result.data) {
      enqueueSnackbar(result.msg, { variant: "error" });
      return;
    }
    setFormModel(result.data);
    setFormOpen(true);
  };

  const handleDelete = async (id: string): Promise<void> => {
    const result = await RolesModuloServicio.eliminarRol(id);
    enqueueSnackbar(result.success ? "Rol eliminado" : result.msg, { variant: result.success ? "success" : "error" });
    if (result.success) refresh(params);
  };

  const headers = useMemo<TableHeader<RolTablaModelo>[]>(
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
            <Tooltip title="Eliminar">
              <IconButton size="small" color="error" onClick={() => handleDelete(row.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        )
      },
      { id: "nombre", label: "Nombre del rol", sort: true },
      { id: "tipo", label: "Tipo", sort: true },
      {
        id: "permisos",
        label: "Permisos",
        render: (row) => (
          <Stack
            direction="row"
            sx={{
              flexWrap: "wrap",
              gap: 0.5
            }}>
            {parsePermisos(row.permisos).map((permiso) => (
              <Chip key={permiso} size="small" label={permiso} />
            ))}
          </Stack>
        )
      },
      {
        id: "modulos",
        label: "Modulos",
        render: (row) => <Typography variant="body2">{formatModulos(row.modulos)}</Typography>
      }
    ],
    [params, refresh]
  );

  return (
    <>
      <RolFormularioDialog
        open={formOpen}
        formModel={formModel}
        onCancel={() => setFormOpen(false)}
        onError={(message) => enqueueSnackbar(message, { variant: "error" })}
        onComplete={() => {
          setFormOpen(false);
          enqueueSnackbar(formModel ? "Rol modificado" : "Rol creado", { variant: "success" });
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
                    {row.tipo || "Sin tipo"}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={0.5}>
                  <Tooltip title="Editar">
                    <IconButton size="small" onClick={() => handleEdit(row.id)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton size="small" color="error" onClick={() => handleDelete(row.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
              <Stack
                direction="row"
                sx={{
                  flexWrap: "wrap",
                  gap: 0.5
                }}>
                {parsePermisos(row.permisos).map((permiso) => (
                  <Chip key={permiso} size="small" label={permiso} />
                ))}
              </Stack>
              <Typography variant="body2" sx={{
                color: "text.secondary"
              }}>
                Modulos: {formatModulos(row.modulos) || "-"}
              </Typography>
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
