import type { ReactElement, ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import { BottomTabBar } from '../components/BottomTabBar';
import { PageContainer } from '../layouts/PageContainer';
import { coloresTriaje } from '../theme/colors';
import { radius, spacing } from '../theme/tokens';

type NivelTriaje = {
  numero: string;
  titulo: string;
  /** Etiqueta breve de la insignia: el tiempo de espera del nivel. */
  espera: string;
  color: (typeof coloresTriaje)[keyof typeof coloresTriaje];
  texto: string;
};

const niveles: NivelTriaje[] = [
  {
    numero: '1',
    titulo: 'Resucitacion',
    espera: 'Inmediata',
    color: coloresTriaje.resucitacion,
    texto:
      'Atencion al paciente en condiciones que amenazan la vida, requiriendo una intervencion medica inmediata. Algunos ejemplos son: personas con dificultad respiratoria severa, estado de inconsciencia, convulsiones o ausencia de signos vitales.',
  },
  {
    numero: '2',
    titulo: 'Emergencia',
    espera: '10-20 min',
    color: coloresTriaje.emergencia,
    texto:
      'Vigilancia del paciente que puede respirar por si mismo, esta consciente, pero tiene un problema que amenaza la vida o perdida de una extremidad u organo. Se atiende a personas agitadas, con dolor severo y afecciones en las cuales el tiempo es critico para iniciar el tratamiento.',
  },
  {
    numero: '3',
    titulo: 'Urgencia',
    espera: 'Hasta 1 hora',
    color: coloresTriaje.urgencia,
    texto:
      'Cuidado del paciente estable en condiciones que pueden progresar hacia una emergencia. Se tratan molestias que interfieren en el trabajo o las actividades cotidianas, perdidas de sangre y dolor moderado.',
  },
  {
    numero: '4',
    titulo: 'Urgencia menor',
    espera: 'Hasta 2 horas',
    color: coloresTriaje.urgenciaMenor,
    texto:
      'Atencion al paciente en condiciones relacionadas con su edad, pero con angustia, deterioro potencial o sintomas que disminuiran con la intervencion medica o lo tranquilizaran dentro de 1 o 2 horas.',
  },
  {
    numero: '5',
    titulo: 'Sin urgencia',
    espera: 'Hasta 4 horas',
    color: coloresTriaje.sinUrgencia,
    texto:
      'Atencion al paciente en condiciones que pueden ser agudas, pero que no comprometen su estado general y no representan un riesgo evidente. Tambien se valoran problemas cronicos sin evidencia de deterioro.',
  },
];

const DIAMETRO = 34;

const Definicion = ({ titulo, color, colorTexto, children }: { titulo: string; color: string; colorTexto: string; children: ReactNode }) => (
  <Box
    sx={{
      flex: 1,
      borderRadius: `${radius.md}px`,
      bgcolor: 'app.surface',
      border: 1,
      borderColor: 'divider',
      // La franja de color va arriba, como en la referencia.
      borderTop: 4,
      borderTopColor: color,
      p: `${spacing.md}px`,
    }}
  >
    <Typography sx={{ fontWeight: 600, fontSize: 18, lineHeight: '24px', color: colorTexto }}>{titulo}</Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mt: `${spacing.xs}px` }}>
      {children}
    </Typography>
  </Box>
);

export const InformacionPage = (): ReactElement => (
  <PageContainer conBarraInferior>
    <Box sx={{ px: `${spacing.xl}px`, pt: `${spacing.xl}px` }}>
      <Typography variant="caption" component="p" sx={{ color: 'text.secondary', letterSpacing: 1.4, textAlign: 'center' }}>
        REFERENCIA CLINICA
      </Typography>
      <Typography variant="h1" sx={{ mt: `${spacing.xs}px`, textAlign: 'center' }}>
        Triage Hospitalario
      </Typography>
      <Typography color="text.secondary" sx={{ mt: `${spacing.md}px`, textAlign: 'center' }}>
        Sistema de seleccion y clasificacion de pacientes en los servicios de urgencia, segun sus necesidades terapeuticas y los
        recursos disponibles.
      </Typography>

      <Box sx={{ mt: `${spacing.xl}px`, display: 'flex', gap: `${spacing.md}px` }}>
        {/* Variantes oscuras: primary y secondary no llegan a AA como texto. */}
        <Definicion titulo="Urgencias" color="primary.main" colorTexto="primary.dark">
          Requiere <Box component="strong" sx={{ color: 'text.primary' }}>asistencia medica</Box> pronta, sin riesgo de vida.
        </Definicion>
        <Definicion titulo="Emergencias" color="secondary.main" colorTexto="secondary.dark">
          Requiere <Box component="strong" sx={{ color: 'text.primary' }}>decisiones inmediatas</Box> por riesgo de vida.
        </Definicion>
      </Box>

      <Typography variant="caption" component="h2" sx={{ mt: `${spacing.xl}px`, mb: `${spacing.md}px`, color: 'text.secondary', letterSpacing: 1.2 }}>
        DE MAYOR A MENOR PRIORIDAD
      </Typography>

      <Box component="ol" sx={{ position: 'relative', m: 0, p: 0, listStyle: 'none' }}>
        {/* Hilo vertical que enlaza los niveles, por detras de los circulos. */}
        <Box aria-hidden sx={{ position: 'absolute', left: DIAMETRO / 2 - 1, top: DIAMETRO, bottom: DIAMETRO / 2, width: 2, bgcolor: 'divider' }} />
        {niveles.map((nivel) => (
          <Box component="li" key={nivel.numero} sx={{ display: 'flex', alignItems: 'flex-start', gap: `${spacing.md}px`, mb: `${spacing.md}px` }}>
            <Box
              sx={{
                width: DIAMETRO,
                height: DIAMETRO,
                borderRadius: '50%',
                bgcolor: nivel.color.fondo,
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
                position: 'relative',
              }}
            >
              {/* 20px en negrita cuenta como texto grande, que solo pide 3.0 de contraste. */}
              <Typography sx={{ fontWeight: 700, fontSize: 20, lineHeight: '24px', color: nivel.color.textoOscuro ? '#17262A' : '#FFFFFF' }}>{nivel.numero}</Typography>
            </Box>
            <Box sx={{ flex: 1, borderRadius: `${radius.md}px`, bgcolor: 'app.surface', border: 1, borderColor: 'divider', p: `${spacing.lg}px` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: `${spacing.sm}px` }}>
                <Typography component="h3" sx={{ fontWeight: 600, fontSize: 16 }}>
                  {nivel.titulo}
                </Typography>
                <Box sx={{ borderRadius: `${radius.pill}px`, px: `${spacing.md}px`, py: '4px', bgcolor: nivel.color.tinte }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: nivel.color.texto, whiteSpace: 'nowrap' }}>{nivel.espera}</Typography>
                </Box>
              </Box>
              <Typography color="text.secondary" sx={{ mt: `${spacing.sm}px`, fontSize: 14, lineHeight: '20px' }}>
                {nivel.texto}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
    <BottomTabBar active="Information" />
  </PageContainer>
);
