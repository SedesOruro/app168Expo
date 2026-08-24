export type CentroSaludSQLModelData = {
  id: number;
  uuid: string;
  codigo_rues: string;
  departamento: string;
  red_salud: string;
  municipio: string;
  nombre: string;
  latitud?: number | null;
  longitud?: number | null;
  activo: boolean;
};
