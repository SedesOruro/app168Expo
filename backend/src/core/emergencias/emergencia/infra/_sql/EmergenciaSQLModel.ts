export type EmergenciaSQLModelData = {
  id: number;
  uuid: string;
  codigo_publico: string;
  idempotency_key: string;
  usuario_id: number;
  tipo_emergencia_id: number;
  estado_id: number;
  gravedad?: string | null;
  puntaje_triage: number;
  descripcion?: string | null;
  latitud: number;
  longitud: number;
  reportada_at: Date;
};
