/**
 * Identidad institucional del sistema. Se centraliza aqui para que los textos
 * oficiales no queden dispersos por las pantallas y puedan corregirse en un
 * solo lugar si la institucion cambia su denominacion.
 *
 * Fuente: Servicio Departamental de Salud Oruro (sedesoruro.gob.bo), entidad
 * desconcentrada del Gobierno Autonomo Departamental de Oruro bajo rectoria
 * del Ministerio de Salud y Deportes del Estado Plurinacional de Bolivia.
 */
export const institucion = {
  /** Denominacion completa, para pantallas legales y de informacion. */
  nombreCompleto: 'Servicio Departamental de Salud Oruro',
  /** Sigla de uso corriente. */
  sigla: 'SEDES Oruro',
  /** Entidad de la que depende. */
  entidadSuperior: 'Gobierno Autonomo Departamental de Oruro',
  /** Rectoria nacional del sector. */
  rectoria: 'Ministerio de Salud y Deportes',
  estado: 'Estado Plurinacional de Bolivia',
  departamento: 'Oruro',
  sitioWeb: 'www.sedesoruro.gob.bo',
} as const;

/** Servicio que presta la aplicacion, no la institucion que lo opera. */
export const servicio = {
  nombre: 'Emergencias 168',
  numero: '168',
  central: 'Central 168',
  descripcionCorta: 'Linea gratuita de emergencias medicas del departamento de Oruro',
} as const;

/** Franja de marca: entidades que respaldan el servicio, en orden jerarquico. */
export const franjaInstitucional = [
  {
    id: 'gobernacion',
    titulo: 'GOBIERNO AUTONOMO',
    subtitulo: 'DEPARTAMENTAL',
  },
  {
    id: 'ministerio',
    titulo: 'MINISTERIO DE',
    subtitulo: 'SALUD Y DEPORTES',
  },
  {
    id: 'sedes',
    titulo: 'SEDES',
    subtitulo: 'ORURO',
  },
] as const;
