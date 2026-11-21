/** Rutas de la PWA. Equivalen a las pantallas del stack de la app movil. */
export const rutas = {
  login: '/login',
  registro: '/registro',
  inicio: '/',
  triaje: '/triaje',
  seguimiento: '/seguimiento',
  evidencias: '/evidencias',
  centrosSalud: '/centros-salud',
  informacion: '/informacion',
  perfil: '/perfil',
  perfilEditar: '/perfil/editar',
  cambiarContrasena: '/perfil/contrasena',
  historial: '/historial',
} as const;

/** `/seguimiento/:uuid` y `/evidencias/:uuid`: el uuid es opcional, como en la app. */
export const conUuid = (ruta: string, uuid?: string | null): string => (uuid ? `${ruta}/${uuid}` : ruta);
