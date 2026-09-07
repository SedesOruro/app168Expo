/**
 * Marcas institucionales que respaldan el servicio.
 *
 * Viven aqui, en un unico modulo, para que la pantalla de presentacion sea el solo
 * sitio de la aplicacion donde aparecen. Dentro de la aplicacion los sellos restan
 * espacio a lo que importa, que es pedir ayuda rapido.
 *
 * Pendiente de recibir el archivo oficial: el escudo del Gobierno Autonomo
 * Departamental de Oruro, que acompanaria al de SEDES en la franja superior.
 */
export const logosInstitucionales = {
  sedes: {
    fuente: require('./sedes.png'),
    titulo: 'SEDES Oruro',
  },
  ccesd: {
    fuente: require('./ccesd.png'),
    titulo: 'Centro Coordinador de Emergencias en Salud Departamental',
  },
} as const;

export type LogoInstitucional = {
  fuente: number;
  titulo: string;
};
