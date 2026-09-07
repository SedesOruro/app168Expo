/**
 * Marcas institucionales que respaldan el servicio.
 *
 * Viven aqui, en un unico modulo, para que la pantalla de presentacion sea el solo
 * sitio de la aplicacion donde aparecen. Dentro de la aplicacion los sellos restan
 * espacio a lo que importa, que es pedir ayuda rapido.
 *
 * Pendientes de recibir los archivos oficiales: el escudo del Gobierno Autonomo
 * Departamental de Oruro y el sello del Centro Coordinador de Emergencias en Salud
 * Departamental (C.C.E.S-D). Cuando esten, se anaden aqui y la pantalla los coloca
 * sin mas cambios.
 */
export const logosInstitucionales = {
  sedes: {
    fuente: require('./sedes.png'),
    titulo: 'SEDES Oruro',
  },
  coordinacionRedes: {
    fuente: require('./coordinacion-redes.png'),
    titulo: 'Coordinacion Departamental de Redes de Salud',
  },
} as const;

export type LogoInstitucional = {
  fuente: number;
  titulo: string;
};
