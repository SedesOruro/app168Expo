import { type ReactElement, useEffect, useRef, useState } from 'react';
import { Box, useTheme } from '@mui/material';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { env } from '../config/env';
import type { Coordinates, HealthCenter } from '../services/emergencias/EmergenciasService';
import { coloresMapa } from '../theme/colors';

// MapLibre 6 busca su worker junto a su propio .mjs (import.meta.url). Vite mueve
// la libreria a .vite/deps en desarrollo y a un chunk con hash en el build, asi que
// esa ruta relativa no existe: se le da la URL del worker empaquetado por Vite.
maplibregl.setWorkerUrl(workerUrl);

type Punto = { latitude: number; longitude: number };

type MapaCentrosProps = {
  kmCero: Coordinates;
  ubicacion: Coordinates | null;
  centros: { centro: HealthCenter; punto: Punto }[];
  /** [minLng, minLat, maxLng, maxLat] para encuadrar la ciudad. */
  limites: [number, number, number, number] | null;
  onSeleccionar: (centro: HealthCenter) => void;
};

const circulo = (fondo: string, borde: string, tam: number, svg: string): HTMLElement => {
  const el = document.createElement('div');
  el.style.cssText = `width:${tam}px;height:${tam}px;border-radius:50%;border:3px solid ${borde};background:${fondo};display:grid;place-items:center;box-shadow:0 2px 6px rgba(0,0,0,.3)`;
  el.innerHTML = svg;
  return el;
};

const ESTRELLA = '<svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>';
const GPS =
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8m8.94 3A8.99 8.99 0 0 0 13 3.06V1h-2v2.06A8.99 8.99 0 0 0 3.06 11H1v2h2.06A8.99 8.99 0 0 0 11 20.94V23h2v-2.06A8.99 8.99 0 0 0 20.94 13H23v-2zM12 19a7 7 0 1 1 0-14 7 7 0 0 1 0 14"/></svg>';
const pin = (color: string): string =>
  `<svg width="42" height="42" viewBox="0 0 24 24" fill="${color}"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7m0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5"/></svg>`;

/** Mapa de centros con MapLibre GL JS (equivalente a @maplibre/maplibre-react-native). */
export const MapaCentros = ({ kmCero, ubicacion, centros, limites, onSeleccionar }: MapaCentrosProps): ReactElement => {
  const tema = useTheme();
  const contenedorRef = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<maplibregl.Map | null>(null);
  const [listo, setListo] = useState(false);
  const seleccionarRef = useRef(onSeleccionar);
  seleccionarRef.current = onSeleccionar;

  useEffect(() => {
    if (!contenedorRef.current) return;
    const mapa = new maplibregl.Map({
      container: contenedorRef.current,
      style: env.mapStyleUrl,
      center: [kmCero.longitude, kmCero.latitude],
      zoom: 13,
      attributionControl: { compact: true },
    });
    mapa.addControl(new maplibregl.NavigationControl({ showZoom: false }), 'top-right');
    mapa.on('load', () => setListo(true));
    mapaRef.current = mapa;
    return () => {
      mapa.remove();
      mapaRef.current = null;
    };
  }, [kmCero.latitude, kmCero.longitude]);

  // Marcadores: se recrean cuando cambian los datos.
  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa) return;
    const superficie = tema.palette.app.surface;
    const marcadores: maplibregl.Marker[] = [];

    marcadores.push(
      new maplibregl.Marker({ element: circulo(coloresMapa.usuario, superficie, 30, ESTRELLA), anchor: 'bottom' })
        .setLngLat([kmCero.longitude, kmCero.latitude])
        .addTo(mapa),
    );

    if (ubicacion) {
      marcadores.push(
        new maplibregl.Marker({ element: circulo(coloresMapa.centro, superficie, 34, GPS) }).setLngLat([ubicacion.longitude, ubicacion.latitude]).addTo(mapa),
      );
    }

    for (const { centro, punto } of centros) {
      const el = document.createElement('button');
      el.type = 'button';
      el.setAttribute('aria-label', centro.nombre);
      el.style.cssText = 'background:none;border:0;padding:0;cursor:pointer;line-height:0';
      el.innerHTML = pin(tema.palette.app.accentText);
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        seleccionarRef.current(centro);
      });
      marcadores.push(new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat([punto.longitude, punto.latitude]).addTo(mapa));
    }

    return () => marcadores.forEach((m) => m.remove());
  }, [centros, ubicacion, kmCero, tema.palette.app.surface, tema.palette.app.accentText]);

  useEffect(() => {
    if (!listo || !limites || !mapaRef.current) return;
    mapaRef.current.fitBounds(limites, { padding: 34, duration: 900 });
  }, [limites, listo]);

  return <Box ref={contenedorRef} role="region" aria-label="Mapa de centros de salud" sx={{ height: '48dvh', width: '100%' }} />;
};
